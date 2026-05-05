import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Search,
  Play,
  Download,
  Eye,
  RefreshCw,
  Ban,
  Loader2,
  ExternalLink,
  FileCheck,
  Globe,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type WebsitePage = {
  id: string;
  url: string;
  title: string | null;
  status: string;
  word_count: number;
  content_hash: string | null;
  extracted_content: string | null;
  approved: boolean;
  excluded: boolean;
  error_message: string | null;
  last_crawled_at: string | null;
  created_at: string;
  updated_at: string;
};

type CrawlLog = {
  id: string;
  crawl_id: string;
  status: string;
  pages_found: number;
  pages_crawled: number;
  pages_new: number;
  pages_updated: number;
  errors: string[] | null;
  started_at: string;
  completed_at: string | null;
};

type KnowledgeChunk = {
  id: string;
  website_page_id: string;
  chunk_text: string;
  chunk_index: number;
  approved: boolean;
  embedding_status: string;
  created_at: string;
};

export default function KnowledgeCoveragePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [logs, setLogs] = useState<CrawlLog[]>([]);
  const [selectedPage, setSelectedPage] = useState<WebsitePage | null>(null);
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [testQuery, setTestQuery] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [crawling, setCrawling] = useState(false);

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
    try {
      setLoading(true);

      // Load pages
      const { data: pagesData } = await supabase
        .from("website_pages")
        .select("*")
        .order("created_at", { ascending: false });

      setPages(pagesData || []);

      // Load recent logs
      const { data: logsData } = await supabase
        .from("crawl_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      setLogs(logsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load knowledge coverage data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewPage = async (page: WebsitePage) => {
    setSelectedPage(page);
    
    // Load chunks for this page
    const { data: chunksData } = await supabase
      .from("knowledge_chunks")
      .select("*")
      .eq("website_page_id", page.id)
      .order("chunk_index", { ascending: true });

    setChunks(chunksData || []);
  };

  const handleToggleApproval = async (pageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("website_pages")
        .update({ approved: !currentStatus, updated_at: new Date().toISOString() })
        .eq("id", pageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: currentStatus ? "Page unapproved" : "Page approved",
      });

      loadData();
    } catch (error) {
      console.error("Error toggling approval:", error);
      toast({
        title: "Error",
        description: "Failed to update approval status",
        variant: "destructive",
      });
    }
  };

  const handleExclude = async (pageId: string) => {
    try {
      const { error } = await supabase
        .from("website_pages")
        .update({ 
          excluded: true, 
          status: 'excluded',
          updated_at: new Date().toISOString() 
        })
        .eq("id", pageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Page excluded from knowledge base",
      });

      loadData();
    } catch (error) {
      console.error("Error excluding page:", error);
      toast({
        title: "Error",
        description: "Failed to exclude page",
        variant: "destructive",
      });
    }
  };

  const handleReCrawl = async (url: string) => {
    try {
      setCrawling(true);
      const response = await fetch("/api/crawl/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startUrl: url,
          maxPages: 1,
          mode: "single",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to re-crawl page");
      }

      toast({
        title: "Success",
        description: "Page re-crawled successfully",
      });

      loadData();
    } catch (error: any) {
      console.error("Error re-crawling:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to re-crawl page",
        variant: "destructive",
      });
    } finally {
      setCrawling(false);
    }
  };

  const handleTestKnowledge = async () => {
    if (!testQuery.trim()) return;

    try {
      setTesting(true);
      const response = await fetch("/api/knowledge/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: testQuery }),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error("Error testing knowledge:", error);
      toast({
        title: "Error",
        description: "Failed to test knowledge",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleApproveAll = async () => {
    try {
      const { error } = await supabase
        .from("website_pages")
        .update({ approved: true, updated_at: new Date().toISOString() })
        .eq("status", "indexed")
        .eq("approved", false);

      if (error) throw error;

      toast({
        title: "Success",
        description: "All indexed pages approved",
      });

      loadData();
    } catch (error) {
      console.error("Error approving all:", error);
      toast({
        title: "Error",
        description: "Failed to approve all pages",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ["URL", "Title", "Status", "Word Count", "Approved", "Last Crawled"],
      ...pages.map(p => [
        p.url,
        p.title || "",
        p.status,
        p.word_count.toString(),
        p.approved ? "Yes" : "No",
        p.last_crawled_at || "",
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `knowledge-coverage-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Calculate stats
  const stats = {
    discovered: pages.length,
    crawled: pages.filter(p => p.status === "crawled" || p.status === "indexed" || p.status === "approved").length,
    indexed: pages.filter(p => p.status === "indexed" || p.status === "approved").length,
    approved: pages.filter(p => p.approved).length,
    excluded: pages.filter(p => p.excluded).length,
    errors: pages.filter(p => p.status === "error").length,
  };

  const lastCrawl = logs.find(l => l.status === "completed");

  // Filter pages
  const filteredPages = pages.filter(page => {
    const matchesSearch = searchQuery === "" || 
      page.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (page.title || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      statusFilter === "all" ||
      (statusFilter === "approved" && page.approved) ||
      (statusFilter === "not_approved" && !page.approved && page.status === "indexed") ||
      (statusFilter === "errors" && page.status === "error") ||
      (statusFilter === "excluded" && page.excluded);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Knowledge Coverage</h1>
            <p className="text-slate-600">Website crawl status and AI knowledge management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleApproveAll}>
              <FileCheck className="h-4 w-4 mr-2" />
              Approve All
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Discovered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{stats.discovered}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Crawled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cyan-500" />
                <span className="text-2xl font-bold">{stats.crawled}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Indexed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                <span className="text-2xl font-bold">{stats.indexed}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{stats.approved}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Excluded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-slate-500" />
                <span className="text-2xl font-bold">{stats.excluded}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold">{stats.errors}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Last Crawl Info */}
        {lastCrawl && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Clock className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">Last Crawl</p>
                    <p className="text-xs text-slate-600">
                      {new Date(lastCrawl.started_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-slate-600">Discovered:</span> <span className="font-semibold">{lastCrawl.pages_found || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Crawled:</span> <span className="font-semibold">{lastCrawl.pages_crawled || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Indexed:</span> <span className="font-semibold">{(lastCrawl.pages_new || 0) + (lastCrawl.pages_updated || 0)}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Failed:</span> <span className="font-semibold text-red-600">{lastCrawl.errors?.length || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="pages" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pages">Crawled Pages</TabsTrigger>
            <TabsTrigger value="test">Test AI Knowledge</TabsTrigger>
            <TabsTrigger value="logs">Crawl Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pages</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="not_approved">Not Approved</SelectItem>
                  <SelectItem value="errors">Errors</SelectItem>
                  <SelectItem value="excluded">Excluded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pages Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Page</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Words</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Last Crawled</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Approved</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredPages.map((page) => (
                        <tr key={page.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <p className="font-medium text-sm">{page.title || "Untitled"}</p>
                              <a
                                href={page.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                              >
                                {page.url}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {page.status === "approved" && (
                              <Badge className="bg-green-100 text-green-700">Approved</Badge>
                            )}
                            {page.status === "indexed" && (
                              <Badge className="bg-blue-100 text-blue-700">Indexed</Badge>
                            )}
                            {page.status === "crawled" && (
                              <Badge className="bg-yellow-100 text-yellow-700">Crawled</Badge>
                            )}
                            {page.status === "error" && (
                              <Badge className="bg-red-100 text-red-700">Error</Badge>
                            )}
                            {page.status === "excluded" && (
                              <Badge className="bg-slate-100 text-slate-700">Excluded</Badge>
                            )}
                            {page.status === "discovered" && (
                              <Badge className="bg-purple-100 text-purple-700">Discovered</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">{page.word_count.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {page.last_crawled_at
                              ? new Date(page.last_crawled_at).toLocaleDateString()
                              : "Never"}
                          </td>
                          <td className="px-4 py-3">
                            {page.approved ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-slate-300" />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewPage(page)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleApproval(page.id, page.approved)}
                              >
                                {page.approved ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReCrawl(page.url)}
                                disabled={crawling}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              {!page.excluded && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleExclude(page.id)}
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test AI Knowledge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question (e.g., 'Do we offer real estate automation?')"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleTestKnowledge()}
                  />
                  <Button onClick={handleTestKnowledge} disabled={testing}>
                    {testing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {testResult && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-2">AI Answer:</p>
                      <p className="text-sm bg-indigo-50 p-4 rounded-lg">{testResult.answer}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-2">Sources Used:</p>
                      <div className="space-y-2">
                        {testResult.sources?.map((source: any, i: number) => (
                          <div key={i} className="bg-slate-50 p-3 rounded-lg text-sm">
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              {source.title}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <p className="text-xs text-slate-600 mt-1">{source.excerpt}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Confidence:</span>{" "}
                        <span className="font-semibold">{testResult.confidence}%</span>
                      </div>
                      <div>
                        <span className="text-slate-600">From Website:</span>{" "}
                        <Badge variant={testResult.fromWebsite ? "default" : "secondary"}>
                          {testResult.fromWebsite ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Pages</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Started</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <Badge variant="outline">Website Crawl</Badge>
                          </td>
                          <td className="px-4 py-3">
                            {log.status === "completed" && (
                              <Badge className="bg-green-100 text-green-700">Completed</Badge>
                            )}
                            {log.status === "failed" && (
                              <Badge className="bg-red-100 text-red-700">Failed</Badge>
                            )}
                            {log.status === "in_progress" && (
                              <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-4">
                              <span>{log.pages_found || 0} discovered</span>
                              <span>{log.pages_crawled || 0} crawled</span>
                              <span>{(log.pages_new || 0) + (log.pages_updated || 0)} indexed</span>
                              {(log.errors?.length || 0) > 0 && (
                                <span className="text-red-600">{log.errors?.length || 0} failed</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {new Date(log.started_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {log.completed_at
                              ? `${Math.round((new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 1000)}s`
                              : "In progress"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Page Details Dialog */}
      {selectedPage && (
        <Dialog open={!!selectedPage} onOpenChange={() => setSelectedPage(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPage.title || "Untitled Page"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">URL:</p>
                  <a
                    href={selectedPage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    {selectedPage.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div>
                  <p className="text-slate-600">Status:</p>
                  <Badge>{selectedPage.status}</Badge>
                </div>
                <div>
                  <p className="text-slate-600">Word Count:</p>
                  <p className="font-medium">{selectedPage.word_count.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-600">Last Crawled:</p>
                  <p className="font-medium">
                    {selectedPage.last_crawled_at
                      ? new Date(selectedPage.last_crawled_at).toLocaleString()
                      : "Never"}
                  </p>
                </div>
              </div>

              {selectedPage.error_message && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{selectedPage.error_message}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Extracted Content:</p>
                <div className="bg-slate-50 p-4 rounded-lg text-sm max-h-96 overflow-y-auto">
                  <p className="whitespace-pre-wrap">{selectedPage.extracted_content || "No content extracted"}</p>
                </div>
              </div>

              {chunks.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Knowledge Chunks ({chunks.length}):</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {chunks.map((chunk) => (
                      <div key={chunk.id} className="bg-slate-50 p-3 rounded-lg text-sm">
                        <p className="whitespace-pre-wrap">{chunk.chunk_text}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Chunk {chunk.chunk_index + 1}
                          </Badge>
                          <Badge variant={chunk.approved ? "default" : "secondary"} className="text-xs">
                            {chunk.approved ? "Approved" : "Not Approved"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}