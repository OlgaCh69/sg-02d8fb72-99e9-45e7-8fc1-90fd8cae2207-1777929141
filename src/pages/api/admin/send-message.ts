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
    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get admin user from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify conversation is taken over by this admin
    const { data: conversation } = await supabase
      .from("conversations")
      .select("is_live_takeover, taken_over_by")
      .eq("id", conversationId)
      .single();

    if (!conversation?.is_live_takeover) {
      return res.status(400).json({ error: "Conversation not in takeover mode" });
    }

    if (conversation.taken_over_by !== session.user.id) {
      return res.status(403).json({ error: "This conversation is taken over by another admin" });
    }

    // Send admin message
    const { data: newMessage } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "assistant",
        content: message,
        sent_by_admin: session.user.id,
        message_type: "admin",
        metadata: { 
          admin_id: session.user.id,
        },
      } as any)
      .select()
      .single();

    // Log message sent
    await supabase.from("live_takeover_logs").insert({
      conversation_id: conversationId,
      admin_id: session.user.id,
      action: "message_sent",
      message_content: message,
    });

    return res.status(200).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}