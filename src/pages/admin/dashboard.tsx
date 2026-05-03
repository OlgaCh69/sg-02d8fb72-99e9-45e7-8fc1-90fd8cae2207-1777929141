import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import {
  BarChart3,
  MessageSquare,
  Users,
  TrendingUp,
  Globe,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVisitors: 0,
    uniqueVisitors: 0,
    chatOpens: 0,
    conversations: 0,
    leads: 0,
    conversionRate: 0,
    channelBreakdown: {
      website: 0,
      instagram: 0,
      facebook: 0,
      whatsapp: 0,
    },
    leadsByChannel: {
      website: 0,
      instagram: 0,
      facebook: 0,
      whatsapp: 0,
    },
  });

  useEffect(() => {
    checkAuth();
    loadStats();
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

  const loadStats = async () => {
    try {
      const { data: events } = await supabase
        .from("analytics_events")
        .select("event_type, visitor_id");

      const { data: conversations } = await supabase
        .from("conversations")
        .select("id, channel");

      const { data: leads } = await supabase
        .from("leads")
        .select("id, metadata");

      const uniqueVisitors = new Set(events?.map(e => e.visitor_id) || []).size;
      const chatOpens = events?.filter(e => e.event_type === "chat_opened").length || 0;
      const totalLeads = leads?.length || 0;
      const conversionRate = conversations && conversations.length > 0
        ? Math.round((totalLeads / conversations.length) * 100)
        : 0;

      // Channel breakdown for conversations
      const channelBreakdown = {
        website: conversations?.filter(c => c.channel === "website").length || 0,
        instagram: conversations?.filter(c => c.channel === "instagram").length || 0,
        facebook: conversations?.filter(c => c.channel === "facebook").length || 0,
        whatsapp: conversations?.filter(c => c.channel === "whatsapp").length || 0,
      };

      // Leads by channel
      const leadsByChannel = {
        website: leads?.filter(l => (l.metadata as any)?.channel === "website" || !(l.metadata as any)?.channel).length || 0,
        instagram: leads?.filter(l => (l.metadata as any)?.channel === "instagram").length || 0,
        facebook: leads?.filter(l => (l.metadata as any)?.channel === "facebook").length || 0,
        whatsapp: leads?.filter(l => (l.metadata as any)?.channel === "whatsapp").length || 0,
      };

      setStats({
        totalVisitors: events?.length || 0,
        uniqueVisitors,
        chatOpens,
        conversations: conversations?.length || 0,
        leads: totalLeads,
        conversionRate,
        channelBreakdown,
        leadsByChannel,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <SEO title="Dashboard - AI Assistant Admin" />
        <p>Loading...</p>
      </AdminLayout>
    );
  }

  const channelIcons = {
    website: Globe,
    instagram: Instagram,
    facebook: Facebook,
    whatsapp: MessageCircle,
  };

  const channelColors = {
    website: "indigo",
    instagram: "pink",
    facebook: "blue",
    whatsapp: "green",
  };

  return (
    <AdminLayout>
      <SEO title="Dashboard - AI Assistant Admin" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-600 mt-1">Overview of your AI assistant performance</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              <Users className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueVisitors}</div>
              <p className="text-xs text-slate-600">Total events: {stats.totalVisitors}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chat Opens</CardTitle>
              <MessageSquare className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.chatOpens}</div>
              <p className="text-xs text-slate-600">Across all channels</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <BarChart3 className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.leads}</div>
              <p className="text-xs text-slate-600">From {stats.conversations} conversations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-slate-600">Conversation → Lead</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversations by Channel</CardTitle>
              <CardDescription>Total conversations across all platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.channelBreakdown).map(([channel, count]) => {
                  const Icon = channelIcons[channel as keyof typeof channelIcons];
                  const color = channelColors[channel as keyof typeof channelColors];
                  const percentage = stats.conversations > 0 
                    ? Math.round((count / stats.conversations) * 100) 
                    : 0;

                  return (
                    <div key={channel} className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 text-${color}-600`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{channel}</span>
                          <span className="text-sm text-slate-600">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-${color}-600`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leads by Channel</CardTitle>
              <CardDescription>Lead capture performance per channel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.leadsByChannel).map(([channel, count]) => {
                  const Icon = channelIcons[channel as keyof typeof channelIcons];
                  const color = channelColors[channel as keyof typeof channelColors];
                  const channelConversations = stats.channelBreakdown[channel as keyof typeof stats.channelBreakdown];
                  const conversionRate = channelConversations > 0
                    ? Math.round((count / channelConversations) * 100)
                    : 0;

                  return (
                    <div key={channel} className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 text-${color}-600`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{channel}</span>
                          <span className="text-sm text-slate-600">{count} leads ({conversionRate}% conv.)</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-${color}-600`}
                            style={{ width: `${conversionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}