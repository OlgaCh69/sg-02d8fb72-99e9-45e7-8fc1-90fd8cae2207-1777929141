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

    // Get admin profile
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", session.user.id)
      .single();

    if (!adminProfile) {
      return res.status(404).json({ error: "Admin profile not found" });
    }

    // Check if conversation exists and is active
    const { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (conversation.is_live_takeover) {
      return res.status(400).json({ 
        error: "Conversation already taken over",
        takenOverBy: conversation.taken_over_by,
      });
    }

    // Take over conversation
    await supabase
      .from("conversations")
      .update({
        is_live_takeover: true,
        taken_over_by: adminProfile.id,
        taken_over_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    // Log takeover action
    await supabase.from("live_takeover_logs").insert({
      conversation_id: conversationId,
      admin_id: adminProfile.id,
      action: "takeover",
    });

    // Send system message to visitor
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: `You're now chatting with ${adminProfile.full_name || "a human agent"}. I'm here to help!`,
      message_type: "system",
      metadata: { 
        system_event: "takeover",
        admin_name: adminProfile.full_name,
        admin_id: adminProfile.id,
      },
    } as any);

    return res.status(200).json({
      success: true,
      message: "Conversation taken over successfully",
      adminName: adminProfile.full_name || adminProfile.email,
    });
  } catch (error) {
    console.error("Takeover error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}