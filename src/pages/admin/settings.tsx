import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SEO } from "@/components/SEO";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [widgetSettings, setWidgetSettings] = useState({
    welcome_message: "",
    primary_color: "#4F46E5",
    is_enabled: true,
    position: "bottom-right",
  });
  const [crmSettings, setCrmSettings] = useState({
    webhook_url: "",
    api_key: "",
    provider: "custom",
    is_active: false,
  });

  useEffect(() => {
    checkAuth();
    loadSettings();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
    }
  };

  const loadSettings = async () => {
    setLoading(true);

    const { data: widget } = await supabase
      .from("widget_settings")
      .select("*")
      .single();

    const { data: crm } = await supabase
      .from("crm_settings")
      .select("*")
      .limit(1)
      .single();

    if (widget) {
      setWidgetSettings({
        welcome_message: widget.welcome_message || "",
        primary_color: widget.primary_color || "#4F46E5",
        is_enabled: widget.is_enabled ?? true,
        position: widget.position || "bottom-right",
      });
    }

    if (crm) {
      setCrmSettings({
        webhook_url: crm.webhook_url || "",
        api_key: crm.api_key || "",
        provider: crm.provider || "custom",
        is_active: crm.is_active ?? false,
      });
    }

    setLoading(false);
  };

  const saveWidgetSettings = async () => {
    setSaving(true);
    
    const { data: existing } = await supabase
      .from("widget_settings")
      .select("id")
      .single();

    if (existing) {
      await supabase
        .from("widget_settings")
        .update(widgetSettings)
        .eq("id", existing.id);
    } else {
      await supabase
        .from("widget_settings")
        .insert(widgetSettings);
    }

    setSaving(false);
    alert("Widget settings saved!");
  };

  const saveCrmSettings = async () => {
    setSaving(true);

    const { data: existing } = await supabase
      .from("crm_settings")
      .select("id")
      .limit(1)
      .single();

    if (existing) {
      await supabase
        .from("crm_settings")
        .update(crmSettings)
        .eq("id", existing.id);
    } else {
      await supabase
        .from("crm_settings")
        .insert(crmSettings);
    }

    setSaving(false);
    alert("CRM settings saved!");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Loading settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="Settings - AI Assistant Admin" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-slate-600">Configure your AI assistant and integrations</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Widget Settings</CardTitle>
            <CardDescription>Customize the appearance and behavior of your chat widget</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Welcome Message</Label>
              <Textarea
                placeholder="Hi! How can I help you today?"
                value={widgetSettings.welcome_message}
                onChange={(e) => setWidgetSettings({ ...widgetSettings, welcome_message: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={widgetSettings.primary_color}
                  onChange={(e) => setWidgetSettings({ ...widgetSettings, primary_color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={widgetSettings.primary_color}
                  onChange={(e) => setWidgetSettings({ ...widgetSettings, primary_color: e.target.value })}
                  placeholder="#4F46E5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Position</Label>
              <select
                value={widgetSettings.position}
                onChange={(e) => setWidgetSettings({ ...widgetSettings, position: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-slate-200"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={widgetSettings.is_enabled}
                onCheckedChange={(checked) => setWidgetSettings({ ...widgetSettings, is_enabled: checked })}
              />
              <Label>Enable Widget</Label>
            </div>

            <Button onClick={saveWidgetSettings} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Widget Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CRM Integration</CardTitle>
            <CardDescription>Connect your CRM to automatically sync captured leads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>CRM Provider</Label>
              <select
                value={crmSettings.provider}
                onChange={(e) => setCrmSettings({ ...crmSettings, provider: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-slate-200"
              >
                <option value="custom">Custom Webhook</option>
                <option value="hubspot">HubSpot</option>
                <option value="salesforce">Salesforce</option>
                <option value="pipedrive">Pipedrive</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input
                type="url"
                placeholder="https://api.your-crm.com/webhook"
                value={crmSettings.webhook_url}
                onChange={(e) => setCrmSettings({ ...crmSettings, webhook_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>API Key (Optional)</Label>
              <Input
                type="password"
                placeholder="Your CRM API key"
                value={crmSettings.api_key}
                onChange={(e) => setCrmSettings({ ...crmSettings, api_key: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={crmSettings.is_active}
                onCheckedChange={(checked) => setCrmSettings({ ...crmSettings, is_active: checked })}
              />
              <Label>Enable CRM Integration</Label>
            </div>

            <Button onClick={saveCrmSettings} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save CRM Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Embed Code</CardTitle>
            <CardDescription>Add this script to your website to display the chat widget</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
              <code>
                {`<script src="${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/widget.js"></script>`}
              </code>
            </div>
            <p className="text-sm text-slate-600 mt-4">
              Add this code just before the closing &lt;/body&gt; tag on your website.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}