import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import { findOrCreateUserProfile, getUserMemory, buildMemoryContext } from "@/services/memoryService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, conversationId, visitorId, sessionId, pageUrl, pageTitle } = req.body;

    // 1. Get or create visitor profile
    const profile = await findOrCreateUserProfile({ visitorId });
    if (!profile) {
      return res.status(400).json({ error: "Could not create visitor profile" });
    }

    // 2. Link conversation to profile if not already linked
    const { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (conversation && !conversation.visitor_profile_id) {
      await supabase
        .from("conversations")
        .update({ visitor_profile_id: profile.id })
        .eq("id", conversationId);
    }

    // 3. Save user message
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: message,
      metadata: { page_url: pageUrl, page_title: pageTitle },
    });

    // Track message_sent event
    await supabase.from("analytics_events").insert({
      event_name: "message_sent",
      visitor_profile_id: profile.id,
      conversation_id: conversationId,
      page_url: pageUrl,
      metadata: { role: "user" },
    });

    // 4. Get conversation memory
    const memory = await getUserMemory(profile.id);
    const memoryContext = buildMemoryContext(memory);

    // 5. Get recent messages (last 6 for context)
    const { data: recentMessages } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(6);

    const formattedMessages = (recentMessages || [])
      .reverse()
      .map(m => `${m.role}: ${m.content}`)
      .join("\n");

    // 6. Search knowledge base
    let knowledgeContext = "";
    let sourceUrl = "";
    let sourceType = "";

    const lowerMessage = message.toLowerCase();
    const questionWords = lowerMessage.split(" ").filter((word: string) => word.length > 3);

    // Check manual FAQ first
    const { data: knowledgeBase } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("is_active", true);

    let foundAnswer = false;
    let aiResponse = "";

    if (knowledgeBase && knowledgeBase.length > 0) {
      for (const entry of knowledgeBase) {
        const entryWords = entry.question.toLowerCase().split(" ");
        const matchCount = entryWords.filter((word: string) => 
          lowerMessage.includes(word) && word.length > 3
        ).length;

        if (matchCount >= 2 || lowerMessage.includes(entry.question.toLowerCase())) {
          aiResponse = entry.answer;
          foundAnswer = true;
          sourceType = "knowledge_base";
          sourceUrl = `FAQ: ${entry.question}`;
          break;
        }
      }
    }

    // Check website pages if no FAQ match
    if (!foundAnswer && questionWords.length > 0) {
      const { data: websitePages } = await supabase
        .from("knowledge_sources")
        .select("title, content, url")
        .eq("source_type", "website")
        .eq("approved", true);

      if (websitePages && websitePages.length > 0) {
        let bestScore = 0;
        let bestSnippet = "";
        let bestUrl = "";

        for (const page of websitePages) {
          const contentLower = page.content.toLowerCase();
          let score = 0;
          for (const word of questionWords) {
            if (contentLower.includes(word)) score++;
          }

          if (score > bestScore && score >= 2) {
            bestScore = score;
            const firstWordMatch = questionWords.find(w => contentLower.includes(w)) || questionWords[0];
            const idx = contentLower.indexOf(firstWordMatch);
            const start = Math.max(0, idx - 50);
            const end = Math.min(page.content.length, idx + 250);
            bestSnippet = page.content.substring(start, end).trim();
            bestUrl = page.url;
          }
        }

        if (bestScore > 0) {
          knowledgeContext = bestSnippet;
          sourceUrl = bestUrl;
          sourceType = "website_page";
        }
      }
    }

    // 7. Build AI prompt
    const systemPrompt = `You are an AI assistant. Your goals:
- Help website visitors clearly and professionally.
- Answer using approved website knowledge when available.
- Qualify leads naturally.
- Keep answers concise, friendly, and conversion-focused.
- Do not ask the same qualification question if the answer already exists in memory.
- If unsure, say you are not sure and offer to collect details for human follow-up.

PAGE CONTEXT:
Page URL: ${pageUrl || "Unknown"}
Page title: ${pageTitle || "Unknown"}
Device: ${conversation?.device || "Unknown"}

USER MEMORY:
${memoryContext}

RECENT CHAT:
${formattedMessages}

${knowledgeContext ? `RELEVANT WEBSITE KNOWLEDGE:\n${knowledgeContext}\nSource: ${sourceUrl}\n` : ""}

Keep response under 120 words unless user asks for detail.`;

    // 8. Generate AI response (using knowledge if found, or fallback)
    if (!foundAnswer) {
      if (knowledgeContext) {
        aiResponse = `Based on our website: "${knowledgeContext}..."\n\nSource: ${sourceUrl}`;
      } else {
        aiResponse = "I'm not exactly sure about that. Would you like me to collect your contact details so our team can reach out with a proper answer?";
      }
    }

    // 9. Personalize response with name if available
    if (profile.name && !aiResponse.startsWith(profile.name.split(" ")[0])) {
      const firstName = profile.name.split(" ")[0];
      aiResponse = `${firstName}, ${aiResponse.charAt(0).toLowerCase()}${aiResponse.slice(1)}`;
    }

    // 10. Save assistant message
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: aiResponse,
      metadata: { source_type: sourceType, source_url: sourceUrl },
    });

    // 11. Determine if we should capture lead
    const leadTriggers = ["pricing", "cost", "quote", "demo", "contact", "sales", "buy", "book", "schedule"];
    const shouldCaptureLead = leadTriggers.some(trigger => lowerMessage.includes(trigger)) || !foundAnswer;

    // 12. Calculate lead score update
    let scoreChange = 0;
    if (lowerMessage.includes("price") || lowerMessage.includes("cost")) scoreChange += 20;
    if (lowerMessage.includes("quote") || lowerMessage.includes("demo")) scoreChange += 30;
    if (lowerMessage.includes("buy") || lowerMessage.includes("purchase")) scoreChange += 30;
    if (profile.email || profile.phone) scoreChange += 25;

    if (scoreChange > 0) {
      const newScore = (profile.lead_score || 0) + scoreChange;
      let newStatus: "HOT" | "WARM" | "COLD" | "UNKNOWN" = "UNKNOWN";
      if (newScore >= 70) newStatus = "HOT";
      else if (newScore >= 35) newStatus = "WARM";
      else if (newScore > 0) newStatus = "COLD";

      await supabase
        .from("visitor_profiles")
        .update({ lead_score: newScore, lead_status: newStatus })
        .eq("id", profile.id);
    }

    return res.status(200).json({
      response: aiResponse,
      shouldCaptureLead,
      sourceUrl,
      sourceType,
    });
  } catch (error) {
    console.error("Chat message API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      response: "Sorry, I'm having trouble right now. Please try again.",
    });
  }
}