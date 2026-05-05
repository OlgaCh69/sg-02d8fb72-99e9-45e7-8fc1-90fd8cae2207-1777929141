import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("🧪 TEST: Database Write Test");
  
  try {
    // Test 1: Can we connect?
    console.log("Test 1: Testing connection...");
    const { data: testSelect, error: selectError } = await supabase
      .from("website_pages")
      .select("id")
      .limit(1);
    
    if (selectError) {
      console.error("❌ SELECT failed:", selectError);
      return res.status(500).json({ 
        success: false, 
        test: "select",
        error: selectError.message 
      });
    }
    console.log("✅ SELECT works");

    // Test 2: Can we insert?
    console.log("Test 2: Testing insert...");
    const testPage = {
      url: `https://test-${Date.now()}.com`,
      title: "Test Page",
      status: "indexed",
      word_count: 100,
      content_hash: "test-hash",
      extracted_content: "Test content",
      approved: false,
      excluded: false,
      last_crawled_at: new Date().toISOString(),
    };

    const { data: insertData, error: insertError } = await supabase
      .from("website_pages")
      .insert(testPage)
      .select()
      .single();

    if (insertError) {
      console.error("❌ INSERT failed:", insertError);
      return res.status(500).json({ 
        success: false, 
        test: "insert",
        error: insertError.message,
        details: insertError
      });
    }
    console.log("✅ INSERT works:", insertData);

    // Test 3: Can we create crawl log?
    console.log("Test 3: Testing crawl log insert...");
    const { data: logData, error: logError } = await supabase
      .from("crawl_logs")
      .insert({
        crawl_id: `test_${Date.now()}`,
        status: 'completed',
        pages_found: 1,
        pages_crawled: 1,
        pages_new: 1,
        pages_updated: 0,
        errors: null,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (logError) {
      console.error("❌ CRAWL LOG INSERT failed:", logError);
      return res.status(500).json({ 
        success: false, 
        test: "crawl_log",
        error: logError.message 
      });
    }
    console.log("✅ CRAWL LOG INSERT works:", logData);

    return res.status(200).json({ 
      success: true,
      message: "All database operations work!",
      testPage: insertData,
      testLog: logData
    });

  } catch (error: any) {
    console.error("🚨 Test failed:", error);
    return res.status(500).json({ 
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}