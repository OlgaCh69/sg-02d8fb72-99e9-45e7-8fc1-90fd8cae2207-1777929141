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
    const { category } = req.query;

    // Get active template for category
    const { data: template } = await supabase
      .from("prompt_templates")
      .select("id")
      .eq("category", category || "system")
      .eq("is_active", true)
      .single();

    if (!template) {
      return res.status(404).json({ error: "No active template found" });
    }

    // Get published version
    const { data: version } = await supabase
      .from("prompt_versions")
      .select("*")
      .eq("template_id", template.id)
      .eq("is_published", true)
      .single();

    if (!version) {
      return res.status(404).json({ error: "No published version found" });
    }

    return res.status(200).json({
      prompt_content: version.prompt_content,
      system_instructions: version.system_instructions,
      temperature: version.temperature,
      max_tokens: version.max_tokens,
      version_id: version.id,
    });
  } catch (error) {
    console.error("Get prompt error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}