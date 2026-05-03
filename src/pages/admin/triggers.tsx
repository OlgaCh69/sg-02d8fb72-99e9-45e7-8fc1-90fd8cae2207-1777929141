import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { Plus, Trash2, Save } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type TriggerSetting = Database["public"]["Tables"]["trigger_settings"]["Row"];
type PageRule = Database["public"]["Tables"]["page_rules"]["Row"];

export default function TriggersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [triggers, setTriggers] = useState<TriggerSetting[]>([]);
  const [pageRules, setPageRules] = useState<PageRule[]>([]);

  useEffect(() => {
    checkAuth();
    loadTriggers();
    loadPageRules();
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

  const loadTriggers = async () => {
    try {
      const { data } = await supabase
        .from("trigger_settings")
        .select("*")
        .order("created_at", { ascending: false });
      setTriggers(data || []);
    } catch (error) {
      console.error("Error loading triggers:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPageRules = async () => {
    try {
      const { data } = await supabase
        .from("page_rules")
        .select("*")
        .order("created_at", { ascending: false });
      setPageRules(data || []);
    } catch (error) {
      console.error("Error loading page rules:", error);
    }
  };

  const addTrigger = async () => {
    const { data } = await supabase
      .from("trigger_settings")
      .insert({
        trigger_type: "time_delay",
        trigger_value: 5,
        enabled: false,
      })
      .select()
      .single();

    if (data) {
      setTriggers([data, ...triggers]);
    }
  };

  const updateTrigger = async (id: string, updates: Partial<TriggerSetting>) => {
    await supabase
      .from("trigger_settings")
      .update(updates)
      .eq("id", id);

    setTriggers(triggers.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTrigger = async (id: string) => {
    await supabase.from("trigger_settings").delete().eq("id", id);
    setTriggers(triggers.filter(t => t.id !== id));
  };

  const addPageRule = async () => {
    const { data } = await supabase
      .from("page_rules")
      .insert({
        page_pattern: "/",
        enabled: false,
      })
      .select()
      .single();

    if (data) {
      setPageRules([data, ...pageRules]);
    }
  };

  const updatePageRule = async (id: string, updates: Partial<PageRule>) => {
    await supabase
      .from("page_rules")
      .update(updates)
      .eq("id", id);

    setPageRules(pageRules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deletePageRule = async (id: string) => {
    await supabase.from("page_rules").delete().eq("id", id);
    setPageRules(pageRules.filter(r => r.id !== id));
  };

  if (loading) {
    return (
      <AdminLayout>
        <SEO title="Triggers & Page Rules - AI Assistant Admin" />
        <p>Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="Triggers & Page Rules - AI Assistant Admin" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Triggers & Page Rules</h1>
          <p className="text-slate-600 mt-1">Configure proactive chat triggers and page-specific behavior</p>
        </div>

        <Tabs defaultValue="triggers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="triggers">Proactive Triggers</TabsTrigger>
            <TabsTrigger value="page-rules">Page Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="triggers" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">
                Automatically open the chat widget based on visitor behavior
              </p>
              <Button onClick={addTrigger} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Trigger
              </Button>
            </div>

            {triggers.map((trigger) => (
              <Card key={trigger.id}>
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={trigger.enabled}
                          onCheckedChange={(checked) => updateTrigger(trigger.id, { enabled: checked })}
                        />
                        <Label className="text-base font-medium">
                          {trigger.enabled ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTrigger(trigger.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Trigger Type</Label>
                        <Select
                          value={trigger.trigger_type}
                          onValueChange={(value) => updateTrigger(trigger.id, { trigger_type: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="time_delay">Time Delay</SelectItem>
                            <SelectItem value="scroll_percentage">Scroll Percentage</SelectItem>
                            <SelectItem value="exit_intent">Exit Intent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {trigger.trigger_type !== "exit_intent" && (
                        <div>
                          <Label>
                            {trigger.trigger_type === "time_delay" ? "Seconds" : "Scroll %"}
                          </Label>
                          <Input
                            type="number"
                            value={trigger.trigger_value || 0}
                            onChange={(e) => updateTrigger(trigger.id, { trigger_value: parseInt(e.target.value) })}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Page Match Pattern (optional)</Label>
                      <Input
                        placeholder="/pricing or /contact"
                        value={trigger.page_match_pattern || ""}
                        onChange={(e) => updateTrigger(trigger.id, { page_match_pattern: e.target.value || null })}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Leave empty to apply to all pages. Use path like "/pricing" to match specific pages.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {triggers.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-slate-500">
                  No triggers configured. Add one to get started.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="page-rules" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">
                Customize welcome messages and behavior for specific pages
              </p>
              <Button onClick={addPageRule} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Page Rule
              </Button>
            </div>

            {pageRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(checked) => updatePageRule(rule.id, { enabled: checked })}
                        />
                        <Label className="text-base font-medium">
                          {rule.enabled ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePageRule(rule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div>
                      <Label>Page Pattern</Label>
                      <Input
                        placeholder="/pricing or /about"
                        value={rule.page_pattern}
                        onChange={(e) => updatePageRule(rule.id, { page_pattern: e.target.value })}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        URL path to match (e.g., /pricing, /contact)
                      </p>
                    </div>

                    <div>
                      <Label>Custom Welcome Message</Label>
                      <Input
                        placeholder="Looking for pricing info? I can help!"
                        value={rule.custom_welcome_message || ""}
                        onChange={(e) => updatePageRule(rule.id, { custom_welcome_message: e.target.value || null })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {pageRules.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-slate-500">
                  No page rules configured. Add one to customize behavior per page.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}