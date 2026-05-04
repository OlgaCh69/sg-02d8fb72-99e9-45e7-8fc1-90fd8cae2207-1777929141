import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import crypto from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Missing query" });
    }

    // Generate query hash for caching
    const queryHash = crypto.createHash("md5").update(query.toLowerCase().trim()).digest("hex");

    // Check cache first
    const { data: cachedResult } = await supabase
      .from("knowledge_cache")
      .select("cached_results, hit_count")
      .eq("query_hash", queryHash)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cachedResult) {
      // Update hit count
      await supabase
        .from("knowledge_cache")
        .update({ hit_count: (cachedResult.hit_count || 0) + 1 })
        .eq("query_hash", queryHash);

      return res.status(200).json({
        results: cachedResult.cached_results,
        cached: true,
      });
    }

    const queryWords = query.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);

    // 1. Search Knowledge Base (FAQ)
    const { data: kbResults } = await supabase
      .from("knowledge_base")
      .select("question, answer")
      .eq("is_active", true);

    const kbMatches = kbResults?.filter((kb) => {
      const text = `${kb.question} ${kb.answer}`.toLowerCase();
      return queryWords.some(word => text.includes(word));
    }).map(kb => ({
      source_type: "faq",
      title: kb.question,
      content: kb.answer,
      url: null,
    })) || [];

    // 2. Search Website Pages
    const { data: websiteResults } = await supabase
      .from("knowledge_sources")
      .select("title, content, url")
      .eq("source_type", "website")
      .eq("approved", true);

    const websiteMatches = websiteResults?.filter((page) => {
      const text = `${page.title} ${page.content}`.toLowerCase();
      return queryWords.some(word => text.includes(word));
    }).map(page => ({
      source_type: "website",
      title: page.title,
      content: page.content?.substring(0, 300) || "",
      url: page.url,
    })) || [];

    // 3. Search Documents
    const { data: docResults } = await supabase
      .from("documents")
      .select("title, content")
      .eq("status", "approved");

    const docMatches = docResults?.filter((doc) => {
      const text = `${doc.title} ${doc.content}`.toLowerCase();
      return queryWords.some(word => text.includes(word));
    }).map(doc => ({
      source_type: "document",
      title: doc.title,
      content: doc.content?.substring(0, 300) || "",
      url: null,
    })) || [];

    // 4. Search Products
    const { data: productResults } = await supabase
      .from("products")
      .select("name, description, features")
      .eq("is_active", true);

    const productMatches = productResults?.filter((prod) => {
      const text = `${prod.name} ${prod.description} ${prod.features}`.toLowerCase();
      return queryWords.some(word => text.includes(word));
    }).map(prod => ({
      source_type: "product",
      title: prod.name,
      content: prod.description || "",
      url: null,
    })) || [];

    // Combine and prioritize: FAQ > Website > Documents > Products
    const allResults = [
      ...kbMatches,
      ...websiteMatches,
      ...docMatches,
      ...productMatches,
    ].slice(0, 5);

    // Cache the results
    if (allResults.length > 0) {
      await supabase.from("knowledge_cache").insert({
        query_text: query,
        query_hash: queryHash,
        cached_results: allResults,
      });
    }

    return res.status(200).json({
      results: allResults,
      cached: false,
    });
  } catch (error) {
    console.error("Knowledge search error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}