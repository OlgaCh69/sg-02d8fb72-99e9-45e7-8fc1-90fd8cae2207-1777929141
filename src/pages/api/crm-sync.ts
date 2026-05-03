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

    const { data: lead } = await supabase
      .from("leads")
      .select("*, conversations(*)")
      .eq("id", leadId)
      .single();

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const { data: settings } = await supabase
      .from("crm_settings")
      .select("*")
      .eq("is_active", true)
      .single();

    if (!settings || !settings.webhook_url) {
      return res.status(200).json({ 
        success: false, 
        message: "CRM not configured" 
      });
    }

    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", lead.conversation_id)
      .order("created_at", { ascending: true });

    const transcript = messages?.map(m => 
      `${m.role === "user" ? "Visitor" : "Assistant"}: ${m.content}`
    ).join("\n\n");

    const crmPayload = {
      email: lead.email,
      name: lead.name,
      phone: lead.phone,
      company: lead.company,
      inquiry_type: lead.inquiry_type,
      lead_score: lead.lead_score,
      source: "AI Chat Widget",
      page_url: lead.conversations?.page_url,
      captured_at: lead.captured_at,
      transcript: transcript,
      visitor_id: lead.visitor_id,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (settings.api_key) {
      headers["Authorization"] = `Bearer ${settings.api_key}`;
    }

    const response = await fetch(settings.webhook_url, {
      method: "POST",
      headers,
      body: JSON.stringify(crmPayload),
    });

    if (response.ok) {
      await supabase
        .from("leads")
        .update({ crm_synced: true })
        .eq("id", leadId);

      await supabase.from("analytics_events").insert({
        event_type: "crm_synced",
        visitor_id: lead.visitor_id || "unknown",
        session_id: lead.conversations?.session_id || "unknown",
        metadata: { lead_id: leadId, crm_provider: settings.provider },
      });

      return res.status(200).json({ success: true });
    } else {
      throw new Error(`CRM webhook failed: ${response.statusText}`);
    }
  } catch (error: any) {
    console.error("CRM sync error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}