import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Globe,
  Layers,
  Share2,
  Zap,
  Database,
  MessageCircle,
  BarChart3,
  TestTube,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-screen p-4">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-indigo-600">AI Assistant</h2>
            <p className="text-sm text-slate-600">Admin Panel</p>
          </div>

          <nav className="space-y-1">
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                router.pathname === "/admin/dashboard"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>

            <Link
              href="/admin/conversations"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                router.pathname === "/admin/conversations"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              Conversations
            </Link>

            <Link
              href="/admin/visitor-profiles"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                router.pathname === "/admin/visitor-profiles"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Users className="h-5 w-5" />
              Visitor Profiles
            </Link>

            <Link
              href="/admin/team-inbox"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                router.pathname === "/admin/team-inbox"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              Team Inbox
            </Link>

            <Link
              href="/admin/leads"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                router.pathname === "/admin/leads"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Users className="h-5 w-5" />
              Leads
            </Link>

            <Link
              href="/admin/knowledge-base"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                router.pathname === "/admin/knowledge-base"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <BookOpen className="h-5 w-5" />
              Knowledge Base
            </Link>

            <Link
              href="/admin/knowledge-sources"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                router.pathname === "/admin/knowledge-sources"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Database className="h-5 w-5" />
              Knowledge Sources
            </Link>

            <Link
              href="/admin/website-sync"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                router.pathname === "/admin/website-sync"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Globe className="h-5 w-5" />
              Website Sync
            </Link>

            <Link
              href="/admin/triggers"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                router.pathname === "/admin/triggers"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Zap className="h-5 w-5" />
              Triggers
            </Link>

            <Link
              href="/admin/channels"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                router.pathname === "/admin/channels"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              Channels
            </Link>

            <Link
              href="/admin/playbooks"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                router.pathname === "/admin/playbooks"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <BookOpen className="h-5 w-5" />
              Playbooks
            </Link>

            <Link
              href="/admin/ab-tests"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                router.pathname === "/admin/ab-tests"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Layers className="h-5 w-5" />
              A/B Tests
            </Link>

            <Link
              href="/admin/reports"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                router.pathname === "/admin/reports"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              Reports
            </Link>

            <Link
              href="/admin/testing"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                router.pathname === "/admin/testing"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <TestTube className="h-5 w-5" />
              Testing
            </Link>

            <Link
              href="/admin/settings"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                router.pathname === "/admin/settings"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>

          <div className="mt-auto pt-8">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}