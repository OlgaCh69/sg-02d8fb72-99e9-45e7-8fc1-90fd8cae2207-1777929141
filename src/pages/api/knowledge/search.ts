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
    const { query, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const lowerQuery = query.toLowerCase();
    const queryWords = lowerQuery.split(" ").filter((word: string) => word.length > 3);

    const results: any[] = [];

    // 1. Search manual FAQ
    const { data: knowledgeBase } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("is_active", true);

    if (knowledgeBase) {
      for (const entry of knowledgeBase) {
        const entryWords = entry.question.toLowerCase().split(" ");
        const matchCount = entryWords.filter((word: string) => 
          lowerQuery.includes(word) && word.length > 3
        ).length;

        if (matchCount >= 1) {
          results.push({
            type: "knowledge_base",
            title: entry.question,
            content: entry.answer,
            url: `FAQ: ${entry.question}`,
            score: matchCount * 10,
          });
        }
      }
    }

    // 2. Search website pages
    const { data: websitePages } = await supabase
      .from("knowledge_sources")
      .select("*")
      .eq("source_type", "website")
      .eq("approved", true);

    if (websitePages && queryWords.length > 0) {
      for (const page of websitePages) {
        const contentLower = page.content.toLowerCase();
        let score = 0;
        
        for (const word of queryWords) {
          if (contentLower.includes(word)) score++;
        }

        if (score > 0) {
          // Extract relevant snippet
          const firstWordMatch = queryWords.find(w => contentLower.includes(w)) || queryWords[0];
          const idx = contentLower.indexOf(firstWordMatch);
          const start = Math.max(0, idx - 100);
          const end = Math.min(page.content.length, idx + 300);
          const snippet = page.content.substring(start, end).trim();

          results.push({
            type: "website_page",
            title: page.title,
            content: snippet,
            url: page.url,
            score: score * 5,
          });
        }
      }
    }

    // 3. Search documents
    const { data: documents } = await supabase
      .from("documents")
      .select("*")
      .eq("status", "approved");

    if (documents && queryWords.length > 0) {
      for (const doc of documents) {
        const contentLower = doc.content.toLowerCase();
        let score = 0;
        
        for (const word of queryWords) {
          if (contentLower.includes(word)) score++;
        }

        if (score > 0) {
          const firstWordMatch = queryWords.find(w => contentLower.includes(w)) || queryWords[0];
          const idx = contentLower.indexOf(firstWordMatch);
          const start = Math.max(0, idx - 100);
          const end = Math.min(doc.content.length, idx + 300);
          const snippet = doc.content.substring(start, end).trim();

          results.push({
            type: "document",
            title: doc.title,
            content: snippet,
            url: `Document: ${doc.title}`,
            score: score * 5,
          });
        }
      }
    }

    // Sort by score and limit
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return res.status(200).json({ results: sortedResults });
  } catch (error) {
    console.error("Knowledge search error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}