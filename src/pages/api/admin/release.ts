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
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: "Missing conversationId" });
    }

    // Get admin user from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Release conversation
    await supabase
      .from("conversations")
      .update({
        is_live_takeover: false,
        released_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    // Log release action
    await supabase.from("live_takeover_logs").insert({
      conversation_id: conversationId,
      admin_id: session.user.id,
      action: "release",
    });

    // Send system message to visitor
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: "This conversation has been handed back to our AI assistant. I'm still here if you need anything!",
      message_type: "system",
      metadata: { 
        system_event: "release",
      },
    } as any);

    return res.status(200).json({
      success: true,
      message: "Conversation released successfully",
    });
  } catch (error) {
    console.error("Release error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}