import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

/**
 * Spam detection patterns
 */
const SPAM_PATTERNS = [
  /\b(viagra|cialis|casino|lottery|winner|claim|prize)\b/i,
  /https?:\/\/[^\s]+/g, // Multiple URLs
  /\b\w+\.(com|net|org|xyz)\b/gi, // Multiple domains
];

const PROMPT_INJECTION_PATTERNS = [
  /ignore (previous|all) (instructions|prompts)/i,
  /you are (now|a) /i,
  /system (prompt|message|instruction)/i,
  /reveal (your|the) (prompt|instructions)/i,
];

export function detectSpam(message: string): boolean {
  return SPAM_PATTERNS.some((pattern) => pattern.test(message));
}

export function detectPromptInjection(message: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(message));
}

export async function checkRateLimit(
  visitorId: string,
  endpoint: string,
  limit: number = 10,
  windowMinutes: number = 1
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

  // Get current count
  const { data: existing } = await supabase
    .from("rate_limits")
    .select("request_count")
    .eq("visitor_id", visitorId)
    .eq("endpoint", endpoint)
    .gte("window_start", windowStart.toISOString())
    .single();

  if (existing && existing.request_count >= limit) {
    return false; // Rate limit exceeded
  }

  // Increment or create
  if (existing) {
    await supabase
      .from("rate_limits")
      .update({ request_count: existing.request_count + 1 })
      .eq("visitor_id", visitorId)
      .eq("endpoint", endpoint);
  } else {
    await supabase.from("rate_limits").insert({
      visitor_id: visitorId,
      endpoint,
      request_count: 1,
      window_start: new Date().toISOString(),
    });
  }

  return true; // OK
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, visitorId, conversationId } = req.body;

    if (!message || !visitorId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check rate limit
    const rateLimitOk = await checkRateLimit(visitorId, "chat_message", 20, 1);
    if (!rateLimitOk) {
      await supabase.from("abuse_reports").insert({
        visitor_profile_id: null,
        conversation_id: conversationId,
        abuse_type: "rate_limit",
        message_content: message,
        auto_flagged: true,
      });

      return res.status(429).json({
        isSpam: true,
        reason: "rate_limit",
        message: "Too many messages. Please slow down.",
      });
    }

    // Check spam
    const isSpam = detectSpam(message);
    if (isSpam) {
      await supabase.from("abuse_reports").insert({
        visitor_profile_id: null,
        conversation_id: conversationId,
        abuse_type: "spam",
        message_content: message,
        auto_flagged: true,
      });

      return res.status(200).json({
        isSpam: true,
        reason: "spam_detected",
      });
    }

    // Check prompt injection
    const isInjection = detectPromptInjection(message);
    if (isInjection) {
      await supabase.from("abuse_reports").insert({
        visitor_profile_id: null,
        conversation_id: conversationId,
        abuse_type: "prompt_injection",
        message_content: message,
        auto_flagged: true,
      });

      return res.status(200).json({
        isSpam: true,
        reason: "prompt_injection",
      });
    }

    return res.status(200).json({
      isSpam: false,
      ok: true,
    });
  } catch (error) {
    console.error("Spam check error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}