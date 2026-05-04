import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

/**
 * Determine which playbook to execute based on intent
 */
export async function selectPlaybook(intent: string): Promise<any | null> {
  const { data: playbooks } = await supabase
    .from("playbooks")
    .select("*")
    .eq("is_active", true)
    .order("priority", { ascending: false });

  if (!playbooks || playbooks.length === 0) return null;

  // Match intent to playbook trigger
  const matched = playbooks.find((p) => {
    if (!p.intent_trigger) return false;
    return intent.toLowerCase().includes(p.intent_trigger.toLowerCase());
  });

  return matched || null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { conversationId, intent } = req.body;

    if (!conversationId || !intent) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Select appropriate playbook
    const playbook = await selectPlaybook(intent);

    if (!playbook) {
      return res.status(200).json({ playbookFound: false });
    }

    // Create playbook execution
    const { data: execution, error } = await supabase
      .from("playbook_executions")
      .insert({
        conversation_id: conversationId,
        playbook_id: playbook.id,
        current_step: 0,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Playbook execution error:", error);
      return res.status(500).json({ error: "Failed to execute playbook" });
    }

    return res.status(200).json({
      playbookFound: true,
      playbook,
      execution,
      nextStep: playbook.flow_steps?.[0] || null,
    });
  } catch (error) {
    console.error("Playbook error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}