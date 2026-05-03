import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

// Simple content extractor - removes HTML tags and cleans text
function extractContent(html: string): string {
  // Remove scripts and styles
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  
  // Remove common navigation/footer patterns
  text = text.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "");
  text = text.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "");
  text = text.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "");
  
  // Remove cookie banners and common class patterns
  text = text.replace(/<div[^>]*class="[^"]*cookie[^"]*"[^>]*>.*?<\/div>/gis, "");
  text = text.replace(/<div[^>]*id="[^"]*cookie[^"]*"[^>]*>.*?<\/div>/gis, "");
  
  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, " ");
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  
  // Clean up whitespace
  text = text.replace(/\s+/g, " ");
  text = text.trim();
  
  return text;
}

// Generate hash for content change detection
async function generateHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Extract links from HTML
function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const url = new URL(match[1], baseUrl);
      if (url.origin === new URL(baseUrl).origin) {
        links.push(url.href);
      }
    } catch (e) {
      // Invalid URL, skip
    }
  }
  
  return [...new Set(links)];
}

// Fetch and parse sitemap
async function fetchSitemap(websiteUrl: string): Promise<string[]> {
  try {
    const sitemapUrl = new URL("/sitemap.xml", websiteUrl).href;
    const response = await fetch(sitemapUrl);
    
    if (!response.ok) return [];
    
    const xml = await response.text();
    const urlRegex = /<loc>([^<]+)<\/loc>/g;
    const urls: string[] = [];
    let match;
    
    while ((match = urlRegex.exec(xml)) !== null) {
      urls.push(match[1]);
    }
    
    return urls;
  } catch (error) {
    return [];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { websiteUrl } = req.body;
    
    if (!websiteUrl) {
      return res.status(400).json({ error: "Website URL is required" });
    }

    // Get crawl settings
    const { data: settings } = await supabase
      .from("crawl_settings")
      .select("*")
      .eq("website_url", websiteUrl)
      .single();

    if (!settings?.is_active) {
      return res.status(400).json({ error: "Crawling is not enabled for this website" });
    }

    const crawlId = `crawl_${Date.now()}`;
    
    // Create crawl log
    await supabase.from("crawl_logs").insert({
      crawl_id: crawlId,
      started_at: new Date().toISOString(),
      status: "running",
    });

    // Try to get URLs from sitemap first
    let urlsToCrawl = await fetchSitemap(websiteUrl);
    
    // If no sitemap, start with homepage and crawl links
    if (urlsToCrawl.length === 0) {
      urlsToCrawl = [websiteUrl];
    }

    const excludedPatterns = settings.excluded_patterns || [];
    const maxPages = settings.max_pages || 100;
    const crawled: string[] = [];
    const toVisit = [...urlsToCrawl];
    const visited = new Set<string>();
    
    let pagesNew = 0;
    let pagesUpdated = 0;
    const errors: string[] = [];

    while (toVisit.length > 0 && crawled.length < maxPages) {
      const url = toVisit.shift();
      if (!url || visited.has(url)) continue;
      
      // Check if URL should be excluded
      const shouldExclude = excludedPatterns.some(pattern => url.includes(pattern));
      if (shouldExclude) continue;
      
      visited.add(url);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          errors.push(`Failed to fetch ${url}: ${response.status}`);
          continue;
        }

        const html = await response.text();
        
        // Extract title
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : "";
        
        // Extract meta description
        const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
        const metaDescription = metaMatch ? metaMatch[1] : "";
        
        // Extract and clean content
        const content = extractContent(html);
        const wordCount = content.split(/\s+/).length;
        const contentHash = await generateHash(content);

        // Check if page exists
        const { data: existingPage } = await supabase
          .from("website_pages")
          .select("id, content_hash")
          .eq("url", url)
          .single();

        if (existingPage) {
          // Update only if content changed
          if (existingPage.content_hash !== contentHash) {
            await supabase
              .from("website_pages")
              .update({
                title,
                content,
                content_hash: contentHash,
                meta_description: metaDescription,
                word_count: wordCount,
                last_crawled: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingPage.id);
            pagesUpdated++;
          }
        } else {
          // Insert new page
          await supabase.from("website_pages").insert({
            url,
            title,
            content,
            content_hash: contentHash,
            meta_description: metaDescription,
            word_count: wordCount,
            status: "pending",
          });
          pagesNew++;
        }

        crawled.push(url);

        // If we started from homepage, extract more links
        if (urlsToCrawl.length === 1 && toVisit.length < maxPages) {
          const links = extractLinks(html, url);
          links.forEach(link => {
            if (!visited.has(link) && !toVisit.includes(link)) {
              toVisit.push(link);
            }
          });
        }
      } catch (error: any) {
        errors.push(`Error crawling ${url}: ${error.message}`);
      }
    }

    // Update crawl log
    await supabase
      .from("crawl_logs")
      .update({
        completed_at: new Date().toISOString(),
        pages_found: urlsToCrawl.length,
        pages_crawled: crawled.length,
        pages_updated: pagesUpdated,
        pages_new: pagesNew,
        errors: errors.length > 0 ? errors : [],
        status: "completed",
      })
      .eq("crawl_id", crawlId);

    // Update last crawl in settings
    await supabase
      .from("crawl_settings")
      .update({
        last_crawl_completed: new Date().toISOString(),
      })
      .eq("website_url", websiteUrl);

    return res.status(200).json({
      success: true,
      crawl_id: crawlId,
      pages_crawled: crawled.length,
      pages_new: pagesNew,
      pages_updated: pagesUpdated,
      errors: errors.length,
    });
  } catch (error: any) {
    console.error("Crawl error:", error);
    return res.status(500).json({ error: error.message });
  }
}