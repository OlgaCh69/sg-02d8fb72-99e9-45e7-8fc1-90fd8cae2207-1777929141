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
    const { visitorId, sessionId, consentMemory, channel, triggerType } = req.body;

    if (!visitorId) {
      return res.status(400).json({ error: "Missing visitorId" });
    }

    // Get visitor profile
    const { data: profile } = await supabase
      .from("visitor_profiles")
      .select("*")
      .eq("visitor_id", visitorId)
      .single();

    // Check business hours
    const { data: businessHours } = await supabase
      .from("business_hours")
      .select("*")
      .eq("is_enabled", true)
      .single();

    let isWorkingHours = true;
    if (businessHours) {
      const now = new Date();
      const currentDay = now.toLocaleLowerCase().split(' ')[0]; // "mon", "tue", etc.
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const dayConfig = (businessHours.hours_config as any)?.[currentDay];
      if (dayConfig && dayConfig.enabled) {
        const [startHour, startMin] = dayConfig.start.split(':').map(Number);
        const [endHour, endMin] = dayConfig.end.split(':').map(Number);
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;
        isWorkingHours = currentTime >= startTime && currentTime <= endTime;
      } else {
        isWorkingHours = false;
      }
    }

    // Create or get active conversation
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("*")
      .eq("visitor_profile_id", profile?.id)
      .eq("status", "open")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingConv) {
      // Load memory if consent
      let userName = null;
      if (consentMemory && profile) {
        const { data: summaries } = await supabase
          .from("conversation_summaries")
          .select("*")
          .eq("visitor_profile_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (summaries && summaries.length > 0) {
          userName = profile.name;
        }
      }

      return res.status(200).json({
        conversationId: existingConv.id,
        returningUser: !!userName,
        userName,
        isWorkingHours,
      });
    }

    // Create new conversation
    const { data: newConv } = await supabase
      .from("conversations")
      .insert({
        visitor_profile_id: profile?.id,
        session_id: sessionId,
        channel: channel || "website",
        status: "open",
      } as any)
      .select()
      .single();

    // Load memory
    let userName = null;
    if (consentMemory && profile) {
      const { data: summaries } = await supabase
        .from("conversation_summaries")
        .select("*")
        .eq("visitor_profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (summaries && summaries.length > 0) {
        userName = profile.name;
      }
    }

    return res.status(200).json({
      conversationId: newConv?.id,
      returningUser: !!userName,
      userName,
      isWorkingHours,
    });
  } catch (error) {
    console.error("Chat start error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}