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
    const { visitorId, sessionId, conversationId, eventName, pageUrl, metadata } = req.body;
    
    // We expect visitorId here to be the internal UUID visitor_profile_id, 
    // or we might need to resolve it. Assuming it's already resolved in the client or we insert it as is.
    await supabase.from("analytics_events").insert({
      visitor_profile_id: visitorId,
      session_id: sessionId,
      conversation_id: conversationId,
      event_name: eventName,
      page_url: pageUrl,
      metadata: metadata || {}
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}