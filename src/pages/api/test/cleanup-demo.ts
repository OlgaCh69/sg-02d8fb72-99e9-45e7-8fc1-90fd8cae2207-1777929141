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
    // Delete all demo data (visitor_id starts with "demo_")
    const { data: demoProfiles } = await supabase
      .from("visitor_profiles")
      .select("id")
      .like("visitor_id", "demo_%");

    if (demoProfiles && demoProfiles.length > 0) {
      const profileIds = demoProfiles.map(p => p.id);

      // Delete in order (cascade will handle some)
      await supabase.from("messages").delete().in("conversation_id", 
        (await supabase.from("conversations").select("id").in("visitor_profile_id", profileIds)).data?.map(c => c.id) || []
      );
      await supabase.from("conversation_summaries").delete().in("visitor_profile_id", profileIds);
      await supabase.from("visitor_memory").delete().in("visitor_profile_id", profileIds);
      await supabase.from("conversations").delete().in("visitor_profile_id", profileIds);
      await supabase.from("visitor_sessions").delete().in("visitor_profile_id", profileIds);
      await supabase.from("leads").delete().in("visitor_id", demoProfiles.map(p => `demo_${p.id}`));
      await supabase.from("visitor_profiles").delete().in("id", profileIds);
    }

    return res.status(200).json({
      success: true,
      message: `Cleaned up ${demoProfiles?.length || 0} demo profiles`,
    });
  } catch (error) {
    console.error("Cleanup demo error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}