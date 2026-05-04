import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import { Plus, Trash2, Edit, BookOpen, CheckCircle } from "lucide-react";

export default function PlaybooksPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    intent_pattern: "",
    description: "",
    flow_steps: "[]",
    is_active: true,
  });

  useEffect(() => {
    checkAuth();
    loadPlaybooks();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }
  };

  const loadPlaybooks = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("playbooks")
        .select("*")
        .order("created_at", { ascending: false });
      setPlaybooks(data || []);
    } catch (error) {
      console.error("Error loading playbooks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      let parsedSteps;
      try {
        parsedSteps = JSON.parse(formData.flow_steps);
      } catch {
        alert("Invalid JSON in flow steps");
        return;
      }

      if (editingId) {
        await supabase
          .from("playbooks")
          .update({
            name: formData.name,
            intent_pattern: formData.intent_pattern,
            description: formData.description,
            flow_steps: parsedSteps,
            is_active: formData.is_active,
          })
          .eq("id", editingId);
      } else {
        await supabase.from("playbooks").insert({
          name: formData.name,
          intent_pattern: formData.intent_pattern,
          description: formData.description,
          flow_steps: parsedSteps,
          is_active: formData.is_active,
        });
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        intent_pattern: "",
        description: "",
        flow_steps: "[]",
        is_active: true,
      });
      loadPlaybooks();
    } catch (error) {
      console.error("Error saving playbook:", error);
    }
  };

  const handleEdit = (playbook: any) => {
    setEditingId(playbook.id);
    setFormData({
      name: playbook.name,
      intent_pattern: playbook.intent_pattern,
      description: playbook.description || "",
      flow_steps: JSON.stringify(playbook.flow_steps, null, 2),
      is_active: playbook.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this playbook?")) return;
    await supabase.from("playbooks").delete().eq("id", id);
    loadPlaybooks();
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await supabase
      .from("playbooks")
      .update({ is_active: !isActive })
      .eq("id", id);
    loadPlaybooks();
  };

  if (loading) {
    return (
      <AdminLayout>
        <SEO title="Playbooks - AI Assistant Admin" />
        <p>Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="Playbooks - AI Assistant Admin" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Playbooks</h1>
            <p className="text-slate-600 mt-1">
              Define conversation flows for specific intents
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Playbook
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit" : "Create"} Playbook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="e.g., Get a Quote Flow"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Intent Pattern</label>
                <Input
                  placeholder="e.g., pricing_inquiry, demo_request"
                  value={formData.intent_pattern}
                  onChange={(e) => setFormData({ ...formData, intent_pattern: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Brief description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Flow Steps (JSON Array)</label>
                <Textarea
                  placeholder='["Ask about budget", "Recommend service", "Capture contact"]'
                  value={formData.flow_steps}
                  onChange={(e) => setFormData({ ...formData, flow_steps: e.target.value })}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label className="text-sm">Active</label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit}>Save</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {playbooks.map((playbook) => (
            <Card key={playbook.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{playbook.name}</h3>
                      <Badge variant={playbook.is_active ? "default" : "secondary"}>
                        {playbook.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      Intent: <code className="bg-slate-100 px-1 py-0.5 rounded">{playbook.intent_pattern}</code>
                    </p>
                    {playbook.description && (
                      <p className="text-sm text-slate-600 mb-3">{playbook.description}</p>
                    )}
                    {playbook.flow_steps && Array.isArray(playbook.flow_steps) && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-700">Flow Steps:</p>
                        {playbook.flow_steps.map((step: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="text-xs font-medium text-slate-400">{i + 1}.</span>
                            {step}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggle(playbook.id, playbook.is_active)}
                    >
                      {playbook.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(playbook)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(playbook.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {playbooks.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No playbooks yet. Create your first playbook to guide conversations.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}