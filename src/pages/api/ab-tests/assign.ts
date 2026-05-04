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
    const { visitorId, testName } = req.body;

    if (!visitorId || !testName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get active variants for this test
    const { data: variants } = await supabase
      .from("ab_test_variants")
      .select("*")
      .eq("test_name", testName)
      .eq("is_active", true);

    if (!variants || variants.length === 0) {
      return res.status(404).json({ error: "No active variants found" });
    }

    // Check if already assigned
    const { data: existing } = await supabase
      .from("ab_test_assignments")
      .select("variant_id, ab_test_variants(variant_name, variant_config)")
      .eq("visitor_id", visitorId)
      .in("variant_id", variants.map(v => v.id))
      .single();

    if (existing) {
      return res.status(200).json({
        assigned: true,
        variant: existing.ab_test_variants,
      });
    }

    // Assign variant based on traffic percentage
    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedVariant = variants[0];

    for (const variant of variants) {
      cumulative += variant.traffic_percentage;
      if (random <= cumulative) {
        selectedVariant = variant;
        break;
      }
    }

    // Create assignment
    await supabase.from("ab_test_assignments").insert({
      visitor_id: visitorId,
      variant_id: selectedVariant.id,
    });

    return res.status(200).json({
      assigned: true,
      variant: {
        variant_name: selectedVariant.variant_name,
        variant_config: selectedVariant.variant_config,
      },
    });
  } catch (error) {
    console.error("AB test assignment error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}