import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SEO } from "@/components/SEO";
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  TrendingUp,
  MessageCircle,
  Download,
  Trash2,
  Eye,
  Shield,
  Brain,
  History,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type VisitorProfile = Database["public"]["Tables"]["visitor_profiles"]["Row"];
type ConversationSummary = Database["public"]["Tables"]["conversation_summaries"]["Row"];
type VisitorMemory = Database["public"]["Tables"]["visitor_memory"]["Row"];
type LeadScoreHistory = Database["public"]["Tables"]["lead_score_history"]["Row"];

export default function VisitorProfilesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<VisitorProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<VisitorProfile | null>(null);
  const [summaries, setSummaries] = useState<ConversationSummary[]>([]);
  const [memory, setMemory] = useState<VisitorMemory[]>([]);
  const [scoreHistory, setScoreHistory] = useState<LeadScoreHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAuth();
    loadProfiles();
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

  const loadProfiles = async () => {
    try {
      const { data } = await supabase
        .from("visitor_profiles")
        .select("*")
        .order("last_seen_at", { ascending: false });

      setProfiles(data || []);
    } catch (error) {
      console.error("Error loading profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfileDetails = async (profileId: string) => {
    const [summariesRes, memoryRes, scoreRes] = await Promise.all([
      supabase
        .from("conversation_summaries")
        .select("*")
        .eq("visitor_profile_id", profileId)
        .order("created_at", { ascending: false }),
      supabase
        .from("visitor_memory")
        .select("*")
        .eq("visitor_profile_id", profileId)
        .eq("is_active", true)
        .order("updated_at", { ascending: false }),
      supabase
        .from("lead_score_history")
        .select("*")
        .eq("visitor_profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    setSummaries(summariesRes.data || []);
    setMemory(memoryRes.data || []);
    setScoreHistory(scoreRes.data || []);
  };

  const handleSelectProfile = async (profile: VisitorProfile) => {
    setSelectedProfile(profile);
    await loadProfileDetails(profile.id);
  };

  const handleExportData = async (profile: VisitorProfile) => {
    try {
      const response = await fetch("/api/gdpr/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: profile.visitor_id }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `visitor-data-${profile.id}.json`;
      a.click();
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data");
    }
  };

  const handleDeleteProfile = async (profile: VisitorProfile) => {
    if (!confirm(`Are you sure you want to delete all data for ${profile.name || profile.email || profile.visitor_id}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch("/api/gdpr/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          visitorId: profile.visitor_id,
          adminConfirmed: true,
        }),
      });

      if (response.ok) {
        alert("Profile deleted successfully");
        setSelectedProfile(null);
        loadProfiles();
      } else {
        alert("Failed to delete profile");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete profile");
    }
  };

  const filteredProfiles = profiles.filter((profile) =>
    (profile.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (profile.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (profile.phone?.includes(searchQuery)) ||
    (profile.visitor_id?.includes(searchQuery))
  );

  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case "HOT": return "bg-red-100 text-red-800";
      case "WARM": return "bg-yellow-100 text-yellow-800";
      case "COLD": return "bg-blue-100 text-blue-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <SEO title="Visitor Profiles - AI Assistant Admin" />
        <p>Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="Visitor Profiles - AI Assistant Admin" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visitor Profiles</h1>
          <p className="text-slate-600 mt-1">
            View and manage visitor memory, consent, and GDPR data
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profiles List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>All Visitors ({profiles.length})</CardTitle>
              <Input
                placeholder="Search by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {filteredProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleSelectProfile(profile)}
                    className={`w-full text-left p-4 border-b hover:bg-slate-50 transition-colors ${
                      selectedProfile?.id === profile.id ? "bg-indigo-50" : ""
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {profile.name || profile.email || "Anonymous"}
                        </p>
                        <Badge className={getLeadStatusColor(profile.lead_status || "UNKNOWN")}>
                          {profile.lead_status || "UNKNOWN"}
                        </Badge>
                      </div>
                      {profile.email && (
                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {profile.email}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Score: {profile.lead_score || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(profile.last_seen_at || new Date()).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        {profile.consent_memory && (
                          <Badge variant="outline" className="text-green-600">Memory ✓</Badge>
                        )}
                        {profile.consent_analytics && (
                          <Badge variant="outline" className="text-blue-600">Analytics ✓</Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            {selectedProfile ? (
              <Tabs defaultValue="overview">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="memory">Memory</TabsTrigger>
                  <TabsTrigger value="summaries">Summaries</TabsTrigger>
                  <TabsTrigger value="score">Score History</TabsTrigger>
                  <TabsTrigger value="gdpr">GDPR</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {selectedProfile.name || "Anonymous Visitor"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          {selectedProfile.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-slate-400" />
                              <span>{selectedProfile.email}</span>
                            </div>
                          )}
                          {selectedProfile.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-slate-400" />
                              <span>{selectedProfile.phone}</span>
                            </div>
                          )}
                          {selectedProfile.company && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="h-4 w-4 text-slate-400" />
                              <span>{selectedProfile.company}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium">Lead Score</span>
                            <Badge className="text-lg">{selectedProfile.lead_score || 0}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium">Lead Status</span>
                            <Badge className={getLeadStatusColor(selectedProfile.lead_status || "UNKNOWN")}>
                              {selectedProfile.lead_status || "UNKNOWN"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">Consent:</span>
                          <span>
                            Memory: {selectedProfile.consent_memory ? "✓ Yes" : "✗ No"}
                            {" · "}
                            Analytics: {selectedProfile.consent_analytics ? "✓ Yes" : "✗ No"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="h-4 w-4" />
                          First seen: {new Date(selectedProfile.first_seen_at || new Date()).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="h-4 w-4" />
                          Last seen: {new Date(selectedProfile.last_seen_at || new Date()).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="memory">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Visitor Memory ({memory.length})
                      </CardTitle>
                      <CardDescription>
                        Long-term preferences and qualifications stored by the AI
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {memory.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Key</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Confidence</TableHead>
                              <TableHead>Updated</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {memory.map((mem) => (
                              <TableRow key={mem.id}>
                                <TableCell>
                                  <Badge variant="outline">{mem.memory_type}</Badge>
                                </TableCell>
                                <TableCell className="font-medium">{mem.key}</TableCell>
                                <TableCell>{mem.value}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {Math.round((mem.confidence || 0) * 100)}%
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">
                                  {new Date(mem.updated_at || new Date()).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-center py-8 text-slate-500">
                          No memory stored yet
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="summaries">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Conversation Summaries ({summaries.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {summaries.length > 0 ? (
                        summaries.map((summary) => (
                          <div key={summary.id} className="p-4 border rounded-lg space-y-2">
                            <p className="text-sm">{summary.summary}</p>
                            <div className="flex flex-wrap gap-2">
                              {summary.intent && (
                                <Badge variant="outline">Intent: {summary.intent}</Badge>
                              )}
                              {summary.service_interest && (
                                <Badge variant="outline">Service: {summary.service_interest}</Badge>
                              )}
                              {summary.budget && (
                                <Badge variant="outline">Budget: {summary.budget}</Badge>
                              )}
                              {summary.timeline && (
                                <Badge variant="outline">Timeline: {summary.timeline}</Badge>
                              )}
                              {summary.urgency && (
                                <Badge variant="outline">Urgency: {summary.urgency}</Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              {new Date(summary.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-8 text-slate-500">
                          No conversation summaries yet
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="score">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Lead Score History ({scoreHistory.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {scoreHistory.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Score Change</TableHead>
                              <TableHead>Status Change</TableHead>
                              <TableHead>Reason</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {scoreHistory.map((history) => (
                              <TableRow key={history.id}>
                                <TableCell className="text-sm">
                                  {new Date(history.created_at).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <span className={history.new_score > (history.old_score || 0) ? "text-green-600" : "text-red-600"}>
                                    {history.old_score || 0} → {history.new_score}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Badge className={getLeadStatusColor(history.old_status || "UNKNOWN")}>
                                      {history.old_status || "UNKNOWN"}
                                    </Badge>
                                    →
                                    <Badge className={getLeadStatusColor(history.new_status || "UNKNOWN")}>
                                      {history.new_status || "UNKNOWN"}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">
                                  {history.reason}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-center py-8 text-slate-500">
                          No score history yet
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="gdpr">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        GDPR Data Management
                      </CardTitle>
                      <CardDescription>
                        Export or delete all visitor data in compliance with GDPR
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Data Export</h4>
                        <p className="text-sm text-slate-600 mb-3">
                          Download all data associated with this visitor in JSON format
                        </p>
                        <Button
                          onClick={() => handleExportData(selectedProfile)}
                          variant="outline"
                          className="w-full"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Visitor Data
                        </Button>
                      </div>

                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Data Deletion</h4>
                        <p className="text-sm text-slate-600 mb-3">
                          Permanently delete all data for this visitor. This action cannot be undone.
                        </p>
                        <Button
                          onClick={() => handleDeleteProfile(selectedProfile)}
                          variant="destructive"
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete All Visitor Data
                        </Button>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Included Data</h4>
                        <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                          <li>Visitor profile and contact details</li>
                          <li>All conversation messages</li>
                          <li>Conversation summaries</li>
                          <li>Visitor memory and preferences</li>
                          <li>Analytics events</li>
                          <li>Lead information</li>
                          <li>Session history</li>
                          <li>Lead score history</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-slate-500">
                  <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a visitor profile to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}