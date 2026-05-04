import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

/**
 * Cleanup endpoint to reset test conversation data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const testVisitorId = "test_visitor_demo";

    // Get test profile
    const { data: profile } = await supabase
      .from("visitor_profiles")
      .select("id")
      .eq("visitor_id", testVisitorId)
      .single();

    if (!profile) {
      return res.status(200).json({ message: "No test data to cleanup" });
    }

    // Delete conversations and related data
    await supabase
      .from("conversations")
      .delete()
      .eq("visitor_profile_id", profile.id);

    // Reset profile
    await supabase
      .from("visitor_profiles")
      .update({
        email: null,
        phone: null,
        company: null,
        lead_score: 0,
        lead_status: "UNKNOWN",
      })
      .eq("id", profile.id);

    // Clear memory
    await supabase
      .from("visitor_memory")
      .delete()
      .eq("visitor_profile_id", profile.id);

    return res.status(200).json({ 
      message: "Test data cleaned up successfully",
      profileId: profile.id,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}