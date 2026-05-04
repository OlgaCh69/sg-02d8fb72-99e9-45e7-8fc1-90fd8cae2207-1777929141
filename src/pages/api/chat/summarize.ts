import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import { generateConversationSummary, storeConversationSummary } from "@/services/memoryService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { conversationId, visitorId } = req.body;

    // Get conversation and visitor profile
    const { data: conversation } = await supabase
      .from("conversations")
      .select("visitor_profile_id")
      .eq("id", conversationId)
      .single();

    if (!conversation?.visitor_profile_id) {
      return res.status(400).json({ error: "No visitor profile linked" });
    }

    // Get messages from this conversation
    const { data: messages } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "No messages to summarize" });
    }

    // Generate summary
    const summary = await generateConversationSummary(conversationId, messages);
    
    if (summary) {
      await storeConversationSummary(conversationId, conversation.visitor_profile_id, summary);
    }

    return res.status(200).json({ success: true, summary });
  } catch (error) {
    console.error("Summarize error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}