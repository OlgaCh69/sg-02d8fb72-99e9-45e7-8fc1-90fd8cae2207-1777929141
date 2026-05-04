import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import {
  Globe,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Settings,
  Play,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";

type CrawlSettings = {
  id: string;
  website_url: string;
  crawl_frequency: string;
  excluded_patterns: string[];
  max_pages: number;
  last_crawl_started: string | null;
  last_crawl_completed: string | null;
  is_active: boolean;
};

type WebsitePage = {
  id: string;
  url: string;
  title: string;
  content: string;
  word_count: number;
  approved: boolean;
  last_crawled_at: string;
};

type CrawlLog = {
  id: string;
  crawl_id: string;
  started_at: string;
  completed_at: string | null;
  pages_found: number;
  pages_crawled: number;
  pages_updated: number;
  pages_new: number;
  errors: string[];
  status: string;
};

export default function WebsiteSyncPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [settings, setSettings] = useState<CrawlSettings | null>(null);
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [logs, setLogs] = useState<CrawlLog[]>([]);
  const [formData, setFormData] = useState({
    website_url: "",
    crawl_frequency: "weekly",
    excluded_patterns: "",
    max_pages: 100,
    is_active: true,
  });

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
    }
  };

  const loadData = async () => {
    setLoading(true);
    
    const { data: settingsData } = await supabase
      .from("crawl_settings")
      .select("*")
      .limit(1)
      .single();

    if (settingsData) {
      setSettings(settingsData);
      setFormData({
        website_url: settingsData.website_url,
        crawl_frequency: settingsData.crawl_frequency,
        excluded_patterns: settingsData.excluded_patterns?.join("\n") || "",
        max_pages: settingsData.max_pages,
        is_active: settingsData.is_active,
      });
    }

    const { data: pagesData } = await supabase
      .from("knowledge_sources")
      .select("*")
      .order("last_crawled_at", { ascending: false })
      .limit(50);

    if (pagesData) setPages(pagesData);

    const { data: logsData } = await supabase
      .from("crawl_logs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(10);

    if (logsData) setLogs(logsData);

    setLoading(false);
  };

  const handleSaveSettings = async () => {
    const settingsPayload = {
      website_url: formData.website_url,
      crawl_frequency: formData.crawl_frequency,
      excluded_patterns: formData.excluded_patterns
        .split("\n")
        .map(p => p.trim())
        .filter(p => p.length > 0),
      max_pages: formData.max_pages,
      is_active: formData.is_active,
    };

    if (settings) {
      await supabase
        .from("crawl_settings")
        .update(settingsPayload)
        .eq("id", settings.id);
    } else {
      await supabase.from("crawl_settings").insert(settingsPayload);
    }

    alert("Settings saved!");
    loadData();
  };

  const handleStartCrawl = async () => {
    if (!formData.website_url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a website URL",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    try {
      new URL(formData.website_url);
    } catch (e) {
      toast({
        title: "Error",
        description: "Please enter a valid URL (e.g., https://example.com)",
        variant: "destructive",
      });
      return;
    }

    setCrawling(true);
    try {
      const response = await fetch("/api/crawl/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          startUrl: formData.website_url,
          maxPages: formData.max_pages 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Crawl failed");
      }

      toast({
        title: "Success",
        description: `Crawled ${data.pagesProcessed || 0} pages and added ${data.knowledgeAdded || 0} knowledge entries`,
      });

      setCrawling(false);
      loadData();
    } catch (error: any) {
      console.error("Crawl error:", error);
      toast({
        title: "Crawl Failed",
        description: error.message || "Failed to crawl website",
        variant: "destructive",
      });
      setCrawling(false);
    }
  };

  const handlePageAction = async (pageId: string, action: "approve" | "exclude" | "delete") => {
    if (action === "delete") {
      if (!confirm("Are you sure you want to delete this page?")) return;
      await supabase.from("knowledge_sources").delete().eq("id", pageId);
    } else {
      await supabase
        .from("knowledge_sources")
        .update({ approved: action === "approve" })
        .eq("id", pageId);
    }
    loadData();
  };

  const stats = {
    total: pages.length,
    approved: pages.filter(p => p.approved === true).length,
    pending: pages.filter(p => p.approved === false).length,
    excluded: 0,
  };

  return (
    <AdminLayout>
      <SEO title="Website Sync - AI Assistant Admin" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Website Knowledge Sync</h1>
            <p className="text-slate-600">Automatically crawl and learn from your website</p>
          </div>
          <Button
            onClick={handleStartCrawl}
            disabled={crawling || !formData.is_active}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {crawling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Crawling...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Crawl
              </>
            )}
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Total Pages</span>
              </div>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Approved</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Pending</span>
              </div>
              <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <EyeOff className="h-4 w-4" />
                <span className="text-sm">Excluded</span>
              </div>
              <p className="text-3xl font-bold">{stats.excluded}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Crawl Settings
            </CardTitle>
            <CardDescription>Configure how your website is crawled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Crawl Frequency</Label>
                <select
                  value={formData.crawl_frequency}
                  onChange={(e) => setFormData({ ...formData, crawl_frequency: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-slate-200"
                >
                  <option value="manual">Manual Only</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Max Pages</Label>
                <Input
                  type="number"
                  value={formData.max_pages}
                  onChange={(e) => setFormData({ ...formData, max_pages: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Excluded URL Patterns (one per line)</Label>
              <Textarea
                placeholder="/admin&#10;/login&#10;/wp-admin"
                value={formData.excluded_patterns}
                onChange={(e) => setFormData({ ...formData, excluded_patterns: e.target.value })}
                rows={4}
              />
              <p className="text-sm text-slate-500">
                Pages containing these patterns will be skipped
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Enable Automatic Crawling</Label>
            </div>

            <Button onClick={handleSaveSettings} className="bg-indigo-600 hover:bg-indigo-700">
              Save Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crawled Pages</CardTitle>
            <CardDescription>Manage content extracted from your website</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <p className="text-center py-8 text-slate-500">Loading pages...</p>
              ) : pages.length === 0 ? (
                <p className="text-center py-8 text-slate-500">
                  No pages crawled yet. Click "Start Crawl" to begin.
                </p>
              ) : (
                pages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-start justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{page.title || "Untitled"}</h3>
                        <Badge
                          variant={
                            page.approved
                              ? "default"
                              : "outline"
                          }
                        >
                          {page.approved ? "approved" : "pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{page.url}</p>
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span>{page.word_count} words</span>
                        <span>
                          Last crawled: {page.last_crawled_at ? new Date(page.last_crawled_at).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!page.approved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePageAction(page.id, "approve")}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {page.approved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePageAction(page.id, "exclude")}
                        >
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePageAction(page.id, "delete")}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crawl History</CardTitle>
            <CardDescription>Recent crawl activity and results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No crawl history yet</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{log.crawl_id}</span>
                        <Badge variant={log.status === "completed" ? "default" : "secondary"}>
                          {log.status}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-slate-600">
                        <span>{log.pages_crawled} pages crawled</span>
                        <span>{log.pages_new} new</span>
                        <span>{log.pages_updated} updated</span>
                        {log.errors && log.errors.length > 0 && (
                          <span className="text-red-600">{log.errors.length} errors</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(log.started_at).toLocaleString()}
                        {log.completed_at && ` - ${new Date(log.completed_at).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}