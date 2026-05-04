import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Plus, Trash2, BarChart3, TrendingUp } from "lucide-react";

export default function ABTestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    test_type: "welcome_message",
    variant_a: "",
    variant_b: "",
  });

  useEffect(() => {
    checkAuth();
    loadTests();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }
  };

  const loadTests = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("ab_tests")
        .select("*")
        .order("created_at", { ascending: false });
      setTests(data || []);
    } catch (error) {
      console.error("Error loading tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await supabase.from("ab_tests").insert({
        name: formData.name,
        test_type: formData.test_type,
        variant_a_config: { message: formData.variant_a },
        variant_b_config: { message: formData.variant_b },
        is_active: true,
      });

      setShowForm(false);
      setFormData({
        name: "",
        test_type: "welcome_message",
        variant_a: "",
        variant_b: "",
      });
      loadTests();
    } catch (error) {
      console.error("Error creating test:", error);
    }
  };

  const handleStop = async (id: string) => {
    await supabase
      .from("ab_tests")
      .update({ is_active: false })
      .eq("id", id);
    loadTests();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this test?")) return;
    await supabase.from("ab_tests").delete().eq("id", id);
    loadTests();
  };

  const calculateConversion = (test: any) => {
    const aRate = test.conversions_a && test.visitors_a ? (test.conversions_a / test.visitors_a * 100).toFixed(1) : "0.0";
    const bRate = test.conversions_b && test.visitors_b ? (test.conversions_b / test.visitors_b * 100).toFixed(1) : "0.0";
    return { aRate, bRate };
  };

  if (loading) {
    return (
      <AdminLayout>
        <SEO title="A/B Tests - AI Assistant Admin" />
        <p>Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="A/B Tests - AI Assistant Admin" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">A/B Tests</h1>
            <p className="text-slate-600 mt-1">
              Test different messages and triggers to optimize conversions
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Test
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create A/B Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Test Name</label>
                <Input
                  placeholder="e.g., Welcome Message Test"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Test Type</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={formData.test_type}
                  onChange={(e) => setFormData({ ...formData, test_type: e.target.value })}
                >
                  <option value="welcome_message">Welcome Message</option>
                  <option value="trigger_timing">Trigger Timing</option>
                  <option value="lead_capture">Lead Capture Form</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Variant A</label>
                <Textarea
                  placeholder="Enter variant A content..."
                  value={formData.variant_a}
                  onChange={(e) => setFormData({ ...formData, variant_a: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Variant B</label>
                <Textarea
                  placeholder="Enter variant B content..."
                  value={formData.variant_b}
                  onChange={(e) => setFormData({ ...formData, variant_b: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit}>Start Test</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {tests.map((test) => {
            const { aRate, bRate } = calculateConversion(test);
            const winner = parseFloat(aRate) > parseFloat(bRate) ? "A" : parseFloat(bRate) > parseFloat(aRate) ? "B" : "Tie";

            return (
              <Card key={test.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{test.name}</h3>
                        <Badge variant={test.is_active ? "default" : "secondary"}>
                          {test.is_active ? "Running" : "Stopped"}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">Type: {test.test_type}</p>
                    </div>
                    <div className="flex gap-2">
                      {test.is_active && (
                        <Button size="sm" variant="outline" onClick={() => handleStop(test.id)}>
                          Stop Test
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(test.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-900">Variant A</h4>
                        {winner === "A" && <TrendingUp className="h-5 w-5 text-green-600" />}
                      </div>
                      <p className="text-sm text-blue-800 mb-3">{(test.variant_a_config as any)?.message || "N/A"}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-700">Visitors: {test.visitors_a || 0}</span>
                        <span className="text-blue-700">Conversions: {test.conversions_a || 0}</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 mt-2">{aRate}%</p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-purple-900">Variant B</h4>
                        {winner === "B" && <TrendingUp className="h-5 w-5 text-green-600" />}
                      </div>
                      <p className="text-sm text-purple-800 mb-3">{(test.variant_b_config as any)?.message || "N/A"}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-700">Visitors: {test.visitors_b || 0}</span>
                        <span className="text-purple-700">Conversions: {test.conversions_b || 0}</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900 mt-2">{bRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {tests.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No A/B tests yet. Create a test to optimize your conversions.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}