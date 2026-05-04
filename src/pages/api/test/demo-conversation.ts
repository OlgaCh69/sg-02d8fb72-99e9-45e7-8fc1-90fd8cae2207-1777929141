import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

/**
 * Test endpoint to simulate a demo conversation with the AI assistant
 * Used for testing prompt effectiveness and response quality
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userMessage, pageUrl = "/", resetConversation = false } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: "Missing userMessage" });
    }

    // Use test visitor ID
    const testVisitorId = "test_visitor_demo";
    const testSessionId = `test_session_${Date.now()}`;

    // Get or create test visitor profile
    let { data: profile } = await supabase
      .from("visitor_profiles")
      .select("*")
      .eq("visitor_id", testVisitorId)
      .single();

    if (!profile || resetConversation) {
      // Create fresh test profile
      const { data: newProfile } = await supabase
        .from("visitor_profiles")
        .upsert({
          visitor_id: testVisitorId,
          name: "Test User",
          email: resetConversation ? null : profile?.email,
          lead_score: 0,
          lead_status: "UNKNOWN",
          consent_memory: true,
          consent_analytics: false,
        })
        .select()
        .single();
      
      profile = newProfile;
    }

    // Get or create test conversation
    let { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("visitor_profile_id", profile!.id)
      .eq("status", "open")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!conversation || resetConversation) {
      const { data: newConversation } = await supabase
        .from("conversations")
        .insert({
          visitor_profile_id: profile!.id,
          session_id: testSessionId,
          channel: "website",
          page_url: pageUrl,
          page_title: "Test Page",
          status: "open",
        })
        .select()
        .single();
      
      conversation = newConversation;
    }

    // Call the chat message API
    const chatResponse = await fetch(`${req.headers.origin || "http://localhost:3000"}/api/chat/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        conversationId: conversation!.id,
        visitorId: testVisitorId,
        sessionId: testSessionId,
        pageUrl: pageUrl,
        pageTitle: "Test Page",
      }),
    });

    const chatData = await chatResponse.json();

    // Get conversation messages
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation!.id)
      .order("timestamp", { ascending: true });

    // Calculate response metrics
    const aiResponse = chatData.response || "";
    const wordCount = aiResponse.split(/\s+/).length;
    const sentenceCount = (aiResponse.match(/[.!?]+/g) || []).length;
    const paragraphCount = aiResponse.split(/\n\n/).filter(p => p.trim()).length;
    const questionCount = (aiResponse.match(/\?/g) || []).length;

    const metrics = {
      wordCount,
      sentenceCount,
      paragraphCount,
      questionCount,
      withinWordLimit: wordCount >= 40 && wordCount <= 120,
      withinSentenceLimit: sentenceCount >= 3 && sentenceCount <= 5,
      oneQuestionOnly: questionCount <= 1,
    };

    return res.status(200).json({
      userMessage,
      aiResponse,
      metrics,
      conversationId: conversation!.id,
      messageHistory: messages?.map(m => ({
        role: m.role,
        content: m.content,
        type: m.message_type,
      })),
      passesRules: metrics.withinWordLimit && metrics.withinSentenceLimit && metrics.oneQuestionOnly,
    });
  } catch (error) {
    console.error("Demo conversation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}