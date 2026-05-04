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
      notificationType,
      visitorProfileId,
      conversationId,
      title,
      message,
      metadata,
    } = req.body;

    if (!notificationType || !title || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if notifications are enabled for this type
    const { data: settings } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("notification_type", notificationType)
      .eq("enabled", true);

    if (!settings || settings.length === 0) {
      return res.status(200).json({ sent: false, reason: "disabled" });
    }

    // Create notification record
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        notification_type: notificationType,
        visitor_profile_id: visitorProfileId,
        conversation_id: conversationId,
        title,
        message,
        metadata: metadata || {},
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Notification creation error:", error);
      return res.status(500).json({ error: "Failed to create notification" });
    }

    // Send via configured delivery methods
    for (const setting of settings) {
      try {
        const config = setting.delivery_config as Record<string, string> | null;
        
        if (setting.delivery_method === "email") {
          // TODO: Integrate email service
          console.log("Email notification:", { title, message });
        } else if (setting.delivery_method === "webhook") {
          const webhookUrl = config?.webhook_url;
          if (webhookUrl) {
            await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title, message, metadata }),
            });
          }
        } else if (setting.delivery_method === "slack") {
          const slackUrl = config?.slack_webhook_url;
          if (slackUrl) {
            await fetch(slackUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: `*${title}*\n${message}` }),
            });
          }
        }
      } catch (deliveryError) {
        console.error(`${setting.delivery_method} delivery failed:`, deliveryError);
      }
    }

    // Mark as sent
    await supabase
      .from("notifications")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", notification.id);

    return res.status(200).json({
      sent: true,
      notification,
    });
  } catch (error) {
    console.error("Notification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}