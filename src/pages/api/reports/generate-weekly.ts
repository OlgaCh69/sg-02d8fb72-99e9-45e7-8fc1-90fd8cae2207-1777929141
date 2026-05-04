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
    // Calculate week range (Monday to Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust so Monday = 0
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - diff - 7); // Last week
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Gather stats
    const [
      { data: profiles },
      { data: conversations },
      { data: leads },
      { data: hotLeads },
      { data: appointments },
      { data: crmFails },
      { data: messages },
    ] = await Promise.all([
      supabase
        .from("visitor_profiles")
        .select("id")
        .gte("created_at", weekStart.toISOString())
        .lte("created_at", weekEnd.toISOString()),
      supabase
        .from("conversations")
        .select("id, page_url")
        .gte("started_at", weekStart.toISOString())
        .lte("started_at", weekEnd.toISOString()),
      supabase
        .from("leads")
        .select("id")
        .gte("created_at", weekStart.toISOString())
        .lte("created_at", weekEnd.toISOString()),
      supabase
        .from("visitor_profiles")
        .select("id")
        .eq("lead_status", "HOT")
        .gte("updated_at", weekStart.toISOString())
        .lte("updated_at", weekEnd.toISOString()),
      supabase
        .from("appointments")
        .select("id")
        .gte("created_at", weekStart.toISOString())
        .lte("created_at", weekEnd.toISOString()),
      supabase
        .from("crm_sync_logs")
        .select("id")
        .eq("status", "failed")
        .gte("created_at", weekStart.toISOString())
        .lte("created_at", weekEnd.toISOString()),
      supabase
        .from("messages")
        .select("content, role")
        .eq("role", "user")
        .gte("created_at", weekStart.toISOString())
        .lte("created_at", weekEnd.toISOString()),
    ]);

    // Analyze top questions (basic frequency count)
    const questionCounts: Record<string, number> = {};
    messages?.forEach((msg) => {
      const question = msg.content?.toLowerCase().trim();
      if (question && question.length > 10) {
        questionCounts[question] = (questionCounts[question] || 0) + 1;
      }
    });

    const topQuestions = Object.entries(questionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([q, count]) => ({ question: q, count }));

    // Analyze best converting pages
    const pageCounts: Record<string, { chats: number; leads: number }> = {};
    conversations?.forEach((conv) => {
      const page = conv.page_url || "unknown";
      if (!pageCounts[page]) {
        pageCounts[page] = { chats: 0, leads: 0 };
      }
      pageCounts[page].chats += 1;
    });

    const bestPages = Object.entries(pageCounts)
      .map(([page, data]) => ({ page, chats: data.chats, conversion: 0 }))
      .sort((a, b) => b.chats - a.chats)
      .slice(0, 5);

    // Save report
    const reportData = {
      total_visitors: profiles?.length || 0,
      total_chats: conversations?.length || 0,
      total_leads: leads?.length || 0,
      hot_leads: hotLeads?.length || 0,
      total_bookings: appointments?.length || 0,
      failed_crm_syncs: crmFails?.length || 0,
      top_questions: topQuestions,
      best_converting_pages: bestPages,
    };

    const { data: report } = await supabase
      .from("weekly_reports")
      .insert({
        report_week_start: weekStart.toISOString().split("T")[0],
        report_week_end: weekEnd.toISOString().split("T")[0],
        total_visitors: reportData.total_visitors,
        total_chats: reportData.total_chats,
        total_leads: reportData.total_leads,
        hot_leads: reportData.hot_leads,
        total_bookings: reportData.total_bookings,
        failed_crm_syncs: reportData.failed_crm_syncs,
        top_questions: topQuestions,
        best_converting_pages: bestPages,
        report_data: reportData,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    // TODO: Send email via your email service provider
    // For now, just return the report
    return res.status(200).json({ success: true, report: reportData });
  } catch (error) {
    console.error("Weekly report generation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}