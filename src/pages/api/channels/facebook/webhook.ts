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
      .eq("channel", "facebook")
      .single();

    if (mode === "subscribe" && token === settings?.verify_token) {
      console.log("Facebook webhook verified");
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
        .eq("channel", "facebook")
        .single();

      if (!settings?.is_enabled) {
        return res.status(200).json({ status: "disabled" });
      }

      // Verify signature
      const signature = req.headers["x-hub-signature-256"] as string;
      const expectedSignature = crypto
        .createHmac("sha256", settings.app_secret || "")
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (signature !== `sha256=${expectedSignature}`) {
        return res.status(403).send("Invalid signature");
      }

      const body = req.body;

      // Process Facebook message
      if (body.object === "page") {
        for (const entry of body.entry) {
          for (const messaging of entry.messaging || []) {
            if (messaging.message) {
              await handleFacebookMessage(messaging, settings);
            }
          }
        }
      }

      return res.status(200).json({ status: "ok" });
    } catch (error) {
      console.error("Facebook webhook error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function handleFacebookMessage(messaging: any, settings: any) {
  const senderId = messaging.sender.id;
  const messageText = messaging.message.text;

  // Get or create social profile
  let { data: profile } = await supabase
    .from("social_profiles")
    .select("*")
    .eq("platform", "facebook")
    .eq("platform_user_id", senderId)
    .single();

  if (!profile) {
    const { data: newProfile } = await supabase
      .from("social_profiles")
      .insert({
        platform: "facebook",
        platform_user_id: senderId,
        name: "Facebook User",
      })
      .select()
      .single();
    profile = newProfile;
  }

  // Get or create visitor profile
  let { data: visitorProfile } = await supabase
    .from("visitor_profiles")
    .select("id")
    .eq("visitor_id", `facebook_${senderId}`)
    .single();

  if (!visitorProfile) {
    const { data: newProfile } = await supabase
      .from("visitor_profiles")
      .insert({ visitor_id: `facebook_${senderId}` })
      .select()
      .single();
    visitorProfile = newProfile;
  }

  // Get or create conversation
  let { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("visitor_profile_id", visitorProfile?.id)
    .eq("status", "active")
    .single();

  if (!conversation && visitorProfile) {
    const { data: newConversation } = await supabase
      .from("conversations")
      .insert({
        visitor_profile_id: visitorProfile.id,
        channel: "facebook",
        status: "active",
      } as any)
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
      visitorId: `facebook_${senderId}`,
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

  // Send response back to Facebook
  await fetch(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${settings.access_token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: senderId },
        message: { text: aiData.response },
      }),
    }
  );

  // Check if lead capture needed
  if (aiData.shouldCaptureLead) {
    await supabase.from("leads").insert({
      conversation_id: conversation.id,
      visitor_id: `facebook_${senderId}`,
      name: profile?.name || "Facebook User",
      email: profile?.email,
      phone: profile?.phone,
      lead_score: 50,
      metadata: { channel: "facebook" },
    });
  }
}