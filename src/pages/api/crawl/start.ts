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
    const { startUrl, maxPages = 10 } = req.body;

    // Validate startUrl
    if (!startUrl || typeof startUrl !== 'string' || !startUrl.trim()) {
      return res.status(400).json({ 
        error: "Missing or invalid startUrl parameter",
        message: "Please provide a valid website URL to crawl"
      });
    }

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(startUrl.trim());
      if (!validUrl.protocol.startsWith('http')) {
        throw new Error('URL must use HTTP or HTTPS protocol');
      }
    } catch (e) {
      return res.status(400).json({ 
        error: "Invalid URL format",
        message: "Please provide a valid URL (e.g., https://example.com)"
      });
    }

    const baseUrl = `${validUrl.protocol}//${validUrl.host}`;
    const visitedUrls = new Set<string>();
    const urlQueue = [startUrl.trim()];
    let knowledgeAdded = 0;

    while (urlQueue.length > 0 && visitedUrls.size < maxPages) {
      const currentUrl = urlQueue.shift();
      if (!currentUrl || visitedUrls.has(currentUrl)) continue;

      try {
        visitedUrls.add(currentUrl);

        const response = await fetch(currentUrl, {
          headers: {
            'User-Agent': 'O.N.E.Tech AI Assistant Crawler/1.0',
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (!response.ok) {
          console.warn(`Failed to fetch ${currentUrl}: ${response.status}`);
          continue;
        }

        const html = await response.text();

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : new URL(currentUrl).pathname;

        // Extract text content (simple extraction)
        const textContent = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (textContent.length > 100) {
          // Save to knowledge sources
          await supabase.from("knowledge_sources").insert({
            url: currentUrl,
            title: title,
            content: textContent.substring(0, 5000),
            word_count: textContent.split(/\s+/).length,
            approved: false,
            last_crawled_at: new Date().toISOString()
          });
          knowledgeAdded++;
        }

        // Extract links for further crawling
        if (visitedUrls.size < maxPages) {
          const linkMatches = html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi);
          for (const match of linkMatches) {
            try {
              const linkUrl = new URL(match[1], currentUrl);
              if (linkUrl.origin === baseUrl && !visitedUrls.has(linkUrl.href)) {
                urlQueue.push(linkUrl.href);
              }
            } catch (e) {
              // Invalid URL, skip
            }
          }
        }
      } catch (error) {
        console.error(`Error crawling ${currentUrl}:`, error);
      }
    }

    return res.status(200).json({
      success: true,
      pagesProcessed: visitedUrls.size,
      knowledgeAdded,
      visitedUrls: Array.from(visitedUrls),
    });
  } catch (error) {
    console.error("Crawl error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
}