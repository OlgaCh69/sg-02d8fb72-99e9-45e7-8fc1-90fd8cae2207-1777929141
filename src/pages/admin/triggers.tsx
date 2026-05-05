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
  Zap,
  Plus,
  Edit,
  Trash2,
  Clock,
  MousePointer,
  Eye,
  MessageSquare,
} from "lucide-react";

type TriggerType = "time_delay" | "scroll_depth" | "exit_intent" | "page_view";

type Trigger = {
  id: string;
  name: string;
  trigger_type: TriggerType;
  trigger_value: number;
  message: string;
  is_active: boolean;
  created_at: string;
};

export default function TriggersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    trigger_type: "time_delay" as TriggerType,
    trigger_value: 10,
    message: "",
    is_active: true,
  });

  useEffect(() => {
    checkAuth();
    loadTriggers();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
    }
  };

  const loadTriggers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("proactive_triggers")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setTriggers(data as any[]);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from("proactive_triggers")
        .update(formData)
        .eq("id", editingId);
      
      toast({
        title: "Success",
        description: "Trigger updated successfully",
      });
    } else {
      await supabase
        .from("proactive_triggers")
        .insert(formData);
      
      toast({
        title: "Success",
        description: "Trigger created successfully",
      });
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      trigger_type: "time_delay",
      trigger_value: 10,
      message: "",
      is_active: true,
    });
    loadTriggers();
  };

  const handleEdit = (trigger: Trigger) => {
    setFormData({
      name: trigger.name,
      trigger_type: trigger.trigger_type,
      trigger_value: trigger.trigger_value,
      message: trigger.message,
      is_active: trigger.is_active,
    });
    setEditingId(trigger.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trigger?")) return;

    await supabase.from("proactive_triggers").delete().eq("id", id);
    toast({
      title: "Success",
      description: "Trigger deleted successfully",
    });
    loadTriggers();
  };

  const handleToggle = async (id: string, is_active: boolean) => {
    await supabase
      .from("proactive_triggers")
      .update({ is_active: !is_active })
      .eq("id", id);
    loadTriggers();
  };

  const getTriggerIcon = (type: TriggerType) => {
    switch (type) {
      case "time_delay":
        return <Clock className="h-4 w-4" />;
      case "scroll_depth":
        return <MousePointer className="h-4 w-4" />;
      case "exit_intent":
        return <Eye className="h-4 w-4" />;
      case "page_view":
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTriggerLabel = (type: TriggerType, value: number) => {
    switch (type) {
      case "time_delay":
        return `After ${value} seconds`;
      case "scroll_depth":
        return `At ${value}% scroll`;
      case "exit_intent":
        return "On exit intent";
      case "page_view":
        return `After ${value} page views`;
    }
  };

  return (
    <AdminLayout>
      <SEO title="Proactive Triggers - O.N.E.Tech AI Assistant Admin" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Proactive Triggers</h1>
            <p className="text-slate-600">Automatically engage visitors at the right moment</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                name: "",
                trigger_type: "time_delay",
                trigger_value: 10,
                message: "",
                is_active: true,
              });
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Trigger
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit Trigger" : "Create New Trigger"}</CardTitle>
              <CardDescription>
                Set up automated chat triggers based on visitor behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Trigger Name</Label>
                  <Input
                    placeholder="e.g., Welcome Message"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trigger Type</Label>
                  <select
                    value={formData.trigger_type}
                    onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value as TriggerType })}
                    className="w-full h-10 px-3 rounded-md border border-slate-200"
                  >
                    <option value="time_delay">Time Delay</option>
                    <option value="scroll_depth">Scroll Depth</option>
                    <option value="exit_intent">Exit Intent</option>
                    <option value="page_view">Page Views</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>
                    {formData.trigger_type === "time_delay" && "Delay (seconds)"}
                    {formData.trigger_type === "scroll_depth" && "Scroll Depth (%)"}
                    {formData.trigger_type === "exit_intent" && "Sensitivity (0-100)"}
                    {formData.trigger_type === "page_view" && "Number of Pages"}
                  </Label>
                  <Input
                    type="number"
                    value={formData.trigger_value}
                    onChange={(e) => setFormData({ ...formData, trigger_value: parseInt(e.target.value) })}
                    required
                    min="0"
                    max={formData.trigger_type === "scroll_depth" ? 100 : undefined}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trigger Message</Label>
                  <Textarea
                    placeholder="Enter the message to show when this trigger fires..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    required
                  />
                  <p className="text-sm text-slate-500">
                    This message will appear in the chat when the trigger condition is met
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                    {editingId ? "Update Trigger" : "Create Trigger"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Active Triggers</CardTitle>
            <CardDescription>Manage your proactive engagement triggers</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-slate-500">Loading triggers...</p>
            ) : triggers.length === 0 ? (
              <p className="text-center py-8 text-slate-500">
                No triggers created yet. Click "New Trigger" to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {triggers.map((trigger) => (
                  <div
                    key={trigger.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        {getTriggerIcon(trigger.trigger_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{trigger.name}</h3>
                          <Badge variant={trigger.is_active ? "default" : "secondary"}>
                            {trigger.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          {getTriggerLabel(trigger.trigger_type, trigger.trigger_value)}
                        </p>
                        <p className="text-sm text-slate-500 line-clamp-1">
                          {trigger.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={trigger.is_active}
                        onCheckedChange={() => handleToggle(trigger.id, trigger.is_active)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(trigger)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(trigger.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}