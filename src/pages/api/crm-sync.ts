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
    const { leadId } = req.body;

    if (!leadId) {
      return res.status(400).json({ error: "Missing leadId" });
    }

    // Get lead details
    const { data: lead } = await supabase
      .from("leads")
      .select("*, conversations(*)")
      .eq("id", leadId)
      .single();

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Get conversation messages
    const { data: messages } = await supabase
      .from("messages")
      .select("role, content, timestamp")
      .eq("conversation_id", lead.conversation_id)
      .order("timestamp", { ascending: true });

    // Get visitor profile with memory
    const { data: profile } = await supabase
      .from("visitor_profiles")
      .select("*")
      .eq("id", lead.conversations?.visitor_profile_id)
      .single();

    // Get visitor memory (O.N.E.Tech specific)
    const { data: memory } = await supabase
      .from("visitor_memory")
      .select("key, value")
      .eq("visitor_profile_id", profile?.id)
      .eq("is_active", true);

    const memoryMap: Record<string, string> = {};
    memory?.forEach(m => {
      memoryMap[m.key] = m.value || "";
    });

    // Get conversation summary
    const { data: summary } = await supabase
      .from("conversation_summaries")
      .select("*")
      .eq("conversation_id", lead.conversation_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get CRM settings
    const { data: crmSettings } = await supabase
      .from("crm_settings")
      .select("*")
      .single();

    if (!crmSettings?.webhook_url) {
      return res.status(400).json({ error: "CRM webhook not configured" });
    }

    // Build O.N.E.Tech optimized CRM payload
    const crmPayload = {
      // Basic contact info
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || profile?.company || "",
      
      // O.N.E.Tech specific qualification
      business_type: memoryMap.business_type || "",
      service_interest: memoryMap.service_interest || "",
      platform_interest: memoryMap.platform_interest || "",
      main_goals: memoryMap.main_goals || "",
      timeline: memoryMap.timeline || "",
      budget_signal: memoryMap.budget_signal || "",
      
      // Lead scoring
      lead_score: profile?.lead_score || 0,
      lead_status: profile?.lead_status || "UNKNOWN",
      
      // Source tracking
      page_url: lead.conversations?.page_url || "",
      page_title: lead.conversations?.page_title || "",
      source: profile?.source || "",
      referrer: lead.conversations?.referrer || "",
      device: lead.conversations?.device || "",
      country: lead.conversations?.country || "",
      
      // Conversation data
      conversation_summary: summary?.summary || "",
      intent: summary?.intent || "",
      full_transcript: messages?.map(m => `[${m.role}]: ${m.content}`).join("\n") || "",
      
      // Metadata
      captured_at: lead.captured_at,
      conversation_started_at: lead.conversations?.started_at,
      channel: lead.conversations?.channel || "website",
    };

    // Send to CRM
    const response = await fetch(crmSettings.webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(crmSettings.api_key && { Authorization: `Bearer ${crmSettings.api_key}` }),
      },
      body: JSON.stringify(crmPayload),
    });

    const success = response.ok;

    // Log sync attempt
    await supabase.from("crm_sync_logs").insert({
      conversation_id: lead.conversation_id,
      visitor_profile_id: profile?.id,
      status: success ? "success" : "failed",
      error_message: success ? null : await response.text(),
      payload: crmPayload,
    });

    // Update lead sync status
    await supabase
      .from("leads")
      .update({
        crm_synced: success,
      })
      .eq("id", leadId);

    if (!success) {
      return res.status(500).json({ 
        error: "CRM sync failed", 
        status: response.status,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead synced to CRM successfully",
    });
  } catch (error) {
    console.error("CRM sync error:", error);
    
    // Log failed sync
    try {
      await supabase.from("crm_sync_logs").insert({
        status: "failed",
        error_message: String(error),
      });
    } catch (logError) {
      console.error("Failed to log CRM sync error:", logError);
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}