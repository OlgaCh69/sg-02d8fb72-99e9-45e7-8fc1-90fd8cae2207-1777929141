import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SEO } from "@/components/SEO";
import { BarChart3, Download, Mail, Loader2 } from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    checkAuth();
    loadReports();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("weekly_reports")
        .select("*")
        .order("report_week_start", { ascending: false })
        .limit(10);
      setReports(data || []);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      const response = await fetch("/api/reports/generate-weekly", {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        alert("Weekly report generated successfully!");
        loadReports();
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <SEO title="Reports - AI Assistant Admin" />
        <p>Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="Reports - AI Assistant Admin" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weekly Reports</h1>
            <p className="text-slate-600 mt-1">
              Automated weekly performance summaries
            </p>
          </div>
          <Button onClick={handleGenerateReport} disabled={generating}>
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            Generate Report
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report History</CardTitle>
            <CardDescription>Past weekly performance reports</CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead>Visitors</TableHead>
                    <TableHead>Chats</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>HOT Leads</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>CRM Fails</TableHead>
                    <TableHead>Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {new Date(report.report_week_start).toLocaleDateString()} - {new Date(report.report_week_end).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{report.total_visitors}</TableCell>
                      <TableCell>{report.total_chats}</TableCell>
                      <TableCell>{report.total_leads}</TableCell>
                      <TableCell className="font-semibold text-orange-600">{report.hot_leads}</TableCell>
                      <TableCell>{report.total_bookings}</TableCell>
                      <TableCell className={report.failed_crm_syncs > 0 ? "text-red-600" : ""}>
                        {report.failed_crm_syncs}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {report.sent_at ? new Date(report.sent_at).toLocaleDateString() : "Not sent"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No reports yet. Generate your first weekly report above.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Settings</CardTitle>
            <CardDescription>Configure automated weekly email reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Email report automation configuration coming soon. For now, use the "Generate Report" button to create reports manually.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}