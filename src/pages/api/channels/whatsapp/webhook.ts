import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import crypto from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET request for webhook verification
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const { data: settings } = await supabase
      .from("channel_settings")
      .select("verify_token")
      .eq("channel", "whatsapp")
      .single();

    if (mode === "subscribe" && token === settings?.verify_token) {
      console.log("WhatsApp webhook verified");
      return res.status(200).send(challenge);
    }

    return res.status(403).send("Forbidden");
  }

  // POST request for incoming messages
  if (req.method === "POST") {
    try {
      const { data: settings } = await supabase
        .from("channel_settings")
        .select("*")
        .eq("channel", "whatsapp")
        .single();

      if (!settings?.is_enabled) {
        return res.status(200).json({ status: "disabled" });
      }

      const body = req.body;

      // Process WhatsApp message
      if (body.object === "whatsapp_business_account") {
        for (const entry of body.entry) {
          for (const change of entry.changes || []) {
            if (change.value?.messages) {
              for (const message of change.value.messages) {
                await handleWhatsAppMessage(message, change.value, settings);
              }
            }
          }
        }
      }

      return res.status(200).json({ status: "ok" });
    } catch (error) {
      console.error("WhatsApp webhook error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handleWhatsAppMessage(message: any, value: any, settings: any) {
  const senderId = message.from;
  const messageText = message.text?.body;

  if (!messageText) return;

  // Get contact name from WhatsApp
  const contact = value.contacts?.[0];
  const userName = contact?.profile?.name || contact?.wa_id || "WhatsApp User";

  // Get or create social profile
  let { data: profile } = await supabase
    .from("social_profiles")
    .select("*")
    .eq("platform", "whatsapp")
    .eq("platform_user_id", senderId)
    .single();

  if (!profile) {
    const { data: newProfile } = await supabase
      .from("social_profiles")
      .insert({
        platform: "whatsapp",
        platform_user_id: senderId,
        name: userName,
        phone: senderId,
      })
      .select()
      .single();
    profile = newProfile;
  }

  // Get or create conversation
  let { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("visitor_id", `whatsapp_${senderId}`)
    .eq("status", "active")
    .single();

  if (!conversation) {
    const { data: newConversation } = await supabase
      .from("conversations")
      .insert({
        visitor_id: `whatsapp_${senderId}`,
        session_id: `whatsapp_session_${Date.now()}`,
        channel: "whatsapp",
        status: "active",
        metadata: { social_profile_id: profile?.id },
      })
      .select()
      .single();
    conversation = newConversation;
  }

  if (!conversation) return;

  // Save user message
  await supabase.from("messages").insert({
    conversation_id: conversation.id,
    role: "user",
    content: messageText,
  });

  // Get AI response
  const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '')}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: messageText,
      conversationId: conversation.id,
      visitorId: `whatsapp_${senderId}`,
    }),
  });

  const aiData = await aiResponse.json();

  // Save AI response
  await supabase.from("messages").insert({
    conversation_id: conversation.id,
    role: "assistant",
    content: aiData.response,
    source_url: aiData.sourceUrl || null,
    source_type: aiData.sourceType || null,
  });

  // Send response back to WhatsApp
  await fetch(
    `https://graph.facebook.com/v18.0/${settings.phone_number_id}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.access_token}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: senderId,
        text: { body: aiData.response },
      }),
    }
  );

  // Check if lead capture needed
  if (aiData.shouldCaptureLead) {
    await supabase.from("leads").insert({
      conversation_id: conversation.id,
      visitor_id: `whatsapp_${senderId}`,
      name: profile?.name || userName,
      email: profile?.email,
      phone: senderId,
      lead_score: 60,
      metadata: { channel: "whatsapp" },
    });
  }
}