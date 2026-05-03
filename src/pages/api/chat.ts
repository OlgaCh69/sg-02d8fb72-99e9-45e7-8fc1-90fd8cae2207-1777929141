import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, conversationId, visitorId } = req.body;

    const { data: knowledgeBase } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("is_active", true);

    let response = "I'm not sure about that. Let me connect you with a human agent who can help.";
    let shouldCaptureLead = false;

    if (knowledgeBase && knowledgeBase.length > 0) {
      const lowerMessage = message.toLowerCase();
      
      for (const entry of knowledgeBase) {
        const questionWords = entry.question.toLowerCase().split(" ");
        const matchCount = questionWords.filter(word => 
          lowerMessage.includes(word) && word.length > 3
        ).length;

        if (matchCount >= 2) {
          response = entry.answer;
          break;
        }
      }

      const leadTriggers = ["pricing", "cost", "quote", "demo", "contact", "sales", "buy"];
      if (leadTriggers.some(trigger => lowerMessage.includes(trigger))) {
        shouldCaptureLead = true;
      }
    }

    return res.status(200).json({ 
      response,
      shouldCaptureLead
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      response: "Sorry, I'm having trouble right now. Please try again."
    });
  }
}