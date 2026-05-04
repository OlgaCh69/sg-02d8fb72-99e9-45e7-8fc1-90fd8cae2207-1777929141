import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import { updateUserAttribute } from "@/services/memoryService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { conversationId, visitorProfileId } = req.body;

    // Get recent messages
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "No messages found" });
    }

    const userMessages = messages.filter(m => m.role === "user");
    const lastUserMessage = userMessages[0]?.content || "";
    const lowerContent = lastUserMessage.toLowerCase();

    // Simple rule-based extraction (can be replaced with OpenAI later)
    const extracted: any = {
      intent: "general_inquiry",
      service_interest: "",
      budget: "",
      timeline: "",
      urgency: "",
      name: "",
      email: "",
      phone: "",
      company: "",
      lead_score_change: 0,
      lead_status: "UNKNOWN",
      handover_requested: false,
      next_step: "",
      memory_updates: [],
    };

    // Intent detection
    if (lowerContent.includes("price") || lowerContent.includes("cost")) {
      extracted.intent = "pricing_inquiry";
      extracted.lead_score_change += 20;
    }
    if (lowerContent.includes("demo") || lowerContent.includes("trial")) {
      extracted.intent = "demo_request";
      extracted.lead_score_change += 30;
    }
    if (lowerContent.includes("buy") || lowerContent.includes("purchase")) {
      extracted.intent = "purchase_intent";
      extracted.lead_score_change += 30;
    }
    if (lowerContent.includes("help") || lowerContent.includes("support")) {
      extracted.intent = "support_request";
    }

    // Service interest
    if (lowerContent.includes("website") || lowerContent.includes("web design")) {
      extracted.service_interest = "website";
      extracted.memory_updates.push({
        memory_type: "preference",
        key: "service_interest",
        value: "website",
        confidence: 0.8,
      });
    }
    if (lowerContent.includes("consulting") || lowerContent.includes("strategy")) {
      extracted.service_interest = "consulting";
      extracted.memory_updates.push({
        memory_type: "preference",
        key: "service_interest",
        value: "consulting",
        confidence: 0.8,
      });
    }

    // Budget detection (simple patterns)
    const budgetPatterns = [
      { pattern: /\$?\d+k?-?\d*k?/i, key: "budget" },
      { pattern: /€?\d+k?-?\d*k?/i, key: "budget" },
    ];
    for (const { pattern, key } of budgetPatterns) {
      const match = lowerContent.match(pattern);
      if (match) {
        extracted.budget = match[0];
        extracted.memory_updates.push({
          memory_type: "qualification",
          key: "budget",
          value: match[0],
          confidence: 0.9,
        });
      }
    }

    // Timeline detection
    if (lowerContent.includes("urgent") || lowerContent.includes("asap")) {
      extracted.timeline = "immediate";
      extracted.urgency = "high";
      extracted.lead_score_change += 20;
    } else if (lowerContent.includes("week") || lowerContent.includes("month")) {
      extracted.timeline = "1-4 weeks";
      extracted.urgency = "medium";
      extracted.lead_score_change += 10;
    }

    // Email detection
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = lastUserMessage.match(emailPattern);
    if (emailMatch) {
      extracted.email = emailMatch[0];
      extracted.lead_score_change += 25;
    }

    // Phone detection (simple pattern)
    const phonePattern = /\+?\d{1,3}?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/;
    const phoneMatch = lastUserMessage.match(phonePattern);
    if (phoneMatch) {
      extracted.phone = phoneMatch[0];
      extracted.lead_score_change += 25;
    }

    // Handover detection
    if (lowerContent.includes("speak to human") || lowerContent.includes("talk to someone")) {
      extracted.handover_requested = true;
    }

    // Update visitor profile with extracted data
    const updates: any = {};
    if (extracted.email) updates.email = extracted.email;
    if (extracted.phone) updates.phone = extracted.phone;

    if (Object.keys(updates).length > 0) {
      await supabase
        .from("visitor_profiles")
        .update(updates)
        .eq("id", visitorProfileId);
    }

    // Store memory updates
    for (const memUpdate of extracted.memory_updates) {
      await updateUserAttribute(
        visitorProfileId,
        memUpdate.key,
        memUpdate.value,
        memUpdate.memory_type
      );
    }

    // Calculate lead status based on score
    const { data: profile } = await supabase
      .from("visitor_profiles")
      .select("lead_score")
      .eq("id", visitorProfileId)
      .single();

    const currentScore = profile?.lead_score || 0;
    const newScore = currentScore + extracted.lead_score_change;

    let newStatus: "HOT" | "WARM" | "COLD" | "UNKNOWN" = "UNKNOWN";
    if (newScore >= 70) newStatus = "HOT";
    else if (newScore >= 35) newStatus = "WARM";
    else if (newScore > 0) newStatus = "COLD";

    extracted.lead_status = newStatus;

    // Update lead score and status
    if (extracted.lead_score_change > 0) {
      await supabase
        .from("visitor_profiles")
        .update({ 
          lead_score: newScore, 
          lead_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", visitorProfileId);
    }

    return res.status(200).json({ success: true, extracted });
  } catch (error) {
    console.error("Memory extraction error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}