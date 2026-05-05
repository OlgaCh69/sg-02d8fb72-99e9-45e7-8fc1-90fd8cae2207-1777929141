import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Hard-coded handover keywords
const HANDOVER_KEYWORDS = [
  'human', 'person', 'agent', 'support', 'call me', 'speak to someone',
  'real person', 'team', 'representative', 'talk to someone', 'contact',
  'phone', 'speak with', 'chat with', 'connect me'
];

// Intent classification
async function detectIntent(message: string): Promise<string> {
  const lowerMsg = message.toLowerCase();
  
  // Check for handover first
  if (HANDOVER_KEYWORDS.some(keyword => lowerMsg.includes(keyword))) {
    return 'human_handover';
  }
  
  // Pricing
  if (lowerMsg.match(/\b(price|cost|pricing|how much|payment|fee|rate)\b/)) {
    return 'pricing_question';
  }
  
  // Demo/booking
  if (lowerMsg.match(/\b(demo|schedule|book|meeting|call|appointment)\b/)) {
    return 'demo_request';
  }
  
  // Service inquiry
  if (lowerMsg.match(/\b(do you|can you|service|automation|whatsapp|instagram|ai|assistant)\b/)) {
    return 'service_question';
  }
  
  // Support/complaint
  if (lowerMsg.match(/\b(help|issue|problem|not working|broken|fix)\b/)) {
    return 'support_question';
  }
  
  // Spam detection
  if (lowerMsg.match(/\b(buy|sell|crypto|investment|forex|click here|download)\b/) || lowerMsg.length < 3) {
    return 'spam_or_abuse';
  }
  
  return 'general_question';
}

// Anti-repetition check
function isTooSimilar(newResponse: string, recentResponses: string[]): boolean {
  if (recentResponses.length === 0) return false;
  
  const normalizeText = (text: string) => 
    text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  
  const newNormalized = normalizeText(newResponse);
  const newWords = new Set(newNormalized.split(/\s+/));
  
  for (const recent of recentResponses) {
    const recentNormalized = normalizeText(recent);
    const recentWords = new Set(recentNormalized.split(/\s+/));
    
    // Calculate word overlap
    const intersection = new Set([...newWords].filter(x => recentWords.has(x)));
    const similarity = intersection.size / Math.max(newWords.size, recentWords.size);
    
    if (similarity > 0.7) return true; // 70% word overlap = too similar
  }
  
  return false;
}

// Banned repeated phrases
const BANNED_PHRASES = [
  'our ai automation services help businesses',
  'thanks for your message',
  'would you like to schedule a demo or learn more',
  'capture more leads, book more appointments, and increase revenue'
];

function containsBannedPhrase(response: string): boolean {
  const lowerResponse = response.toLowerCase();
  return BANNED_PHRASES.some(phrase => lowerResponse.includes(phrase));
}

