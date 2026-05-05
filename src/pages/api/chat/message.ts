import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import { calculateConfidence, shouldAnswerWithConfidence, getLowConfidenceFallback } from "./confidence";
import { detectSpam, detectPromptInjection, checkRateLimit } from "../security/check-spam";
import { selectPlaybook } from "../playbooks/execute";
import OpenAI from "openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, conversationId, visitorId, sessionId, pageUrl, pageTitle } = req.body;

    if (!message || !conversationId || !visitorId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. SPAM & ABUSE CHECK
    const isSpam = detectSpam(message);
    const isInjection = detectPromptInjection(message);
    const rateLimitOk = await checkRateLimit(visitorId, "chat_message", 20, 1);

    if (!rateLimitOk) {
      await supabase.from("abuse_reports").insert({
        conversation_id: conversationId,
        abuse_type: "rate_limit",
        message_content: message,
        auto_flagged: true,
      });
      return res.status(429).json({ 
        error: "Too many messages. Please slow down.",
        shouldCaptureLead: true,
      });
    }

    if (isSpam || isInjection) {
      await supabase.from("abuse_reports").insert({
        conversation_id: conversationId,
        abuse_type: isInjection ? "prompt_injection" : "spam",
        message_content: message,
        auto_flagged: true,
      });
      return res.status(200).json({ 
        response: "I'm here to help with genuine questions. Please keep the conversation professional.",
        shouldCaptureLead: false,
      });
    }

    // 2. Get visitor profile
    const { data: profile } = await supabase
      .from("visitor_profiles")
      .select("*")
      .eq("visitor_id", visitorId)
      .single();

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // 2.5 Check if conversation is in live takeover mode
    const { data: conversation } = await supabase
      .from("conversations")
      .select("is_live_takeover, taken_over_by")
      .eq("id", conversationId)
      .single();

    if (conversation?.is_live_takeover) {
      // Admin has taken over - don't send AI response
      return res.status(200).json({
        response: "",
        isTakenOver: true,
        message: "An admin is handling this conversation",
      });
    }

    // 3. Save user message
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: message,
      metadata: { page_url: pageUrl, page_title: pageTitle },
    } as any);

    // 4. Get recent messages (last 6 for context)
    const { data: recentMessages } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(6);

    const last6Messages = recentMessages?.reverse().map(m => `${m.role}: ${m.content}`).join("\n") || "";

    // 5. Get visitor memory (summaries + preferences)
    let memoryContext = "";
    let previousSummary = "";
    if (profile.consent_memory) {
      const { data: summaries } = await supabase
        .from("conversation_summaries")
        .select("summary, intent, service_interest, budget, timeline")
        .eq("visitor_profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (summaries && summaries.length > 0) {
        previousSummary = summaries[0].summary || "";
        memoryContext = `Previous summary: ${summaries[0].summary}\n`;
        if (summaries[0].service_interest) memoryContext += `Service interest: ${summaries[0].service_interest}\n`;
        if (summaries[0].budget) memoryContext += `Budget: ${summaries[0].budget}\n`;
        if (summaries[0].timeline) memoryContext += `Timeline: ${summaries[0].timeline}\n`;
      }

      const { data: memory } = await supabase
        .from("visitor_memory")
        .select("key, value")
        .eq("visitor_profile_id", profile.id)
        .eq("is_active", true);

      if (memory && memory.length > 0) {
        memoryContext += "\nUser preferences:\n";
        memory.forEach(m => {
          memoryContext += `${m.key}: ${m.value}\n`;
        });
      }
    }

    // 6. Search knowledge base
    const knowledgeResponse = await fetch(`${req.headers.origin || "http://localhost:3000"}/api/knowledge/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: message }),
    });
    const knowledgeData = await knowledgeResponse.json();
    const knowledgeChunks = knowledgeData.results || [];
    let knowledgeContext = "";
    let sourceType: string | null = null;
    let sourceUrl: string | null = null;

    if (knowledgeChunks.length > 0) {
      knowledgeContext = "Relevant knowledge:\n";
      knowledgeChunks.forEach((chunk: any) => {
        knowledgeContext += `- ${chunk.content.substring(0, 200)}...\n`;
        if (!sourceType) {
          sourceType = chunk.source_type;
          sourceUrl = chunk.url || chunk.title;
        }
      });
    }

    // 7. Check for playbook match
    const lowerMessage = message.toLowerCase();
    let intent = "general_inquiry";
    if (lowerMessage.includes("price") || lowerMessage.includes("cost")) intent = "pricing_inquiry";
    if (lowerMessage.includes("quote") || lowerMessage.includes("demo") || lowerMessage.includes("call")) intent = "demo_request";
    if (lowerMessage.includes("book") || lowerMessage.includes("schedule")) intent = "booking_request";
    if (lowerMessage.includes("buy") || lowerMessage.includes("purchase")) intent = "purchase_intent";
    if (lowerMessage.includes("help") || lowerMessage.includes("support") || lowerMessage.includes("problem")) intent = "support_request";

    const playbook = await selectPlaybook(intent);
    let playbookGuidance = "";
    if (playbook) {
      playbookGuidance = `\nFollow this conversation flow: ${JSON.stringify(playbook.flow_steps || [])}\n`;
      
      // Create playbook execution
      await supabase.from("playbook_executions").insert({
        conversation_id: conversationId,
        playbook_id: playbook.id,
        current_step: 0,
        status: "active",
      });
    }

    // 8. GET ACTIVE PROMPT TEMPLATE from Prompt Tuning system
    const promptResponse = await fetch(`${req.headers.origin || "http://localhost:3000"}/api/prompts/get-active?category=system`);
    let promptTemplate = "";
    let temperature = 0.7;
    let maxTokens = 500;
    let systemInstructions = "";

    if (promptResponse.ok) {
      const promptData = await promptResponse.json();
      promptTemplate = promptData.prompt_content;
      temperature = promptData.temperature;
      maxTokens = promptData.max_tokens;
      systemInstructions = promptData.system_instructions;
    } else {
      // Fallback to default prompt if no active template
      promptTemplate = `You are an AI assistant for a business.

Your goals:
- Help website visitors clearly and professionally.
- Answer using approved website knowledge when available.
- Qualify leads naturally.
- Capture contact details when useful.
- Recommend relevant services/products.
- Avoid making up facts.
- If unsure, say you are not sure and offer to collect details for human follow-up.
- Keep answers concise, friendly, and conversion-focused.

Page URL: {{page_url}}
Page title: {{page_title}}
Lead score: {{lead_score}}
Lead status: {{lead_status}}

USER MEMORY:
{{user_memory}}

RECENT CHAT:
{{recent_messages}}

RELEVANT KNOWLEDGE:
{{knowledge_chunks}}

CURRENT USER MESSAGE:
{{user_message}}`;
    }

    // 9. Replace template variables
    let processedPrompt = promptTemplate;
    processedPrompt = processedPrompt.replace(/\{\{page_url\}\}/g, pageUrl || "unknown");
    processedPrompt = processedPrompt.replace(/\{\{page_title\}\}/g, pageTitle || "unknown");
    processedPrompt = processedPrompt.replace(/\{\{visitor_name\}\}/g, profile.name || "");
    processedPrompt = processedPrompt.replace(/\{\{lead_score\}\}/g, String(profile.lead_score || 0));
    processedPrompt = processedPrompt.replace(/\{\{lead_status\}\}/g, profile.lead_status || "UNKNOWN");
    processedPrompt = processedPrompt.replace(/\{\{user_memory\}\}/g, memoryContext);
    processedPrompt = processedPrompt.replace(/\{\{recent_messages\}\}/g, last6Messages);
    processedPrompt = processedPrompt.replace(/\{\{knowledge_chunks\}\}/g, knowledgeContext);
    processedPrompt = processedPrompt.replace(/\{\{user_message\}\}/g, message);

    // Load AI configuration
    const { data: aiConfig } = await supabase
      .from("ai_config")
      .select("*")
      .eq("is_active", true)
      .single();

    const systemPrompt = aiConfig?.system_prompt || 
      'You are a helpful AI assistant for a business. Answer questions professionally and concisely.';
    
    const customInstructions = aiConfig?.custom_instructions || '';
    const fullSystemPrompt = `${systemPrompt}\n\n${customInstructions}`.trim();

    // Call OpenAI
    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: fullSystemPrompt,
        },
        ...(recentMessages || []).map((msg: any) => ({
          role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
          content: String(msg.content),
        })),
        { role: "user", content: message },
      ],
      temperature: aiConfig?.temperature || 0.7,
      max_tokens: aiConfig?.max_tokens || 200,
    });

    const aiResponse = completion.choices[0]?.message?.content || "";

    // 11. Calculate confidence score
    const confidence = calculateConfidence({
      knowledgeMatches: knowledgeChunks.length,
      hasExactMatch: knowledgeChunks.length > 0,
      sourceType: sourceType || null,
      answerLength: aiResponse.length,
    });

    const shouldAnswer = shouldAnswerWithConfidence(confidence);
    const finalResponse = shouldAnswer ? aiResponse : getLowConfidenceFallback();

    // 12. Save assistant message
    const { data: assistantMsg } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: finalResponse,
      metadata: { 
        source_type: sourceType, 
        source_url: sourceUrl,
        confidence: confidence,
        intent: intent,
        temperature: temperature,
        max_tokens: maxTokens,
      },
    } as any).select().single();

    // 13. Save answer confidence for quality control
    if (assistantMsg) {
      await supabase.from("message_confidence").insert({
        message_id: assistantMsg.id,
        confidence_score: confidence,
        source_type: sourceType,
        source_url: sourceUrl,
        knowledge_match_count: knowledgeChunks.length,
      });
    }

    // 14. Update lead score
    let scoreChange = 0;
    if (intent === "pricing_inquiry") scoreChange += 20;
    if (intent === "demo_request" || intent === "booking_request") scoreChange += 30;
    if (intent === "purchase_intent") scoreChange += 30;
    if (profile.email || profile.phone) scoreChange += 25;

    if (scoreChange > 0) {
      const oldScore = profile.lead_score || 0;
      const newScore = oldScore + scoreChange;
      
      const oldStatus = profile.lead_status || "UNKNOWN";
      let newStatus: "HOT" | "WARM" | "COLD" | "UNKNOWN" = "UNKNOWN";
      if (newScore >= 70) newStatus = "HOT";
      else if (newScore >= 35) newStatus = "WARM";
      else if (newScore > 0) newStatus = "COLD";

      await supabase
        .from("visitor_profiles")
        .update({ lead_score: newScore, lead_status: newStatus })
        .eq("id", profile.id);

      // Track score history
      if (oldStatus !== newStatus || scoreChange > 0) {
        await supabase.from("lead_score_history").insert({
          visitor_profile_id: profile.id,
          old_score: oldScore,
          new_score: newScore,
          old_status: oldStatus,
          new_status: newStatus,
          reason: `Message interaction: ${intent}`,
        });
      }

      // Notify admin if HOT lead
      if (newStatus === "HOT" && oldStatus !== "HOT") {
        await fetch(`${req.headers.origin || "http://localhost:3000"}/api/notifications/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notificationType: "hot_lead",
            visitorProfileId: profile.id,
            conversationId: conversationId,
            title: "🔥 New HOT Lead!",
            message: `${profile.name || profile.email || "Visitor"} - Score: ${newScore} - Page: ${pageUrl}`,
            metadata: { lead_score: newScore, intent },
          }),
        });
      }
    }

    // 15. Trigger memory extraction in background
    fetch(`${req.headers.origin || "http://localhost:3000"}/api/memory/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        visitorProfileId: profile.id,
        recentMessages: recentMessages?.slice(-10),
      }),
    }).catch(err => console.error("Memory extraction failed:", err));

    // 16. Determine if we should capture lead
    const shouldCaptureLead = 
      !profile.email && 
      (intent === "demo_request" || intent === "pricing_inquiry" || intent === "booking_request") &&
      !shouldAnswer; // Low confidence = ask for contact

    return res.status(200).json({
      response: finalResponse,
      sourceType,
      sourceUrl,
      confidence,
      shouldCaptureLead,
      intent,
    });
  } catch (error) {
    console.error("Chat message error:", error);
    return res.status(500).json({ 
      error: "internal_server_error",
      response: "Sorry, I'm having trouble right now. Please try again.",
    });
  }
}