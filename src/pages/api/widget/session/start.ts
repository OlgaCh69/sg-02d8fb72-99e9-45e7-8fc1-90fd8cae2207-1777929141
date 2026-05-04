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
      visitorId,
      sessionId,
      pageUrl,
      pageTitle,
      referrer,
      device,
      browser,
      consentAnalytics = false,
      consentMemory = false,
    } = req.body;

    if (!visitorId || !sessionId) {
      return res.status(400).json({ error: "visitorId and sessionId required" });
    }

    // 1. Find or create visitor profile
    let profile;
    const { data: existingProfile } = await supabase
      .from("visitor_profiles")
      .select("*")
      .eq("visitor_id", visitorId)
      .single();

    if (existingProfile) {
      // Update last seen
      const { data: updated } = await supabase
        .from("visitor_profiles")
        .update({
          last_seen_at: new Date().toISOString(),
          consent_analytics: consentAnalytics,
          consent_memory: consentMemory,
        })
        .eq("id", existingProfile.id)
        .select()
        .single();
      profile = updated;
    } else {
      // Create new profile
      const { data: created } = await supabase
        .from("visitor_profiles")
        .insert({
          visitor_id: visitorId,
          consent_analytics: consentAnalytics,
          consent_memory: consentMemory,
        })
        .select()
        .single();
      profile = created;
    }

    if (!profile) {
      return res.status(500).json({ error: "Failed to create visitor profile" });
    }

    // 2. Create visitor session
    const { data: session } = await supabase
      .from("visitor_sessions")
      .insert({
        visitor_profile_id: profile.id,
        session_id: sessionId,
        page_url: pageUrl,
        page_title: pageTitle,
        referrer: referrer || null,
        device: device || "unknown",
        browser: browser || "unknown",
      })
      .select()
      .single();

    // 3. Track page_view event (if consent)
    if (consentAnalytics && session) {
      await supabase.from("analytics_events").insert({
        visitor_profile_id: profile.id,
        session_id: session.id,
        event_name: "page_view",
        page_url: pageUrl,
        metadata: { page_title: pageTitle, referrer },
      });
    }

    return res.status(200).json({
      visitorProfileId: profile.id,
      sessionDbId: session?.id,
      leadScore: profile.lead_score,
      leadStatus: profile.lead_status,
    });
  } catch (error) {
    console.error("Session start error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}