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
    const { conversationId, visitorProfileId, recentMessages } = req.body;

    if (!conversationId || !visitorProfileId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Combine recent messages into text for analysis
    const conversationText = recentMessages?.map((m: any) => 
      `${m.role}: ${m.content}`
    ).join("\n") || "";

    const lowerText = conversationText.toLowerCase();

    // Extract business type
    const businessTypes = {
      agency: ["agency", "agencies", "marketing", "digital agency"],
      real_estate: ["real estate", "property", "realtor", "estate agent"],
      ecommerce: ["e-commerce", "ecommerce", "online store", "shop", "selling products"],
      clinic: ["clinic", "salon", "beauty", "medical", "spa", "dental"],
      service: ["service business", "local business", "contractor"],
      enterprise: ["€2m", "2m revenue", "enterprise", "large business"],
    };

    let detectedBusinessType = "";
    for (const [type, keywords] of Object.entries(businessTypes)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        detectedBusinessType = type;
        break;
      }
    }

    // Extract service interest
    const serviceInterests = {
      ai_revenue: ["ai revenue", "lead capture", "qualification system"],
      real_estate_ai: ["real estate assistant", "property assistant", "viewing bookings"],
      property_scraping: ["property scraping", "listing scraping", "real-time listings"],
      missed_call: ["missed call", "missed calls", "call recovery", "sms"],
      dm_sales: ["dm sales", "whatsapp", "instagram", "direct message"],
      revenue_leak: ["revenue leak", "lost leads", "recover leads"],
      telegram: ["telegram", "mini-shop", "telegram shop"],
      silent_salesman: ["silent salesman", "sales engine", "enterprise ai"],
      ai_receptionist: ["receptionist", "booking", "appointments"],
    };

    const detectedServices: string[] = [];
    for (const [service, keywords] of Object.entries(serviceInterests)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        detectedServices.push(service);
      }
    }

    // Extract platform interest
    const platforms = {
      website: ["website", "web", "online"],
      whatsapp: ["whatsapp", "wa"],
      instagram: ["instagram", "ig", "insta"],
      telegram: ["telegram"],
      phone: ["phone", "calls", "calling"],
      facebook: ["facebook", "fb"],
    };

    const detectedPlatforms: string[] = [];
    for (const [platform, keywords] of Object.entries(platforms)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        detectedPlatforms.push(platform);
      }
    }

    // Extract main goals
    const goals = {
      more_leads: ["more leads", "generate leads", "lead generation", "capture leads"],
      more_bookings: ["bookings", "appointments", "schedule", "book"],
      more_sales: ["sales", "revenue", "conversions", "sell more"],
      reduce_missed: ["missed calls", "missed messages", "recover leads", "lost leads"],
      automate: ["automate", "automation", "24/7", "automatic"],
      scale: ["scale", "scaling", "growth", "grow"],
    };

    const detectedGoals: string[] = [];
    for (const [goal, keywords] of Object.entries(goals)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        detectedGoals.push(goal);
      }
    }

    // Extract timeline
    let timeline = "";
    if (lowerText.includes("asap") || lowerText.includes("immediately") || lowerText.includes("urgent")) {
      timeline = "immediate";
    } else if (lowerText.includes("this week") || lowerText.includes("this month")) {
      timeline = "short_term";
    } else if (lowerText.includes("next month") || lowerText.includes("few weeks")) {
      timeline = "medium_term";
    } else if (lowerText.includes("exploring") || lowerText.includes("researching")) {
      timeline = "researching";
    }

    // Extract budget signals
    let budgetSignal = "";
    if (lowerText.includes("€") || lowerText.includes("budget")) {
      if (lowerText.includes("€2m") || lowerText.includes("2m revenue")) {
        budgetSignal = "enterprise";
      } else if (lowerText.includes("small") || lowerText.includes("limited budget")) {
        budgetSignal = "limited";
      }
    }

    // Save extracted memory
    const memoryUpdates = [];

    if (detectedBusinessType) {
      memoryUpdates.push({
        visitor_profile_id: visitorProfileId,
        key: "business_type",
        value: detectedBusinessType,
        category: "qualification",
        confidence: 0.8,
      });
    }

    if (detectedServices.length > 0) {
      memoryUpdates.push({
        visitor_profile_id: visitorProfileId,
        key: "service_interest",
        value: detectedServices.join(", "),
        category: "qualification",
        confidence: 0.8,
      });
    }

    if (detectedPlatforms.length > 0) {
      memoryUpdates.push({
        visitor_profile_id: visitorProfileId,
        key: "platform_interest",
        value: detectedPlatforms.join(", "),
        category: "qualification",
        confidence: 0.7,
      });
    }

    if (detectedGoals.length > 0) {
      memoryUpdates.push({
        visitor_profile_id: visitorProfileId,
        key: "main_goals",
        value: detectedGoals.join(", "),
        category: "qualification",
        confidence: 0.8,
      });
    }

    if (timeline) {
      memoryUpdates.push({
        visitor_profile_id: visitorProfileId,
        key: "timeline",
        value: timeline,
        category: "qualification",
        confidence: 0.7,
      });
    }

    if (budgetSignal) {
      memoryUpdates.push({
        visitor_profile_id: visitorProfileId,
        key: "budget_signal",
        value: budgetSignal,
        category: "qualification",
        confidence: 0.6,
      });
    }

    // Upsert memory entries
    for (const memory of memoryUpdates) {
      await supabase.from("visitor_memory").upsert(memory, {
        onConflict: "visitor_profile_id,key",
      });
    }

    // Update visitor profile with detected info
    const profileUpdates: any = {};
    
    if (detectedBusinessType && !lowerText.includes("not sure") && !lowerText.includes("don't know")) {
      profileUpdates.company = detectedBusinessType;
    }

    if (Object.keys(profileUpdates).length > 0) {
      await supabase
        .from("visitor_profiles")
        .update(profileUpdates)
        .eq("id", visitorProfileId);
    }

    return res.status(200).json({
      success: true,
      extracted: {
        business_type: detectedBusinessType,
        services: detectedServices,
        platforms: detectedPlatforms,
        goals: detectedGoals,
        timeline,
        budget_signal: budgetSignal,
      },
    });
  } catch (error) {
    console.error("Memory extraction error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}