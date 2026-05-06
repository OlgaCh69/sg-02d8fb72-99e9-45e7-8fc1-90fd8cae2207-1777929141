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
  console.log("🧪 API: Demo conversation endpoint called");
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userMessage, pageUrl = "/", resetConversation = false } = req.body;
    console.log("🧪 API: Request body:", { userMessage, pageUrl, resetConversation });

    if (!userMessage) {
      return res.status(400).json({ error: "Missing userMessage" });
    }

    // Use test visitor ID
    const testVisitorId = "test_visitor_demo";
    const testSessionId = `test_session_${Date.now()}`;
    console.log("🧪 API: Using test visitor:", testVisitorId);

    // Get or create test visitor profile
    let { data: profile } = await supabase
      .from("visitor_profiles")
      .select("*")
      .eq("visitor_id", testVisitorId)
      .single();

    console.log("🧪 API: Existing profile:", profile ? "found" : "not found");

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
      console.log("🧪 API: Created new profile");
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

    console.log("🧪 API: Existing conversation:", conversation ? "found" : "not found");

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
      console.log("🧪 API: Created new conversation");
    }

    // Call the chat message API
    console.log("🧪 API: Calling chat/message API...");
    // Force localhost for server-to-server calls to avoid DNS/firewall issues in preview
    const baseUrl = "http://localhost:3000";
    
    console.log("🧪 API: Chat API URL:", `${baseUrl}/api/chat/message`);
    
    const chatResponse = await fetch(`${baseUrl}/api/chat/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        conversationId: conversation!.id,
        visitorId: profile!.id,
        sessionId: testSessionId,
        pageUrl: pageUrl,
        pageTitle: "Test Page",
      }),
    });

    console.log("🧪 API: Chat API response status:", chatResponse.status);
    
    if (!chatResponse.ok) {
      const chatErrorText = await chatResponse.text();
      console.error("🧪 API: Chat API error:", chatErrorText);
      return res.status(500).json({ 
        error: "Chat API error", 
        message: `Failed to get AI response: HTTP ${chatResponse.status}`,
        details: chatErrorText 
      });
    }

    const chatData = await chatResponse.json();
    console.log("🧪 API: Chat API response data:", chatData);

    // Get conversation messages
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation!.id)
      .order("timestamp", { ascending: true });

    console.log("🧪 API: Retrieved messages:", messages?.length || 0);

    // Calculate response metrics
    const aiResponse = chatData.response || "";
    console.log("🧪 API: AI response text:", aiResponse);
    console.log("🧪 API: AI response length:", aiResponse.length);
    
    const wordCount = aiResponse.split(/\s+/).length;
    const sentenceCount = (aiResponse.match(/[.!?]+/g) || []).length;
    const paragraphCount = aiResponse.split(/\n\n/).filter((p: string) => p.trim()).length;
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

    console.log("🧪 API: Calculated metrics:", metrics);

    const responseData = {
      userMessage,
      response: aiResponse,  // Changed from aiResponse to response
      metrics,
      conversationId: conversation!.id,
      messageHistory: messages?.map((m: any) => ({
        role: m.role,
        content: m.content,
        type: m.message_type,
      })),
      passesRules: metrics.withinWordLimit && metrics.withinSentenceLimit && metrics.oneQuestionOnly,
    };

    console.log("🧪 API: Sending response:", responseData);

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("🧪 API: Demo conversation error:", error);
    return res.status(500).json({ error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" });
  }
}