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
    const { message, conversationId, visitorId } = req.body;
    const lowerMessage = message.toLowerCase();
    const questionWords = lowerMessage.split(" ").filter((word: string) => word.length > 3);

    // 1. AI Memory Context
    const profile = await findOrCreateUserProfile({ visitorId });
    let memoryContext = "";
    let userName = "";

    if (profile) {
      // Link conversation to profile
      await supabase
        .from("conversations")
        .update({ visitor_profile_id: profile.id })
        .eq("id", conversationId);

      const memory = await getUserMemory(profile.id);
      memoryContext = buildMemoryContext(memory);
      if (profile.name) {
        userName = profile.name;
      }
    }

    // Default uncertainty fallback
    let response = "I'm not exactly sure about that. Would you like me to collect your contact details so our human team can reach out to you with a proper answer?";
    let shouldCaptureLead = true; 
    let foundAnswer = false;
    let sourceUrl = "";
    let sourceType = "";

    // 2. Check Knowledge Base first
    const { data: knowledgeBase } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("is_active", true);

    if (knowledgeBase && knowledgeBase.length > 0) {
      for (const entry of knowledgeBase) {
        const entryWords = entry.question.toLowerCase().split(" ");
        const matchCount = entryWords.filter((word: string) => 
          lowerMessage.includes(word) && word.length > 3
        ).length;

        if (matchCount >= 2 || lowerMessage.includes(entry.question.toLowerCase())) {
          response = entry.answer;
          foundAnswer = true;
          shouldCaptureLead = false;
          sourceType = "knowledge_base";
          sourceUrl = `FAQ: ${entry.question}`;
          break;
        }
      }
    }

    // 3. Check approved Website Pages if no KB match
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
            // Extract a relevant snippet around the match
            const firstWordMatch = questionWords.find(w => contentLower.includes(w)) || questionWords[0];
            const idx = contentLower.indexOf(firstWordMatch);
            const start = Math.max(0, idx - 50);
            const end = Math.min(page.content.length, idx + 250);
            bestSnippet = page.content.substring(start, end).trim();
            bestUrl = page.url;
          }
        }

        if (bestScore > 0) {
          response = `Based on our website: "...${bestSnippet}..."\n\nSource: ${bestUrl}`;
          foundAnswer = true;
          shouldCaptureLead = false;
          sourceType = "website_page";
          sourceUrl = bestUrl;
        }
      }
    }

    // 4. Lead intent overrides
    const leadTriggers = ["pricing", "cost", "quote", "demo", "contact", "sales", "buy"];
    if (leadTriggers.some(trigger => lowerMessage.includes(trigger))) {
      shouldCaptureLead = true;
      if (!foundAnswer) {
        response = "I can definitely help you with that! Let me collect your contact details so our team can reach out immediately.";
      }
    }

    // 5. Personalize Response
    if (userName) {
      // Simply prefix with name to show memory is working
      const firstName = userName.split(" ")[0];
      if (foundAnswer && !response.startsWith(firstName)) {
        response = `${firstName}, ${response.charAt(0).toLowerCase()}${response.slice(1)}`;
      } else if (!foundAnswer && !response.startsWith(firstName)) {
        response = `${firstName}, ${response.charAt(0).toLowerCase()}${response.slice(1)}`;
      }
    } else if (memoryContext.length > 0 && !foundAnswer) {
      // Acknowledge returning user
      response = `Welcome back! ${response}`;
    }

    return res.status(200).json({ 
      response,
      shouldCaptureLead,
      sourceUrl,
      sourceType
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      response: "Sorry, I'm having trouble right now. Please try again."
    });
  }
}