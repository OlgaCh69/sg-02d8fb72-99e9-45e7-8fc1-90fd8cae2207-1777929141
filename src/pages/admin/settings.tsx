import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SEO } from "@/components/SEO";
import { Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    id: "1",
    is_enabled: true,
    welcome_message: "",
    primary_color: "#4F46E5",
    dark_mode_primary_color: "#6366F1",
    support_dark_mode: true,
    allow_file_uploads: true,
  });
  const [crmSettings, setCrmSettings] = useState({
    provider: "",
    webhook_url: "",
    api_key: "",
  });

  useEffect(() => {
    checkAuth();
    loadSettings();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data: widgetData } = await supabase
        .from("widget_settings")
        .select("*")
        .single();

      if (widgetData) {
        setSettings({
          id: widgetData.id,
          is_enabled: widgetData.is_enabled ?? true,
          welcome_message: widgetData.welcome_message || "",
          primary_color: widgetData.primary_color || "#4F46E5",
          dark_mode_primary_color: widgetData.dark_mode_primary_color || "#6366F1",
          support_dark_mode: widgetData.support_dark_mode ?? true,
          allow_file_uploads: widgetData.allow_file_uploads ?? true,
        });
      }

      const { data: crmData } = await supabase
        .from("crm_settings")
        .select("*")
        .single();

      if (crmData) {
        setCrmSettings({
          provider: crmData.provider || "",
          webhook_url: crmData.webhook_url || "",
          api_key: crmData.api_key || "",
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWidget = async () => {
    try {
      setSaving(true);
      await supabase
        .from("widget_settings")
        .update({
          is_enabled: settings.is_enabled,
          welcome_message: settings.welcome_message,
          primary_color: settings.primary_color,
          dark_mode_primary_color: settings.dark_mode_primary_color,
          support_dark_mode: settings.support_dark_mode,
          allow_file_uploads: settings.allow_file_uploads,
        })
        .eq("id", settings.id);

      alert("Widget settings saved successfully!");
    } catch (error) {
      console.error("Error saving widget settings:", error);
      alert("Failed to save widget settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCRM = async () => {
    try {
      setSaving(true);
      await supabase
        .from("crm_settings")
        .upsert({
          provider: crmSettings.provider,
          webhook_url: crmSettings.webhook_url,
          api_key: crmSettings.api_key,
        });

      alert("CRM settings saved successfully!");
    } catch (error) {
      console.error("Error saving CRM settings:", error);
      alert("Failed to save CRM settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <SEO title="Settings - AI Assistant Admin" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="Settings - AI Assistant Admin" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Configure your AI assistant widget and integrations
          </p>
        </div>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Widget Settings</CardTitle>
            <CardDescription className="dark:text-slate-400">Customize your chat widget appearance and behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="dark:text-white">Enable Widget</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Show the chat widget on your website</p>
              </div>
              <Switch
                checked={settings.is_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, is_enabled: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="welcome" className="dark:text-white">Welcome Message</Label>
              <Input
                id="welcome"
                placeholder="Hi! How can I help you today?"
                value={settings.welcome_message}
                onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="primaryColor" className="dark:text-white">Light Mode Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="w-20 h-10 cursor-pointer dark:bg-slate-900 dark:border-slate-700"
                  />
                  <Input
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="flex-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                    placeholder="#4F46E5"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Used for buttons and active states in light mode</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="darkPrimaryColor" className="dark:text-white">Dark Mode Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="darkPrimaryColor"
                    type="color"
                    value={settings.dark_mode_primary_color}
                    onChange={(e) => setSettings({ ...settings, dark_mode_primary_color: e.target.value })}
                    className="w-20 h-10 cursor-pointer dark:bg-slate-900 dark:border-slate-700"
                  />
                  <Input
                    value={settings.dark_mode_primary_color}
                    onChange={(e) => setSettings({ ...settings, dark_mode_primary_color: e.target.value })}
                    className="flex-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                    placeholder="#6366F1"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Used for buttons and active states in dark mode</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="dark:text-white">Support Dark Mode</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Allow visitors to toggle dark mode in the widget</p>
              </div>
              <Switch
                checked={settings.support_dark_mode}
                onCheckedChange={(checked) => setSettings({ ...settings, support_dark_mode: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="dark:text-white">Allow File Uploads</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Let visitors upload files in the chat</p>
              </div>
              <Switch
                checked={settings.allow_file_uploads}
                onCheckedChange={(checked) => setSettings({ ...settings, allow_file_uploads: checked })}
              />
            </div>

            <Button onClick={handleSaveWidget} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Widget Settings
            </Button>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="dark:text-white">CRM Integration</CardTitle>
            <CardDescription className="dark:text-slate-400">
              Connect your CRM to sync leads automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider" className="dark:text-white">CRM Provider</Label>
              <Input
                id="provider"
                placeholder="e.g., HubSpot, Salesforce, Custom"
                value={crmSettings.provider}
                onChange={(e) => setCrmSettings({ ...crmSettings, provider: e.target.value })}
                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook" className="dark:text-white">Webhook URL</Label>
              <Input
                id="webhook"
                placeholder="https://your-crm.com/api/webhook"
                value={crmSettings.webhook_url}
                onChange={(e) => setCrmSettings({ ...crmSettings, webhook_url: e.target.value })}
                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey" className="dark:text-white">API Key (Optional)</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Your CRM API key"
                value={crmSettings.api_key}
                onChange={(e) => setCrmSettings({ ...crmSettings, api_key: e.target.value })}
                className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>

            <Button onClick={handleSaveCRM} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save CRM Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}