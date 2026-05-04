import { ReactNode } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeProvider";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Globe,
  Database,
  Zap,
  MessageCircle,
  Layers,
  BarChart3,
  TestTube,
  Moon,
  Sun,
  Monitor,
  Sparkles,
  Radio,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const isDark = actualTheme === "dark";

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/conversations", icon: MessageSquare, label: "Conversations" },
    { href: "/admin/live-chat", icon: Radio, label: "Live Chat" },
    { href: "/admin/visitor-profiles", icon: Users, label: "Visitor Profiles" },
    { href: "/admin/team-inbox", icon: MessageSquare, label: "Team Inbox" },
    { href: "/admin/leads", icon: Users, label: "Leads" },
    { href: "/admin/knowledge-base", icon: BookOpen, label: "Knowledge Base" },
    { href: "/admin/knowledge-sources", icon: Database, label: "Knowledge Sources" },
    { href: "/admin/website-sync", icon: Globe, label: "Website Sync" },
    { href: "/admin/triggers", icon: Zap, label: "Triggers" },
    { href: "/admin/channels", icon: MessageCircle, label: "Channels" },
    { href: "/admin/playbooks", icon: BookOpen, label: "Playbooks" },
    { href: "/admin/prompt-tuning", icon: Sparkles, label: "Prompt Tuning" },
    { href: "/admin/ab-tests", icon: Layers, label: "A/B Tests" },
    { href: "/admin/reports", icon: BarChart3, label: "Reports" },
    { href: "/admin/testing", icon: TestTube, label: "Testing" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className={`min-h-screen ${isDark ? "dark" : ""}`}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img 
                src="/onetech-logo.png" 
                alt="O.N.E.Tech" 
                className="h-10 w-10"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">O.N.E.Tech</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI Assistant</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white dark:bg-indigo-500"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {/* Theme Toggle */}
            <div className="px-4 py-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Theme</p>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                    theme === "light"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                    theme === "dark"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  Dark
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                    theme === "system"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  Auto
                </button>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}