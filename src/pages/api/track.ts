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
    const { event_type, visitor_id, session_id, page_url, referrer, user_agent, metadata } = req.body;

    const eventData: any = {
      event_type,
      visitor_id,
      session_id,
      page_url,
      metadata: metadata || {},
    };

    if (event_type === "page_view" && user_agent) {
      const isMobile = /mobile/i.test(user_agent);
      const browserMatch = user_agent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/);
      const browser = browserMatch ? browserMatch[1] : "Unknown";

      eventData.metadata = {
        ...eventData.metadata,
        referrer,
        device: isMobile ? "mobile" : "desktop",
        browser,
      };
    }

    await supabase.from("analytics_events").insert(eventData);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Tracking error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}