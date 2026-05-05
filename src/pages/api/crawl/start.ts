import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CrawlResult {
  url: string;
  title: string;
  content: string;
  wordCount: number;
  links: string[];
  error?: string;
}

// Extract clean text from HTML
function extractTextContent(html: string): string {
  const $ = cheerio.load(html);
  
  // Remove script, style, nav, footer, header tags
  $('script, style, nav, footer, header, .header, .footer, .navigation').remove();
  
  // Get main content (try common content selectors)
  let content = $('main, article, .content, .main-content, #content, #main').text();
  
  // Fallback to body if no main content found
  if (!content || content.trim().length < 100) {
    content = $('body').text();
  }
  
  // Clean up whitespace
  return content
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}

// Extract internal links
function extractLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links: Set<string> = new Set();
  const baseDomain = new URL(baseUrl).hostname;
  
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;
    
    try {
      const absoluteUrl = new URL(href, baseUrl);
      
      // Only internal links from same domain
      if (absoluteUrl.hostname === baseDomain) {
        // Remove hash and query params
        const cleanUrl = `${absoluteUrl.origin}${absoluteUrl.pathname}`;
        if (cleanUrl !== baseUrl) {
          links.add(cleanUrl);
        }
      }
    } catch (e) {
      // Invalid URL, skip
    }
  });
  
  return Array.from(links);
}

