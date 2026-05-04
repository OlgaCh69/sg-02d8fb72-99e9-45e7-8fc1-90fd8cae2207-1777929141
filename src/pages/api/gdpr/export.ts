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
    const { visitorId, email } = req.body;

    if (!visitorId && !email) {
      return res.status(400).json({ error: "visitorId or email required" });
    }

    // Find profile
    let query = supabase.from("visitor_profiles").select("*");
    if (email) {
      query = query.eq("email", email);
    } else {
      query = query.eq("visitor_id", visitorId);
    }

    const { data: profile } = await query.single();

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Gather all data
    const [
      { data: sessions },
      { data: conversations },
      { data: messages },
      { data: summaries },
      { data: memory },
      { data: events },
      { data: leads },
    ] = await Promise.all([
      supabase.from("visitor_sessions").select("*").eq("visitor_profile_id", profile.id),
      supabase.from("conversations").select("*").eq("visitor_profile_id", profile.id),
      supabase.from("messages").select("*").in("conversation_id", 
        conversations?.map(c => c.id) || []
      ),
      supabase.from("conversation_summaries").select("*").eq("visitor_profile_id", profile.id),
      supabase.from("visitor_memory").select("*").eq("visitor_profile_id", profile.id),
      supabase.from("analytics_events").select("*").eq("visitor_profile_id", profile.id),
      supabase.from("leads").select("*").eq("visitor_id", profile.visitor_id),
    ]);

    const exportData = {
      profile,
      sessions: sessions || [],
      conversations: conversations || [],
      messages: messages || [],
      summaries: summaries || [],
      memory: memory || [],
      events: events || [],
      leads: leads || [],
      exported_at: new Date().toISOString(),
    };

    // Return JSON export
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="visitor-data-${profile.id}.json"`);
    return res.status(200).json(exportData);
  } catch (error) {
    console.error("GDPR export error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}