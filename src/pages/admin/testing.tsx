import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Play, Trash2, TestTube, Loader2 } from "lucide-react";

export default function TestingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }
  };

  const runDemoConversation = async (scenario: string) => {
    try {
      setLoading(true);
      setTestResult(null);
      
      const response = await fetch("/api/test/demo-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      });

      const data = await response.json();
      if (data.success) {
        setTestResult(data);
        alert(`Demo ${scenario} conversation created! Check the Conversations page.`);
      }
    } catch (error) {
      console.error("Demo conversation error:", error);
      alert("Failed to create demo conversation");
    } finally {
      setLoading(false);
    }
  };

  const cleanupDemoData = async () => {
    if (!confirm("Delete all demo conversations and profiles?")) return;

    try {
      setLoading(true);
      const response = await fetch("/api/test/cleanup-demo", {
        method: "POST",
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setTestResult(null);
      }
    } catch (error) {
      console.error("Cleanup error:", error);
      alert("Failed to cleanup demo data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <SEO title="Testing Tools - AI Assistant Admin" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testing & Demo Tools</h1>
          <p className="text-slate-600 mt-1">
            Simulate conversations and test AI responses
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Demo Conversation Simulator</CardTitle>
            <CardDescription>Create test conversations to preview AI behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer" onClick={() => runDemoConversation("pricing_inquiry")}>
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <TestTube className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Pricing Inquiry</h3>
                  <p className="text-sm text-slate-600 mb-3">User asks about pricing and services</p>
                  <Button size="sm" disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                    Run Test
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer" onClick={() => runDemoConversation("support_request")}>
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                    <TestTube className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Support Request</h3>
                  <p className="text-sm text-slate-600 mb-3">User needs help with an issue</p>
                  <Button size="sm" disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                    Run Test
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer" onClick={() => runDemoConversation("general_inquiry")}>
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <TestTube className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">General Inquiry</h3>
                  <p className="text-sm text-slate-600 mb-3">User asks about services</p>
                  <Button size="sm" disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                    Run Test
                  </Button>
                </CardContent>
              </Card>
            </div>

            {testResult && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-600">Success</Badge>
                  <span className="text-sm font-medium">Demo conversation created</span>
                </div>
                <p className="text-sm text-slate-600">
                  Conversation ID: <code className="bg-white px-2 py-1 rounded">{testResult.conversationId}</code>
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Check the Conversations page to view the demo chat.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Cleanup</CardTitle>
            <CardDescription>Remove demo and test data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={cleanupDemoData} variant="outline" disabled={loading} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Demo Data
            </Button>
            <p className="text-sm text-slate-500 mt-2">
              This will permanently delete all demo conversations, messages, and visitor profiles.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testing Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>✅ Test each scenario after making changes to the knowledge base</li>
              <li>✅ Review AI responses for accuracy and tone</li>
              <li>✅ Verify lead scoring and intent detection</li>
              <li>✅ Check that playbooks trigger correctly</li>
              <li>✅ Clean up demo data regularly to avoid confusion</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}