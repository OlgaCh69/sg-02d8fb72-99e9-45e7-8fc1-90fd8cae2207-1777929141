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
    const {
      visitorProfileId,
      conversationId,
      followUpType,
      subject,
      message,
      scheduledAt,
    } = req.body;

    if (!visitorProfileId || !followUpType || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create follow-up
    const { data: followUp, error } = await supabase
      .from("follow_ups")
      .insert({
        visitor_profile_id: visitorProfileId,
        conversation_id: conversationId,
        follow_up_type: followUpType,
        subject: subject || null,
        message,
        scheduled_at: scheduledAt || new Date().toISOString(),
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Follow-up creation error:", error);
      return res.status(500).json({ error: "Failed to create follow-up" });
    }

    return res.status(200).json({
      success: true,
      followUp,
    });
  } catch (error) {
    console.error("Follow-up error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}