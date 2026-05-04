import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

/**
 * Website Crawling API for O.N.E.Tech Automation
 * Crawls onetechautomation.com and extracts knowledge
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { startUrl } = req.body;

    if (!startUrl) {
      return res.status(400).json({ error: "Missing startUrl" });
    }

    // For O.N.E.Tech, we'll manually seed the knowledge base
    // In production, integrate a real web crawler here

    const onetechPages = [
      {
        url: "https://onetechautomation.com",
        title: "O.N.E.Tech Automation - AI Revenue Infrastructure",
        content: "O.N.E.Tech Automation provides AI Revenue Infrastructure systems designed to help businesses capture, qualify, and convert more leads automatically. We specialize in high-ROI automation systems for high-growth agencies, real estate companies, e-commerce brands, service businesses, and businesses doing €2M+ revenue scaling.",
      },
      {
        url: "https://onetechautomation.com/services/ai-revenue",
        title: "AI Revenue Infrastructure for Agencies",
        content: "Full lead capture, qualification, and conversion system for high-growth agencies. Automatically captures leads from website, WhatsApp, Instagram and other channels, qualifies them based on your criteria, and moves them through your sales funnel 24/7. Most businesses lose 30-50% of leads from missed messages and calls. Our system recovers those lost opportunities.",
      },
      {
        url: "https://onetechautomation.com/services/real-estate",
        title: "24/7 AI Real Estate Assistant",
        content: "Automated property inquiries, qualification, and viewing bookings. Our AI Real Estate Assistant handles property inquiries automatically 24/7. It answers questions about listings, qualifies buyer interest, collects contact details, and books property viewings - all without human intervention.",
      },
      {
        url: "https://onetechautomation.com/services/property-scraping",
        title: "Real-Time Property Scraping + Lead Qualification",
        content: "Auto-detect new property listings, match them with your buyer database, and qualify leads in real-time. When a property matching a buyer's criteria appears, the system instantly notifies them and starts the qualification process.",
      },
      {
        url: "https://onetechautomation.com/services/missed-call",
        title: "Missed Call AI - SMS Lead Recovery",
        content: "Instantly reply to missed calls with personalized SMS and recover lost leads. When someone calls and you can't answer, the system instantly sends them a personalized SMS with your AI assistant link, recovering the lead immediately. This is our highest-ROI service. Most businesses lose 30-50% of leads from missed calls.",
      },
      {
        url: "https://onetechautomation.com/services/dm-sales",
        title: "WhatsApp & Instagram DM Sales Systems",
        content: "Turn DMs into 24/7 automated sales funnels. The AI assistant handles product questions, sends catalogs, processes orders, and nurtures leads automatically. Perfect for e-commerce brands and service businesses that get lots of DM inquiries.",
      },
      {
        url: "https://onetechautomation.com/services/revenue-leak",
        title: "Revenue Leak Prevention Systems",
        content: "Identify and recover lost leads across your entire funnel. We analyze where leads drop off - missed calls, unanswered messages, abandoned carts, no-show appointments - and implement automation to recover them. Most businesses are already paying for traffic but losing 30-50% of potential revenue.",
      },
      {
        url: "https://onetechautomation.com/services/telegram",
        title: "Telegram Mini-Shops + Multi-Channel Nurturing",
        content: "Sell directly inside Telegram with automated follow-up across channels. Customers browse products and buy directly inside Telegram. Combined with our multi-channel nurturing system via Telegram, WhatsApp, and email.",
      },
      {
        url: "https://onetechautomation.com/services/silent-salesman",
        title: "Silent Salesman AI System for Enterprise",
        content: "Scalable AI sales engine for €2M+ businesses. A complete enterprise AI sales engine that handles lead capture, qualification, nurturing, and conversion across all your channels simultaneously. Think of it as hiring 10 sales reps that work 24/7 and never miss a lead.",
      },
      {
        url: "https://onetechautomation.com/services/ai-receptionist",
        title: "AI Receptionist for Beauty & Medical Clinics",
        content: "24/7 booking, lead qualification, and appointment automation. Handles booking, answers common questions, books appointments 24/7, sends reminders, and qualifies leads before they reach your staff. Reduces no-shows and captures bookings outside business hours.",
      },
    ];

    // Insert pages into knowledge_sources
    for (const page of onetechPages) {
      await supabase
        .from("knowledge_sources")
        .upsert({
          source_type: "website",
          url: page.url,
          title: page.title,
          content: page.content,
          approved: true,
          last_crawled_at: new Date().toISOString(),
        }, {
          onConflict: "url",
        });
    }

    return res.status(200).json({
      success: true,
      message: "O.N.E.Tech knowledge base seeded successfully",
      pages_added: onetechPages.length,
    });
  } catch (error) {
    console.error("Crawl error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}