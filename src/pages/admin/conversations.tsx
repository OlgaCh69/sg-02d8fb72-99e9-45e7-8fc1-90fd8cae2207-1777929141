import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, FileText, Globe, BookOpen, Download } from "lucide-react";
import { SEO } from "@/components/SEO";
import type { Database } from "@/integrations/supabase/types";

type Conversation = Database["public"]["Tables"]["conversations"]["Row"] & {
  messages: Database["public"]["Tables"]["messages"]["Row"][];
};

export default function ConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadConversations();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("admin_role")
      .eq("id", session.user.id)
      .single();

    if (profile?.admin_role !== "admin") {
      router.push("/admin/login");
    }
  };

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*, messages(*)")
        .order("started_at", { ascending: false });

      if (error) throw error;

      setConversations(data as Conversation[]);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Visitor ID", "Channel", "Page URL", "Status", "Device", "Browser", "Started At", "Ended At", "Message Count", "Handover Requested", "Trigger Type"];
    const csvData = conversations.map(conv => [
      conv.visitor_id,
      conv.channel || "website",
      conv.page_url || "",
      conv.status,
      conv.device || "",
      conv.browser || "",
      new Date(conv.started_at).toLocaleString(),
      conv.ended_at ? new Date(conv.ended_at).toLocaleString() : "",
      conv.messages.length,
      conv.handover_requested ? "Yes" : "No",
      conv.trigger_type || "manual",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.visitor_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.page_url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "ended": return "bg-blue-100 text-blue-800";
      case "abandoned": return "bg-yellow-100 text-yellow-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getSourceIcon = (sourceType: string | null) => {
    switch (sourceType) {
      case "knowledge_base": return BookOpen;
      case "website_page": return Globe;
      case "document": return FileText;
      default: return null;
    }
  };

  const getSourceColor = (sourceType: string | null) => {
    switch (sourceType) {
      case "knowledge_base": return "text-indigo-600";
      case "website_page": return "text-cyan-600";
      case "document": return "text-green-600";
      default: return "text-slate-400";
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <SEO title="Conversations - AI Assistant Admin" />
        <p>Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="Conversations - AI Assistant Admin" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
            <p className="text-slate-600 mt-1">View and manage all chat conversations</p>
          </div>
          <Button onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by visitor ID or page URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredConversations.map((conversation) => (
            <Card key={conversation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      Visitor: {conversation.visitor_id.slice(0, 12)}...
                      <Badge className={getStatusColor(conversation.status)}>{conversation.status}</Badge>
                      {conversation.handover_requested && (
                        <Badge className="bg-orange-100 text-orange-800">Handover Requested</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      {conversation.page_url && (
                        <>
                          <ExternalLink className="h-3 w-3" />
                          {conversation.page_url}
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <div className="text-sm text-slate-500">
                    {new Date(conversation.started_at).toLocaleString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-slate-600">
                    {conversation.messages.length} messages
                  </div>
                  
                  {/* Message transcript with source tracking */}
                  <div className="space-y-2 bg-slate-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    {conversation.messages.map((msg, idx) => (
                      <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-slate-900' : 'text-slate-700'}`}>
                        <div className="flex items-start gap-2">
                          <span className="font-semibold min-w-[60px]">
                            {msg.role === 'user' ? 'Visitor:' : 'AI:'}
                          </span>
                          <div className="flex-1">
                            <p>{msg.content}</p>
                            {/* Show source for AI responses */}
                            {msg.role === 'assistant' && msg.source_type && msg.source_url && (
                              <div className="flex items-center gap-1 mt-1 text-xs">
                                {(() => {
                                  const Icon = getSourceIcon(msg.source_type);
                                  return Icon ? <Icon className={`h-3 w-3 ${getSourceColor(msg.source_type)}`} /> : null;
                                })()}
                                <span className={`${getSourceColor(msg.source_type)} font-medium`}>
                                  Source: {msg.source_url}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {conversation.device && (
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>Device: {conversation.device}</span>
                      {conversation.browser && <span>Browser: {conversation.browser}</span>}
                      {conversation.country && <span>Country: {conversation.country}</span>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredConversations.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                No conversations found
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}