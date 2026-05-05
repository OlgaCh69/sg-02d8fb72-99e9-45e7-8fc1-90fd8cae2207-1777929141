import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      return res.status(400).json({ error: "Query is required" });
    }

    // Search approved knowledge sources
    const { data: knowledgeSources } = await supabase
      .from("knowledge_sources")
      .select("*")
      .eq("approved", true)
      .limit(5);

    // Search approved website pages
    const { data: websitePages } = await supabase
      .from("website_pages")
      .select("*")
      .eq("approved", true)
      .limit(5);

    // Combine knowledge
    const allKnowledge = [
      ...(knowledgeSources || []).map(k => ({
        title: k.title,
        content: k.content,
        url: k.url,
        type: "knowledge_source"
      })),
      ...(websitePages || []).map(p => ({
        title: p.title || "Untitled",
        content: p.extracted_content || "",
        url: p.url,
        type: "website_page"
      }))
    ];

    // Build context for AI
    const knowledgeContext = allKnowledge
      .map(k => `Source: ${k.title} (${k.url})\n${k.content.substring(0, 500)}`)
      .join("\n\n");

    // Ask OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a knowledge testing assistant. Answer the user's question based ONLY on the provided company knowledge. If the knowledge doesn't contain the answer, say "I'm not 100% sure from the website information I have, but I can check with the team for you."\n\nKNOWLEDGE:\n${knowledgeContext}`
        },
        {
          role: "user",
          content: query
        }
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const answer = completion.choices[0]?.message?.content || "No answer generated";

    // Determine if answer came from website knowledge
    const fromWebsite = !answer.toLowerCase().includes("not 100% sure") && 
                        !answer.toLowerCase().includes("don't have information");

    // Extract sources that were likely used (simple keyword match)
    const sources = allKnowledge
      .filter(k => {
        const keywords = k.title.toLowerCase().split(" ");
        return keywords.some(keyword => 
          query.toLowerCase().includes(keyword) || 
          answer.toLowerCase().includes(keyword)
        );
      })
      .slice(0, 3)
      .map(k => ({
        title: k.title,
        url: k.url,
        excerpt: k.content.substring(0, 200) + "...",
        type: k.type
      }));

    // Calculate confidence (simple heuristic)
    const confidence = fromWebsite && sources.length > 0 ? 85 : 50;

    return res.status(200).json({
      answer,
      sources,
      confidence,
      fromWebsite,
      query
    });

  } catch (error) {
    console.error("Knowledge search error:", error);
    return res.status(500).json({ 
      error: "Failed to search knowledge",
      answer: "An error occurred while searching the knowledge base."
    });
  }
}