// Fetch and parse a single page
async function fetchPage(url: string): Promise<CrawlResult> {
  console.log(`📄 Fetching: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; O.N.E.Tech-Bot/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`✅ Fetched ${html.length} bytes from ${url}`);
    
    const $ = cheerio.load(html);
    const title = $('title').text() || $('h1').first().text() || 'Untitled';
    const content = extractTextContent(html);
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    const links = extractLinks(html, url);
    
    console.log(`📝 Extracted: "${title}" (${wordCount} words, ${links.length} links)`);
    
    return {
      url,
      title: title.substring(0, 200),
      content,
      wordCount,
      links,
    };
  } catch (error: any) {
    console.error(`❌ Failed to fetch ${url}:`, error.message);
    return {
      url,
      title: 'Error',
      content: '',
      wordCount: 0,
      links: [],
      error: error.message,
    };
  }
}

// Create knowledge chunks from content
function createChunks(content: string, chunkSize: number = 500): string[] {
  const words = content.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 50) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("=== CRAWL API CALLED ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  try {
    const { startUrl, maxPages = 10 } = req.body;

    if (!startUrl) {
      console.error("❌ Missing startUrl");
      return res.status(400).json({ error: "Missing startUrl parameter" });
    }

    // Validate URL
    let validatedUrl: string;
    try {
      const urlObj = new URL(startUrl);
      validatedUrl = urlObj.href;
      console.log("✅ Valid URL:", validatedUrl);
    } catch (e) {
      console.error("❌ Invalid URL:", startUrl);
      return res.status(400).json({ error: "Invalid URL format" });
    }

    console.log(`🚀 Starting crawl of ${validatedUrl} (max ${maxPages} pages)`);

    // Test database connection first
    console.log("🔌 Testing database connection...");
    const { data: testData, error: testError } = await supabase
      .from("website_pages")
      .select("id")
      .limit(1);
    
    if (testError) {
      console.error("❌ Database connection failed:", testError);
      return res.status(500).json({ 
        error: "Database connection failed", 
        details: testError.message 
      });
    }
    console.log("✅ Database connected successfully");

    // Create crawl log entry
    const { data: crawlLog, error: logError } = await supabase
      .from("crawl_logs")
      .insert({
        crawl_id: `crawl_${Date.now()}`,
        status: 'in_progress',
        pages_found: 0,
        pages_crawled: 0,
        pages_new: 0,
        pages_updated: 0,
        errors: [],
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (logError) {
      console.error("Failed to create crawl log:", logError);
    }

    const crawlId = crawlLog?.id || 'unknown';

    // Crawl pages
    const visitedUrls = new Set<string>();
    const urlQueue: string[] = [validatedUrl];
    const results: CrawlResult[] = [];
    const errors: string[] = [];

    while (urlQueue.length > 0 && visitedUrls.size < maxPages) {
      const currentUrl = urlQueue.shift()!;
      
      if (visitedUrls.has(currentUrl)) continue;
      visitedUrls.add(currentUrl);
      
      console.log(`📄 Crawling [${visitedUrls.size}/${maxPages}]: ${currentUrl}`);
      
      const result = await fetchPage(currentUrl);
      results.push(result);
      
      if (result.error) {
        errors.push(`${currentUrl}: ${result.error}`);
      } else {
        // Add discovered links to queue
        for (const link of result.links) {
          if (!visitedUrls.has(link) && urlQueue.length + visitedUrls.size < maxPages) {
            urlQueue.push(link);
          }
        }
      }
    }

    console.log(`\n=== CRAWL RESULTS ===`);
    console.log(`Pages visited: ${visitedUrls.size}`);
    console.log(`Pages processed: ${results.length}`);
    console.log(`Errors: ${errors.length}`);

    // Save to database
    let savedCount = 0;
    let updatedCount = 0;
    
    for (const result of results) {
      if (result.error) {
        // Save as error status
        const { error: saveError } = await supabase
          .from("website_pages")
          .upsert({
            url: result.url,
            title: result.title,
            status: 'error',
            word_count: 0,
            extracted_content: null,
            error_message: result.error,
            last_crawled_at: new Date().toISOString(),
            approved: false,
            excluded: false,
          }, {
            onConflict: 'url',
          });
        
        if (saveError) {
          console.error(`Failed to save error for ${result.url}:`, saveError);
          errors.push(`Database error for ${result.url}: ${saveError.message}`);
        }
        continue;
      }

      // Calculate content hash
      const contentHash = Buffer.from(result.content).toString('base64').substring(0, 64);

      // Check if page exists
      const { data: existingPage } = await supabase
        .from("website_pages")
        .select("id, content_hash")
        .eq("url", result.url)
        .single();

      const isNew = !existingPage;
      const isUpdated = existingPage && existingPage.content_hash !== contentHash;

      // Save page
      const { data: savedPage, error: pageError } = await supabase
        .from("website_pages")
        .upsert({
          url: result.url,
          title: result.title,
          status: 'indexed',
          word_count: result.wordCount,
          content_hash: contentHash,
          extracted_content: result.content,
          approved: false,
          excluded: false,
          error_message: null,
          last_crawled_at: new Date().toISOString(),
        }, {
          onConflict: 'url',
        })
        .select()
        .single();

      if (pageError) {
        console.error(`❌ Failed to save page ${result.url}:`, pageError);
        errors.push(`Database error for ${result.url}: ${pageError.message}`);
        continue;
      }

      console.log(`💾 Saved: "${result.title}" (${result.wordCount} words)`);

      if (isNew) savedCount++;
      if (isUpdated) updatedCount++;

      // Create knowledge chunks
      if (savedPage && result.content.length > 100) {
        const chunks = createChunks(result.content);
        
        // Delete old chunks if updating
        if (existingPage) {
          await supabase
            .from("knowledge_chunks")
            .delete()
            .eq("website_page_id", savedPage.id);
        }

        // Insert new chunks
        const chunksToInsert = chunks.map((chunk, index) => ({
          website_page_id: savedPage.id,
          chunk_text: chunk,
          chunk_index: index,
          approved: false,
          embedding_status: 'pending',
        }));

        const { error: chunksError } = await supabase
          .from("knowledge_chunks")
          .insert(chunksToInsert);

        if (chunksError) {
          console.error(`Failed to save chunks for ${result.url}:`, chunksError);
        } else {
          console.log(`✅ Created ${chunks.length} knowledge chunks`);
        }
      }
    }

    // Update crawl log
    if (crawlLog) {
      await supabase
        .from("crawl_logs")
        .update({
          status: errors.length > 0 ? 'completed_with_errors' : 'completed',
          pages_found: urlQueue.length + visitedUrls.size,
          pages_crawled: visitedUrls.size,
          pages_new: savedCount,
          pages_updated: updatedCount,
          errors: errors.length > 0 ? errors : null,
          completed_at: new Date().toISOString(),
        })
        .eq("id", crawlId);
    }

    console.log("\n✅ CRAWL COMPLETE!");
    console.log(`New pages: ${savedCount}`);
    console.log(`Updated pages: ${updatedCount}`);
    console.log(`Errors: ${errors.length}`);

    return res.status(200).json({
      success: true,
      message: `Crawled ${visitedUrls.size} pages successfully`,
      pagesProcessed: visitedUrls.size,
      knowledgeAdded: savedCount + updatedCount,
      errors: errors.length > 0 ? errors : undefined,
      visitedUrls: Array.from(visitedUrls),
    });

  } catch (error: any) {
    console.error("=== CRAWL ERROR ===");
    console.error(error);
    
    return res.status(500).json({
      error: "Crawl failed",
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    });
  }
}