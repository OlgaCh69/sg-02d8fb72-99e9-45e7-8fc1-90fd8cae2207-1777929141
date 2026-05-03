import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, CheckCircle, XCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadLeads();
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

  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("captured_at", { ascending: false });

      if (error) throw error;
      setLeads(data);
    } catch (error) {
      console.error("Error loading leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Company", "Channel", "Inquiry Type", "Lead Score", "Status", "Budget", "Timeline", "Service Interest", "Urgency", "CRM Synced", "Captured At"];
    const csvData = leads.map(lead => {
      const metadata = lead.metadata as any;
      const leadStatus = lead.lead_score >= 75 ? "HOT" : lead.lead_score >= 50 ? "WARM" : "COLD";
      return [
        lead.name || "",
        lead.email,
        lead.phone || "",
        lead.company || "",
        metadata?.channel || "website",
        lead.inquiry_type || "",
        lead.lead_score,
        leadStatus,
        lead.budget_range || "",
        lead.timeline || "",
        lead.service_interest || "",
        lead.urgency || "",
        lead.crm_synced ? "Yes" : "No",
        new Date(lead.captured_at).toLocaleString()
      ];
    });

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredLeads = leads.filter((lead) =>
    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLeadStatusBadge = (score: number) => {
    if (score >= 75) return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">HOT</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">WARM</Badge>;
    return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">COLD</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <p>Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
            <p className="text-slate-600 mt-1">Manage captured leads from chat conversations</p>
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
              placeholder="Search by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Leads ({filteredLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>CRM</TableHead>
                  <TableHead>Captured</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => {
                  const metadata = lead.metadata as any;
                  return (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name || "-"}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone || "-"}</TableCell>
                      <TableCell>{lead.company || "-"}</TableCell>
                      <TableCell className="capitalize">{metadata?.channel || "website"}</TableCell>
                      <TableCell>{getLeadStatusBadge(lead.lead_score)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{lead.lead_score}/100</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {lead.service_interest && <div>Service: {lead.service_interest}</div>}
                        {lead.budget_range && <div>Budget: {lead.budget_range}</div>}
                        {lead.timeline && <div>Timeline: {lead.timeline}</div>}
                        {lead.urgency && <div>Urgency: {lead.urgency}</div>}
                      </TableCell>
                      <TableCell>
                        {lead.crm_synced ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-slate-300" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {new Date(lead.captured_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredLeads.length === 0 && (
              <div className="py-12 text-center text-slate-500">
                No leads found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}