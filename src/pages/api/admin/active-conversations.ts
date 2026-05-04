import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get admin user from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get all active conversations
    const { data: conversations } = await supabase
      .from("conversations")
      .select(`
        *,
        visitor_profiles!conversations_visitor_profile_id_fkey (
          id,
          visitor_id,
          name,
          email,
          company,
          lead_score,
          lead_status
        ),
        messages!messages_conversation_id_fkey (
          id,
          role,
          content,
          created_at,
          message_type,
          sent_by_admin
        )
      `)
      .eq("status", "open")
      .order("started_at", { ascending: false });

    // Get last message for each conversation
    const conversationsWithLastMessage = conversations?.map(conv => {
      const messages = conv.messages || [];
      const lastMessage = messages.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      return {
        ...conv,
        last_message: lastMessage,
        message_count: messages.length,
      };
    }) || [];

    return res.status(200).json({
      conversations: conversationsWithLastMessage,
    });
  } catch (error) {
    console.error("Active conversations error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}