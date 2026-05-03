import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { Instagram, Facebook, MessageCircle, Copy, CheckCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ChannelSettings = Database["public"]["Tables"]["channel_settings"]["Row"];

export default function ChannelsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState<string | null>(null);
  const [instagram, setInstagram] = useState<ChannelSettings | null>(null);
  const [facebook, setFacebook] = useState<ChannelSettings | null>(null);
  const [whatsapp, setWhatsapp] = useState<ChannelSettings | null>(null);

  useEffect(() => {
    checkAuth();
    loadChannelSettings();
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

  const loadChannelSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("channel_settings")
        .select("*");

      if (error) throw error;

      setInstagram(data?.find(c => c.channel === "instagram") || null);
      setFacebook(data?.find(c => c.channel === "facebook") || null);
      setWhatsapp(data?.find(c => c.channel === "whatsapp") || null);
    } catch (error) {
      console.error("Error loading channel settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveChannel = async (channel: string, settings: Partial<ChannelSettings>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("channel_settings")
        .update(settings)
        .eq("channel", channel);

      if (error) throw error;

      await loadChannelSettings();
    } catch (error) {
      console.error("Error saving channel:", error);
      alert("Failed to save channel settings");
    } finally {
      setSaving(false);
    }
  };

  const copyWebhookUrl = (channel: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const webhookUrl = `${baseUrl}/api/channels/${channel}/webhook`;
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(channel);
    setTimeout(() => setCopiedWebhook(null), 2000);
  };

  const getWebhookUrl = (channel: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/api/channels/${channel}/webhook`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <SEO title="Social Channels - AI Assistant Admin" />
        <p>Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="Social Channels - AI Assistant Admin" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Channels</h1>
          <p className="text-slate-600 mt-1">Connect Instagram, Facebook, and WhatsApp to your AI assistant</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 font-medium mb-2">📱 How it works:</p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>All channels use the same AI knowledge base (FAQ entries + website pages)</li>
            <li>Conversations are stored with channel source for analytics</li>
            <li>Leads are captured and synced to your CRM automatically</li>
            <li>User profiles are tracked across platforms when available</li>
          </ul>
        </div>

        <Tabs defaultValue="instagram" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram
            </TabsTrigger>
            <TabsTrigger value="facebook" className="flex items-center gap-2">
              <Facebook className="h-4 w-4" />
              Facebook
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="instagram">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Instagram className="h-5 w-5 text-pink-600" />
                      Instagram Direct Messages
                    </CardTitle>
                    <CardDescription>Connect your Instagram Business account</CardDescription>
                  </div>
                  <Switch
                    checked={instagram?.is_enabled || false}
                    onCheckedChange={(checked) => saveChannel("instagram", { is_enabled: checked })}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input value={getWebhookUrl("instagram")} readOnly className="font-mono text-xs" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyWebhookUrl("instagram")}
                    >
                      {copiedWebhook === "instagram" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">Add this webhook URL in your Meta App settings</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ig-verify-token">Verify Token</Label>
                  <Input
                    id="ig-verify-token"
                    type="text"
                    value={instagram?.verify_token || ""}
                    onChange={(e) => setInstagram({ ...instagram!, verify_token: e.target.value })}
                    placeholder="my_secure_verify_token"
                  />
                  <p className="text-xs text-slate-500">Use this token when setting up webhook verification</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ig-access-token">Page Access Token</Label>
                  <Input
                    id="ig-access-token"
                    type="password"
                    value={instagram?.access_token || ""}
                    onChange={(e) => setInstagram({ ...instagram!, access_token: e.target.value })}
                    placeholder="EAAxxxxxxxx..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ig-app-secret">App Secret</Label>
                  <Input
                    id="ig-app-secret"
                    type="password"
                    value={instagram?.app_secret || ""}
                    onChange={(e) => setInstagram({ ...instagram!, app_secret: e.target.value })}
                    placeholder="xxxxxxxxxxxxxxxx"
                  />
                </div>

                <Button
                  onClick={() => saveChannel("instagram", {
                    verify_token: instagram?.verify_token,
                    access_token: instagram?.access_token,
                    app_secret: instagram?.app_secret,
                  })}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save Instagram Settings"}
                </Button>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm space-y-2">
                  <p className="font-medium text-slate-900">Setup Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
                    <li>Create a Meta App at developers.facebook.com</li>
                    <li>Add Instagram Messaging product to your app</li>
                    <li>Connect your Instagram Business account</li>
                    <li>Copy the webhook URL above</li>
                    <li>In Meta App → Webhooks, subscribe to instagram messages</li>
                    <li>Add Page Access Token and App Secret here</li>
                    <li>Toggle "Enable" to activate</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facebook">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Facebook className="h-5 w-5 text-blue-600" />
                      Facebook Messenger
                    </CardTitle>
                    <CardDescription>Connect your Facebook Page</CardDescription>
                  </div>
                  <Switch
                    checked={facebook?.is_enabled || false}
                    onCheckedChange={(checked) => saveChannel("facebook", { is_enabled: checked })}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input value={getWebhookUrl("facebook")} readOnly className="font-mono text-xs" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyWebhookUrl("facebook")}
                    >
                      {copiedWebhook === "facebook" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fb-verify-token">Verify Token</Label>
                  <Input
                    id="fb-verify-token"
                    type="text"
                    value={facebook?.verify_token || ""}
                    onChange={(e) => setFacebook({ ...facebook!, verify_token: e.target.value })}
                    placeholder="my_secure_verify_token"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fb-access-token">Page Access Token</Label>
                  <Input
                    id="fb-access-token"
                    type="password"
                    value={facebook?.access_token || ""}
                    onChange={(e) => setFacebook({ ...facebook!, access_token: e.target.value })}
                    placeholder="EAAxxxxxxxx..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fb-app-secret">App Secret</Label>
                  <Input
                    id="fb-app-secret"
                    type="password"
                    value={facebook?.app_secret || ""}
                    onChange={(e) => setFacebook({ ...facebook!, app_secret: e.target.value })}
                    placeholder="xxxxxxxxxxxxxxxx"
                  />
                </div>

                <Button
                  onClick={() => saveChannel("facebook", {
                    verify_token: facebook?.verify_token,
                    access_token: facebook?.access_token,
                    app_secret: facebook?.app_secret,
                  })}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save Facebook Settings"}
                </Button>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm space-y-2">
                  <p className="font-medium text-slate-900">Setup Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
                    <li>Create a Meta App at developers.facebook.com</li>
                    <li>Add Messenger product to your app</li>
                    <li>Connect your Facebook Page</li>
                    <li>In Webhooks, subscribe to messages and messaging_postbacks</li>
                    <li>Add the webhook URL and verify token above</li>
                    <li>Generate Page Access Token and add it here</li>
                    <li>Toggle "Enable" to activate</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      WhatsApp Business
                    </CardTitle>
                    <CardDescription>Connect your WhatsApp Business account</CardDescription>
                  </div>
                  <Switch
                    checked={whatsapp?.is_enabled || false}
                    onCheckedChange={(checked) => saveChannel("whatsapp", { is_enabled: checked })}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input value={getWebhookUrl("whatsapp")} readOnly className="font-mono text-xs" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyWebhookUrl("whatsapp")}
                    >
                      {copiedWebhook === "whatsapp" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wa-verify-token">Verify Token</Label>
                  <Input
                    id="wa-verify-token"
                    type="text"
                    value={whatsapp?.verify_token || ""}
                    onChange={(e) => setWhatsapp({ ...whatsapp!, verify_token: e.target.value })}
                    placeholder="my_secure_verify_token"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wa-access-token">Access Token</Label>
                  <Input
                    id="wa-access-token"
                    type="password"
                    value={whatsapp?.access_token || ""}
                    onChange={(e) => setWhatsapp({ ...whatsapp!, access_token: e.target.value })}
                    placeholder="EAAxxxxxxxx..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wa-phone-number-id">Phone Number ID</Label>
                  <Input
                    id="wa-phone-number-id"
                    type="text"
                    value={whatsapp?.phone_number_id || ""}
                    onChange={(e) => setWhatsapp({ ...whatsapp!, phone_number_id: e.target.value })}
                    placeholder="123456789012345"
                  />
                </div>

                <Button
                  onClick={() => saveChannel("whatsapp", {
                    verify_token: whatsapp?.verify_token,
                    access_token: whatsapp?.access_token,
                    phone_number_id: whatsapp?.phone_number_id,
                  })}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save WhatsApp Settings"}
                </Button>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm space-y-2">
                  <p className="font-medium text-slate-900">Setup Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
                    <li>Create a Meta App at developers.facebook.com</li>
                    <li>Add WhatsApp product to your app</li>
                    <li>Get WhatsApp Business Account and Phone Number ID</li>
                    <li>In Webhooks, configure the webhook URL above</li>
                    <li>Subscribe to messages webhook</li>
                    <li>Add Access Token and Phone Number ID here</li>
                    <li>Toggle "Enable" to activate</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}