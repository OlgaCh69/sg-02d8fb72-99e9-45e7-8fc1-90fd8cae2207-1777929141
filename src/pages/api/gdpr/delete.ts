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
    const { visitorId, email, adminConfirmed } = req.body;

    if (!adminConfirmed) {
      return res.status(400).json({ error: "Admin confirmation required" });
    }

    if (!visitorId && !email) {
      return res.status(400).json({ error: "visitorId or email required" });
    }

    // Find profile
    let query = supabase.from("visitor_profiles").select("id, visitor_id");
    if (email) {
      query = query.eq("email", email);
    } else {
      query = query.eq("visitor_id", visitorId);
    }

    const { data: profile } = await query.single();

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Cascade delete (RLS policies handle most, but explicit for safety)
    await Promise.all([
      supabase.from("visitor_sessions").delete().eq("visitor_profile_id", profile.id),
      supabase.from("conversation_summaries").delete().eq("visitor_profile_id", profile.id),
      supabase.from("visitor_memory").delete().eq("visitor_profile_id", profile.id),
      supabase.from("analytics_events").delete().eq("visitor_profile_id", profile.id),
      supabase.from("lead_score_history").delete().eq("visitor_profile_id", profile.id),
    ]);

    // Delete conversations (messages cascade via FK)
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .eq("visitor_profile_id", profile.id);

    if (conversations && conversations.length > 0) {
      await supabase
        .from("messages")
        .delete()
        .in("conversation_id", conversations.map(c => c.id));
      
      await supabase
        .from("conversations")
        .delete()
        .eq("visitor_profile_id", profile.id);
    }

    // Delete leads
    await supabase.from("leads").delete().eq("visitor_id", profile.visitor_id);

    // Finally delete profile
    await supabase.from("visitor_profiles").delete().eq("id", profile.id);

    return res.status(200).json({ success: true, message: "All visitor data deleted" });
  } catch (error) {
    console.error("GDPR delete error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}