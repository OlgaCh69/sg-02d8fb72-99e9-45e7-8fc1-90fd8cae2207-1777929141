import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Instagram, Facebook, Send, Check, X, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ChannelConfig = {
  id?: string;
  channel_type: string;
  is_enabled: boolean;
  webhook_url: string | null;
  access_token: string | null;
  phone_number_id: string | null;
  verify_token: string | null;
  app_secret: string | null;
  page_id: string | null;
  config: any;
};

export default function ChannelsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState<Record<string, ChannelConfig>>({
    whatsapp: {
      channel_type: "whatsapp",
      is_enabled: false,
      webhook_url: null,
      access_token: null,
      phone_number_id: null,
      verify_token: null,
      app_secret: null,
      page_id: null,
      config: {},
    },
    instagram: {
      channel_type: "instagram",
      is_enabled: false,
      webhook_url: null,
      access_token: null,
      phone_number_id: null,
      verify_token: null,
      app_secret: null,
      page_id: null,
      config: {},
    },
    facebook: {
      channel_type: "facebook",
      is_enabled: false,
      webhook_url: null,
      access_token: null,
      phone_number_id: null,
      verify_token: null,
      app_secret: null,
      page_id: null,
      config: {},
    },
    telegram: {
      channel_type: "telegram",
      is_enabled: false,
      webhook_url: null,
      access_token: null,
      phone_number_id: null,
      verify_token: null,
      app_secret: null,
      page_id: null,
      config: {},
    },
  });

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const { data } = await supabase
        .from("channel_configs")
        .select("*");

      if (data) {
        const channelMap = { ...channels };
        data.forEach((channel) => {
          channelMap[channel.channel_type] = channel;
        });
        setChannels(channelMap);
      }
    } catch (error) {
      console.error("Error loading channels:", error);
    }
  };

  const updateChannel = async (channelType: string, updates: Partial<ChannelConfig>) => {
    const channel = channels[channelType];
    const updatedChannel = { ...channel, ...updates };

    setChannels({ ...channels, [channelType]: updatedChannel });
  };

  const saveChannel = async (channelType: string) => {
    setLoading(true);
    try {
      const channel = channels[channelType];

      if (channel.id) {
        await supabase
          .from("channel_configs")
          .update({
            is_enabled: channel.is_enabled,
            webhook_url: channel.webhook_url,
            access_token: channel.access_token,
            phone_number_id: channel.phone_number_id,
            verify_token: channel.verify_token,
            app_secret: channel.app_secret,
            page_id: channel.page_id,
            config: channel.config,
          })
          .eq("id", channel.id);
      } else {
        await supabase
          .from("channel_configs")
          .insert({
            channel_type: channelType,
            is_enabled: channel.is_enabled,
            webhook_url: channel.webhook_url,
            access_token: channel.access_token,
            phone_number_id: channel.phone_number_id,
            verify_token: channel.verify_token,
            app_secret: channel.app_secret,
            page_id: channel.page_id,
            config: channel.config,
          });
      }

      toast({
        title: "Success",
        description: `${channelType.charAt(0).toUpperCase() + channelType.slice(1)} channel saved`,
      });

      loadChannels();
    } catch (error) {
      console.error("Error saving channel:", error);
      toast({
        title: "Error",
        description: "Failed to save channel configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Webhook URL copied to clipboard",
    });
  };

  const webhookUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/api/channels`
    : "";

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Channel Integrations
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Connect WhatsApp, Instagram, Facebook, and Telegram to your AI assistant
          </p>
        </div>

        <Tabs defaultValue="whatsapp" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
              {channels.whatsapp.is_enabled && <Badge variant="default" className="ml-1">Active</Badge>}
            </TabsTrigger>
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram
              {channels.instagram.is_enabled && <Badge variant="default" className="ml-1">Active</Badge>}
            </TabsTrigger>
            <TabsTrigger value="facebook" className="flex items-center gap-2">
              <Facebook className="h-4 w-4" />
              Facebook
              {channels.facebook.is_enabled && <Badge variant="default" className="ml-1">Active</Badge>}
            </TabsTrigger>
            <TabsTrigger value="telegram" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Telegram
              {channels.telegram.is_enabled && <Badge variant="default" className="ml-1">Active</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* WhatsApp */}
          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp Business API
                </CardTitle>
                <CardDescription>
                  Connect your WhatsApp Business account to receive and respond to messages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertDescription>
                    <strong>Setup Instructions:</strong>
                    <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
                      <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Meta for Developers</a></li>
                      <li>Create a WhatsApp Business App</li>
                      <li>Get your Phone Number ID and Access Token</li>
                      <li>Configure webhook with URL below</li>
                      <li>Enable message webhooks</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label>Webhook URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        value={`${webhookUrl}/whatsapp/webhook`}
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(`${webhookUrl}/whatsapp/webhook`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Verify Token</Label>
                    <Input
                      value={channels.whatsapp.verify_token || ""}
                      onChange={(e) => updateChannel("whatsapp", { verify_token: e.target.value })}
                      placeholder="my_verify_token"
                    />
                    <p className="text-xs text-slate-500 mt-1">Use this when setting up webhook in Meta</p>
                  </div>

                  <div>
                    <Label>Access Token</Label>
                    <Input
                      type="password"
                      value={channels.whatsapp.access_token || ""}
                      onChange={(e) => updateChannel("whatsapp", { access_token: e.target.value })}
                      placeholder="EAAxxxxxxxxxxxx"
                    />
                  </div>

                  <div>
                    <Label>Phone Number ID</Label>
                    <Input
                      value={channels.whatsapp.phone_number_id || ""}
                      onChange={(e) => updateChannel("whatsapp", { phone_number_id: e.target.value })}
                      placeholder="123456789012345"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="whatsapp-enabled"
                        checked={channels.whatsapp.is_enabled}
                        onChange={(e) => updateChannel("whatsapp", { is_enabled: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="whatsapp-enabled" className="cursor-pointer">
                        Enable WhatsApp Channel
                      </Label>
                    </div>
                    <Button 
                      onClick={() => saveChannel("whatsapp")} 
                      disabled={loading}
                    >
                      Save Configuration
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instagram */}
          <TabsContent value="instagram">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="h-5 w-5" />
                  Instagram Messaging
                </CardTitle>
                <CardDescription>
                  Respond to Instagram DMs automatically with AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertDescription>
                    <strong>Setup Instructions:</strong>
                    <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
                      <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Meta for Developers</a></li>
                      <li>Create an Instagram Business App</li>
                      <li>Connect your Instagram Business account</li>
                      <li>Get Page Access Token</li>
                      <li>Configure webhook with URL below</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label>Webhook URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        value={`${webhookUrl}/instagram/webhook`}
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(`${webhookUrl}/instagram/webhook`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Verify Token</Label>
                    <Input
                      value={channels.instagram.verify_token || ""}
                      onChange={(e) => updateChannel("instagram", { verify_token: e.target.value })}
                      placeholder="my_verify_token"
                    />
                  </div>

                  <div>
                    <Label>Page Access Token</Label>
                    <Input
                      type="password"
                      value={channels.instagram.access_token || ""}
                      onChange={(e) => updateChannel("instagram", { access_token: e.target.value })}
                      placeholder="EAAxxxxxxxxxxxx"
                    />
                  </div>

                  <div>
                    <Label>Instagram Page ID</Label>
                    <Input
                      value={channels.instagram.page_id || ""}
                      onChange={(e) => updateChannel("instagram", { page_id: e.target.value })}
                      placeholder="123456789012345"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="instagram-enabled"
                        checked={channels.instagram.is_enabled}
                        onChange={(e) => updateChannel("instagram", { is_enabled: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="instagram-enabled" className="cursor-pointer">
                        Enable Instagram Channel
                      </Label>
                    </div>
                    <Button 
                      onClick={() => saveChannel("instagram")} 
                      disabled={loading}
                    >
                      Save Configuration
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Facebook */}
          <TabsContent value="facebook">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="h-5 w-5" />
                  Facebook Messenger
                </CardTitle>
                <CardDescription>
                  Connect Facebook Messenger to your AI assistant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertDescription>
                    <strong>Setup Instructions:</strong>
                    <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
                      <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Meta for Developers</a></li>
                      <li>Create a Messenger App</li>
                      <li>Connect your Facebook Page</li>
                      <li>Get Page Access Token</li>
                      <li>Configure webhook with URL below</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label>Webhook URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        value={`${webhookUrl}/facebook/webhook`}
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(`${webhookUrl}/facebook/webhook`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Verify Token</Label>
                    <Input
                      value={channels.facebook.verify_token || ""}
                      onChange={(e) => updateChannel("facebook", { verify_token: e.target.value })}
                      placeholder="my_verify_token"
                    />
                  </div>

                  <div>
                    <Label>Page Access Token</Label>
                    <Input
                      type="password"
                      value={channels.facebook.access_token || ""}
                      onChange={(e) => updateChannel("facebook", { access_token: e.target.value })}
                      placeholder="EAAxxxxxxxxxxxx"
                    />
                  </div>

                  <div>
                    <Label>Facebook Page ID</Label>
                    <Input
                      value={channels.facebook.page_id || ""}
                      onChange={(e) => updateChannel("facebook", { page_id: e.target.value })}
                      placeholder="123456789012345"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="facebook-enabled"
                        checked={channels.facebook.is_enabled}
                        onChange={(e) => updateChannel("facebook", { is_enabled: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="facebook-enabled" className="cursor-pointer">
                        Enable Facebook Channel
                      </Label>
                    </div>
                    <Button 
                      onClick={() => saveChannel("facebook")} 
                      disabled={loading}
                    >
                      Save Configuration
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Telegram */}
          <TabsContent value="telegram">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Telegram Bot
                </CardTitle>
                <CardDescription>
                  Create a Telegram bot for your AI assistant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertDescription>
                    <strong>Setup Instructions:</strong>
                    <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
                      <li>Open Telegram and search for <strong>@BotFather</strong></li>
                      <li>Send <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">/newbot</code> command</li>
                      <li>Follow instructions to create bot</li>
                      <li>Copy the API Token</li>
                      <li>Set webhook URL using the command below</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label>Webhook URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        value={`${webhookUrl}/telegram/webhook`}
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(`${webhookUrl}/telegram/webhook`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Bot Token</Label>
                    <Input
                      type="password"
                      value={channels.telegram.access_token || ""}
                      onChange={(e) => updateChannel("telegram", { access_token: e.target.value })}
                      placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    />
                  </div>

                  <Alert>
                    <AlertDescription>
                      <strong>Set Webhook Command:</strong>
                      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded mt-2 font-mono text-xs overflow-x-auto">
                        curl -X POST https://api.telegram.org/bot{channels.telegram.access_token || "YOUR_BOT_TOKEN"}/setWebhook -d url={webhookUrl}/telegram/webhook
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-2"
                        onClick={() => copyToClipboard(`curl -X POST https://api.telegram.org/bot${channels.telegram.access_token}/setWebhook -d url=${webhookUrl}/telegram/webhook`)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Command
                      </Button>
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="telegram-enabled"
                        checked={channels.telegram.is_enabled}
                        onChange={(e) => updateChannel("telegram", { is_enabled: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="telegram-enabled" className="cursor-pointer">
                        Enable Telegram Channel
                      </Label>
                    </div>
                    <Button 
                      onClick={() => saveChannel("telegram")} 
                      disabled={loading}
                    >
                      Save Configuration
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}