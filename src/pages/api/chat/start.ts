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
      sessionDbId,
      channel = "website",
    } = req.body;

    if (!visitorProfileId) {
      return res.status(400).json({ error: "visitorProfileId required" });
    }

    // Create conversation
    const { data: conversation, error } = await supabase
      .from("conversations")
      .insert({
        visitor_profile_id: visitorProfileId,
        session_id: sessionDbId || null,
        channel,
        status: "active",
      })
      .select()
      .single();

    if (error || !conversation) {
      console.error("Conversation creation error:", error);
      return res.status(500).json({ error: "Failed to create conversation" });
    }

    // Load existing memory if consent
    const { data: profile } = await supabase
      .from("visitor_profiles")
      .select("*")
      .eq("id", visitorProfileId)
      .single();

    let memory = null;
    if (profile?.consent_memory) {
      const { data: memoryData } = await supabase
        .from("visitor_memory")
        .select("*")
        .eq("visitor_profile_id", visitorProfileId)
        .eq("is_active", true);

      memory = memoryData || [];
    }

    // Track chat_opened event
    if (profile?.consent_analytics) {
      await supabase.from("analytics_events").insert({
        visitor_profile_id: visitorProfileId,
        session_id: sessionDbId,
        conversation_id: conversation.id,
        event_name: "chat_opened",
        metadata: { channel },
      });

      // Update lead score
      await supabase
        .from("visitor_profiles")
        .update({ lead_score: (profile.lead_score || 0) + 10 })
        .eq("id", visitorProfileId);
    }

    return res.status(200).json({
      conversationId: conversation.id,
      memory,
      profile,
    });
  } catch (error) {
    console.error("Chat start error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}