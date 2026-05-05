import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Log everything for debugging
  console.log("=== CRAWL API CALLED ===");
  console.log("Method:", req.method);
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("Headers:", req.headers["content-type"]);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { startUrl, maxPages = 10 } = req.body;

    console.log("Parsed params:", { startUrl, maxPages });

    // Validate startUrl
    if (!startUrl || typeof startUrl !== 'string' || !startUrl.trim()) {
      console.error("❌ Invalid startUrl:", { startUrl, type: typeof startUrl });
      return res.status(400).json({ 
        error: "Missing startUrl",
        message: "Please provide a valid website URL to crawl",
        received: { startUrl, maxPages, body: req.body }
      });
    }

    // Validate URL format
    let validUrl: URL;
    try {
      const urlToCrawl = startUrl.trim();
      validUrl = new URL(urlToCrawl);
      
      if (!validUrl.protocol.startsWith('http')) {
        throw new Error('URL must use HTTP or HTTPS protocol');
      }
      
      console.log("✅ Valid URL:", validUrl.href);
    } catch (e) {
      console.error("❌ Invalid URL format:", startUrl, e);
      return res.status(400).json({ 
        error: "Invalid URL",
        message: `"${startUrl}" is not a valid URL. Use format: https://example.com`,
      });
    }

    // Create Supabase client with service role for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log("🚀 Starting crawl...");

    const baseUrl = `${validUrl.protocol}//${validUrl.host}`;
    const visitedUrls = new Set<string>();
    const urlQueue = [validUrl.href];
    let knowledgeAdded = 0;
    const errors: string[] = [];

    while (urlQueue.length > 0 && visitedUrls.size < maxPages) {
      const currentUrl = urlQueue.shift();
      if (!currentUrl || visitedUrls.has(currentUrl)) continue;

      try {
        visitedUrls.add(currentUrl);
        console.log(`📄 Crawling [${visitedUrls.size}/${maxPages}]: ${currentUrl}`);

        const response = await fetch(currentUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ONETechBot/1.0)',
          },
          signal: AbortSignal.timeout(15000), // 15 second timeout
        });

        if (!response.ok) {
          const errorMsg = `Failed ${currentUrl}: HTTP ${response.status}`;
          console.warn("⚠️", errorMsg);
          errors.push(errorMsg);
          continue;
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) {
          console.log(`⏭️ Skipping non-HTML: ${currentUrl} (${contentType})`);
          continue;
        }

        const html = await response.text();
        console.log(`✅ Fetched ${html.length} bytes from ${currentUrl}`);

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : new URL(currentUrl).pathname;

        // Extract text content (remove scripts, styles, tags)
        const textContent = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        console.log(`📝 Extracted ${textContent.length} chars of text`);

        if (textContent.length > 200) {
          const contentToSave = textContent.substring(0, 5000);
          const wordCount = contentToSave.split(/\s+/).length;

          console.log(`💾 Saving to database: "${title}" (${wordCount} words)`);

          const { error: insertError } = await supabase
            .from("knowledge_sources")
            .insert({
              url: currentUrl,
              title: title,
              content: contentToSave,
              word_count: wordCount,
              approved: false,
              last_crawled_at: new Date().toISOString()
            });

          if (insertError) {
            console.error("❌ Database insert failed:", insertError);
            errors.push(`Failed to save "${title}": ${insertError.message}`);
          } else {
            knowledgeAdded++;
            console.log(`✅ Saved [${knowledgeAdded}]: ${title}`);
          }
        } else {
          console.log(`⏭️ Skipping (too short): ${title}`);
        }

        // Extract links for further crawling
        if (visitedUrls.size < maxPages) {
          const linkMatches = html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi);
          let linksFound = 0;
          
          for (const match of linkMatches) {
            try {
              const linkUrl = new URL(match[1], currentUrl);
              if (linkUrl.origin === baseUrl && !visitedUrls.has(linkUrl.href)) {
                urlQueue.push(linkUrl.href);
                linksFound++;
              }
            } catch (e) {
              // Invalid URL, skip
            }
          }
          
          console.log(`🔗 Found ${linksFound} internal links`);
        }

      } catch (error) {
        const errorMsg = `Error crawling ${currentUrl}: ${error instanceof Error ? error.message : 'Unknown'}`;
        console.error("❌", errorMsg);
        errors.push(errorMsg);
      }
    }

    const result = {
      success: true,
      pagesProcessed: visitedUrls.size,
      knowledgeAdded,
      visitedUrls: Array.from(visitedUrls),
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined // Limit error list
    };

    console.log("=== CRAWL COMPLETE ===");
    console.log(JSON.stringify(result, null, 2));

    return res.status(200).json(result);

  } catch (error) {
    console.error("=== FATAL CRAWL ERROR ===");
    console.error(error);
    
    return res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    });
  }
}