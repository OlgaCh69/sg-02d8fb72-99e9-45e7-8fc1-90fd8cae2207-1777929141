import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import { findOrCreateUserProfile, generateConversationSummary, storeConversationSummary } from "@/services/memoryService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { conversationId, visitorId } = req.body;

    if (!conversationId || !visitorId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the user profile
    const profile = await findOrCreateUserProfile({ visitorId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Fetch messages for this conversation
    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("timestamp", { ascending: true });

    if (msgError || !messages || messages.length === 0) {
      return res.status(200).json({ success: true, note: "No messages to summarize" });
    }

    // Generate and store the summary
    const summary = await generateConversationSummary(conversationId, messages);
    if (summary) {
      await storeConversationSummary(conversationId, profile.id, summary);
    }

    return res.status(200).json({ success: true, summary });
  } catch (error) {
    console.error("Summarization error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}