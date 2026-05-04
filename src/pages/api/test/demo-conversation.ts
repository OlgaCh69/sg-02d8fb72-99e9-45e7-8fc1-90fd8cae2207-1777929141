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
    const { scenario } = req.body;

    // Create demo visitor profile
    const demoVisitorId = `demo_${Date.now()}`;
    const { data: profile } = await supabase
      .from("visitor_profiles")
      .insert({
        visitor_id: demoVisitorId,
        name: "Demo User",
        email: "demo@example.com",
        lead_status: "WARM",
        consent_memory: true,
        consent_analytics: true,
      })
      .select()
      .single();

    if (!profile) {
      return res.status(500).json({ error: "Failed to create demo profile" });
    }

    // Create demo session
    const { data: session } = await supabase
      .from("visitor_sessions")
      .insert({
        visitor_profile_id: profile.id,
        session_id: `demo_session_${Date.now()}`,
        page_url: "https://example.com/demo",
        page_title: "Demo Page",
        device: "desktop",
        browser: "Chrome",
      } as any)
      .select()
      .single();

    // Create demo conversation
    const { data: conversation } = await supabase
      .from("conversations")
      .insert({
        visitor_profile_id: profile.id,
        session_id: session?.id,
        channel: "website",
        status: "open",
      } as any)
      .select()
      .single();

    if (!conversation) {
      return res.status(500).json({ error: "Failed to create demo conversation" });
    }

    // Create demo messages based on scenario
    const scenarios: Record<string, Array<{ role: string; content: string }>> = {
      pricing_inquiry: [
        { role: "assistant", content: "Hi! How can I help you today?" },
        { role: "user", content: "I'm interested in your services. How much do they cost?" },
        { role: "assistant", content: "Great question! Our pricing depends on your specific needs. Could you tell me more about what you're looking for?" },
        { role: "user", content: "I need a website for my small business" },
        { role: "assistant", content: "Perfect! For small business websites, our packages start at $2,500. Would you like to schedule a call to discuss your specific requirements?" },
      ],
      support_request: [
        { role: "assistant", content: "Hi! How can I help you today?" },
        { role: "user", content: "I'm having trouble accessing my account" },
        { role: "assistant", content: "I'm sorry to hear that. Let me connect you with our support team who can help you right away." },
      ],
      general_inquiry: [
        { role: "assistant", content: "Hi! How can I help you today?" },
        { role: "user", content: "What services do you offer?" },
        { role: "assistant", content: "We offer web development, design, and digital marketing services. Which area are you most interested in?" },
      ],
    };

    const messages = scenarios[scenario || "general_inquiry"] || scenarios.general_inquiry;

    for (const msg of messages) {
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        metadata: {},
      } as any);
    }

    // Update lead score for demo
    await supabase
      .from("visitor_profiles")
      .update({ lead_score: 45, lead_status: "WARM" })
      .eq("id", profile.id);

    return res.status(200).json({
      success: true,
      conversationId: conversation.id,
      visitorId: demoVisitorId,
      message: "Demo conversation created successfully",
    });
  } catch (error) {
    console.error("Demo conversation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}