// Generate handover response
function getHandoverResponse(conversationId: string): string {
  const responses = [
    "Of course 👍 I can connect you with our team. Would you prefer a quick call or a message?",
    "Sure thing! I'll get someone from the team to reach out. What's the best way to contact you — phone or email?",
    "No problem — I can have our team follow up with you directly. What's your preferred contact method?",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, conversationId, visitorId } = req.body;

    if (!message || !conversationId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Detect intent
    const intent = await detectIntent(message);
    
    // Hard-coded handover for human requests
    if (intent === 'human_handover') {
      const handoverResponse = getHandoverResponse(conversationId);
      
      // Mark conversation as needs follow-up
      await supabase
        .from("conversations")
        .update({ 
          status: 'needs_follow_up',
          metadata: { intent: 'human_handover', last_intent_at: new Date().toISOString() }
        })
        .eq("id", conversationId);
      
      // Save messages
      await supabase.from("messages").insert([
        { conversation_id: conversationId, role: "user", content: message },
        { conversation_id: conversationId, role: "assistant", content: handoverResponse },
      ]);
      
      // Track event
      await supabase.from("analytics_events").insert({
        event_name: "handover_requested",
        visitor_profile_id: visitorId,
        metadata: { conversation_id: conversationId, message }
      });
      
      return res.status(200).json({ response: handoverResponse, intent: 'human_handover' });
    }

    // Get conversation context (last 6 messages only)
    const { data: recentMessages } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(6);

    const context = (recentMessages || []).reverse();
    const recentAssistantMessages = context
      .filter(m => m.role === 'assistant')
      .map(m => m.content)
      .slice(-3); // Last 3 assistant messages for anti-repetition

    // Get visitor memory
    const { data: visitorProfile } = await supabase
      .from("visitor_profiles")
      .select("*")
      .eq("id", visitorId)
      .single();

    const visitorContext = visitorProfile?.profile_data || {};

    // Load AI configuration
    const { data: aiConfig } = await supabase
      .from("ai_config")
      .select("*")
      .eq("is_active", true)
      .single();

    // Enhanced system prompt
    const systemPrompt = `You are a human-like AI assistant for O.N.E.Tech Automation.

CORE RULES:
- Answer the visitor's exact question first
- Sound natural, not corporate
- Use short conversational replies (40-90 words, max 120)
- Ask only ONE question at a time
- Never ignore what the user asked
- Avoid generic sales pitches
- Use contractions: "we'll", "it's", "you're"
- Respond like a helpful team member, not a brochure

RESPONSE STRUCTURE:
1. Acknowledge naturally
2. Answer directly
3. Add one useful detail (if needed)
4. Ask one relevant next question

NEVER REPEAT:
- "Our AI automation services help businesses"
- "Thanks for your message"
- "capture more leads, book more appointments, and increase revenue"
- Long company descriptions
- Same opening lines

LEAD CAPTURE:
Only ask for contact info when:
- User asks about pricing
- User wants a demo
- User describes their problem
- User shows buying intent

DO NOT:
- Jump straight to demo booking
- Ask for email/phone too early
- Give long paragraphs
- Copy website text word-for-word
- Repeat previous answers

VISITOR CONTEXT:
${visitorContext.business_type ? `Business type: ${visitorContext.business_type}` : ''}
${visitorContext.interest ? `Interest: ${visitorContext.interest}` : ''}

CONVERSATION INTENT: ${intent}

${aiConfig?.custom_instructions || ''}`;

    // Search knowledge base for relevant info
    const { data: knowledgeResults } = await supabase
      .from("knowledge_sources")
      .select("title, content, url")
      .eq("approved", true)
      .limit(3);

    let knowledgeContext = '';
    if (knowledgeResults && knowledgeResults.length > 0) {
      knowledgeContext = '\n\nRELEVANT COMPANY INFO (use naturally, do not copy):\n' + 
        knowledgeResults.map(k => `- ${k.title}: ${k.content.substring(0, 200)}`).join('\n');
    }

    // Generate response with retry for anti-repetition
    let aiResponse = '';
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt + knowledgeContext,
          },
          ...context.map((msg: any) => ({
            role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
            content: String(msg.content),
          })),
          { role: "user", content: message },
        ],
        temperature: aiConfig?.temperature || 0.7,
        max_tokens: aiConfig?.max_tokens || 150,
      });

      aiResponse = completion.choices[0]?.message?.content || "";

      // Check for repetition and banned phrases
      if (!isTooSimilar(aiResponse, recentAssistantMessages) && !containsBannedPhrase(aiResponse)) {
        break; // Good response
      }

      attempts++;
      
      if (attempts < maxAttempts) {
        // Add instruction to regenerate differently
        context.push({
          role: 'system',
          content: 'IMPORTANT: Your last response was too similar to previous messages. Rephrase completely with different wording and structure.'
        });
      }
    }

    // Fallback if still repetitive
    if (!aiResponse || aiResponse.trim().length < 10) {
      aiResponse = "Just to make sure I help properly — are you looking for automation for leads, bookings, customer support, or missed calls?";
    }

    // Save messages
    await supabase.from("messages").insert([
      { conversation_id: conversationId, role: "user", content: message },
      { conversation_id: conversationId, role: "assistant", content: aiResponse },
    ]);

    // Update conversation with intent
    await supabase
      .from("conversations")
      .update({ 
        metadata: { ...visitorContext, last_intent: intent, last_message_at: new Date().toISOString() }
      })
      .eq("id", conversationId);

    // Track message event
    await supabase.from("analytics_events").insert({
      event_name: "message_sent",
      visitor_profile_id: visitorId,
      metadata: { conversation_id: conversationId, intent }
    });

    return res.status(200).json({ 
      response: aiResponse,
      intent,
      conversationId 
    });

  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({ 
      error: "Failed to process message",
      response: "I'm having trouble connecting right now. Can you try again in a moment?"
    });
  }
}