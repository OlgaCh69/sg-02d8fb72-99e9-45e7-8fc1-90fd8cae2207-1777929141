import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, UserCheck, TrendingUp, Calendar, Globe } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

interface Stats {
  totalVisitors: number;
  uniqueVisitors: number;
  chatOpens: number;
  conversations: number;
  leads: number;
  conversionRate: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalVisitors: 0,
    uniqueVisitors: 0,
    chatOpens: 0,
    conversations: 0,
    leads: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

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
      // Get total page views
      const { count: totalVisitors } = await supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "page_view");

      // Get unique visitors
      const { data: uniqueVisitorData } = await supabase
        .from("analytics_events")
        .select("visitor_id")
        .eq("event_type", "page_view");
      const uniqueVisitors = new Set(uniqueVisitorData?.map(e => e.visitor_id) || []).size;

      // Get chat opens
      const { count: chatOpens } = await supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "chat_opened");

      // Get conversations
      const { count: conversations } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true });

      // Get leads
      const { count: leads } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true });

      const conversionRate = chatOpens ? ((leads || 0) / chatOpens) * 100 : 0;

      setStats({
        totalVisitors: totalVisitors || 0,
        uniqueVisitors,
        chatOpens: chatOpens || 0,
        conversations: conversations || 0,
        leads: leads || 0,
        conversionRate: Math.round(conversionRate * 10) / 10,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const statCards = [
    { title: "Total Visitors", value: stats.totalVisitors, icon: Globe, color: "text-blue-600" },
    { title: "Unique Visitors", value: stats.uniqueVisitors, icon: Users, color: "text-indigo-600" },
    { title: "Chat Opens", value: stats.chatOpens, icon: MessageSquare, color: "text-cyan-600" },
    { title: "Conversations", value: stats.conversations, icon: Calendar, color: "text-purple-600" },
    { title: "Leads Captured", value: stats.leads, icon: UserCheck, color: "text-green-600" },
    { title: "Conversion Rate", value: `${stats.conversionRate}%`, icon: TrendingUp, color: "text-orange-600" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-slate-600 mt-1">Overview of your AI assistant performance</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your AI assistant system</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => router.push("/admin/conversations")}>View Conversations</Button>
            <Button onClick={() => router.push("/admin/leads")}>View Leads</Button>
            <Button onClick={() => router.push("/admin/knowledge-base")}>Edit Knowledge Base</Button>
            <Button onClick={() => router.push("/admin/settings")}>CRM Settings</Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}