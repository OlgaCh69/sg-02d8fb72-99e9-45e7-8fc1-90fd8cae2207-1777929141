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
    const { visitorId, email, phone, name, company } = req.body;

    // Find anonymous profile by visitor_id
    const { data: anonymousProfile } = await supabase
      .from("visitor_profiles")
      .select("*")
      .eq("visitor_id", visitorId)
      .single();

    if (!anonymousProfile) {
      return res.status(404).json({ error: "Anonymous profile not found" });
    }

    // Check if a known profile with this email/phone exists
    let knownProfile = null;
    
    if (email) {
      const { data } = await supabase
        .from("visitor_profiles")
        .select("*")
        .eq("email", email)
        .neq("id", anonymousProfile.id)
        .single();
      knownProfile = data;
    }

    if (!knownProfile && phone) {
      const { data } = await supabase
        .from("visitor_profiles")
        .select("*")
        .eq("phone", phone)
        .neq("id", anonymousProfile.id)
        .single();
      knownProfile = data;
    }

    if (knownProfile) {
      // Merge: move all data from anonymous to known profile
      
      // Update conversations
      await supabase
        .from("conversations")
        .update({ visitor_profile_id: knownProfile.id })
        .eq("visitor_profile_id", anonymousProfile.id);

      // Update conversation summaries
      await supabase
        .from("conversation_summaries")
        .update({ visitor_profile_id: knownProfile.id })
        .eq("visitor_profile_id", anonymousProfile.id);

      // Update visitor memory
      await supabase
        .from("visitor_memory")
        .update({ visitor_profile_id: knownProfile.id })
        .eq("visitor_profile_id", anonymousProfile.id);

      // Update analytics events
      await supabase
        .from("analytics_events")
        .update({ visitor_profile_id: knownProfile.id })
        .eq("visitor_profile_id", anonymousProfile.id);

      // Update lead score if anonymous had higher score
      if (anonymousProfile.lead_score > knownProfile.lead_score) {
        await supabase
          .from("visitor_profiles")
          .update({ 
            lead_score: anonymousProfile.lead_score,
            lead_status: anonymousProfile.lead_status,
          })
          .eq("id", knownProfile.id);
      }

      // Update known profile with any missing info from anonymous
      const updates: any = { updated_at: new Date().toISOString() };
      if (name && !knownProfile.name) updates.name = name;
      if (phone && !knownProfile.phone) updates.phone = phone;
      if (company && !knownProfile.company) updates.company = company;

      if (Object.keys(updates).length > 1) {
        await supabase
          .from("visitor_profiles")
          .update(updates)
          .eq("id", knownProfile.id);
      }

      // Delete anonymous profile
      await supabase
        .from("visitor_profiles")
        .delete()
        .eq("id", anonymousProfile.id);

      return res.status(200).json({ 
        success: true, 
        merged: true,
        profileId: knownProfile.id,
      });
    } else {
      // No existing profile - just update the anonymous one with new details
      await supabase
        .from("visitor_profiles")
        .update({
          email,
          phone,
          name,
          company,
          updated_at: new Date().toISOString(),
        })
        .eq("id", anonymousProfile.id);

      return res.status(200).json({ 
        success: true, 
        merged: false,
        profileId: anonymousProfile.id,
      });
    }
  } catch (error) {
    console.error("Profile merge error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}