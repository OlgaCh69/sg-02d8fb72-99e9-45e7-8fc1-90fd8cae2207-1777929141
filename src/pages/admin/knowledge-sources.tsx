import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import {
  Globe,
  FileText,
  Upload,
  Package,
  Database,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

type SourceStats = {
  knowledgeBase: { total: number; active: number };
  websitePages: { total: number; approved: number; pending: number };
  documents: { total: number; processed: number; pending: number };
  products: { total: number; active: number };
};

export default function KnowledgeSourcesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SourceStats>({
    knowledgeBase: { total: 0, active: 0 },
    websitePages: { total: 0, approved: 0, pending: 0 },
    documents: { total: 0, processed: 0, pending: 0 },
    products: { total: 0, active: 0 },
  });

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
    }
  };

  const loadStats = async () => {
    setLoading(true);

    // Knowledge Base stats
    const { data: kb } = await supabase.from("knowledge_base").select("is_active");
    const kbStats = {
      total: kb?.length || 0,
      active: kb?.filter(e => e.is_active).length || 0,
    };

    // Website Pages stats
    const { data: pages } = await supabase.from("website_pages").select("status");
    const pagesStats = {
      total: pages?.length || 0,
      approved: pages?.filter(p => p.status === "approved").length || 0,
      pending: pages?.filter(p => p.status === "pending").length || 0,
    };

    // Documents stats
    const { data: docs } = await supabase.from("documents").select("status");
    const docsStats = {
      total: docs?.length || 0,
      processed: docs?.filter(d => d.status === "approved").length || 0,
      pending: docs?.filter(d => d.status === "pending").length || 0,
    };

    // Products stats
    const { data: products } = await supabase.from("products").select("is_active");
    const productsStats = {
      total: products?.length || 0,
      active: products?.filter(p => p.is_active).length || 0,
    };

    setStats({
      knowledgeBase: kbStats,
      websitePages: pagesStats,
      documents: docsStats,
      products: productsStats,
    });

    setLoading(false);
  };

  const sources = [
    {
      icon: Globe,
      title: "Website Crawler",
      description: "Automatically sync content from your website pages",
      stats: `${stats.websitePages.approved} approved, ${stats.websitePages.pending} pending`,
      total: stats.websitePages.total,
      active: stats.websitePages.approved,
      href: "/admin/website-sync",
      color: "indigo",
    },
    {
      icon: FileText,
      title: "Manual FAQ Entries",
      description: "Hand-crafted question and answer pairs",
      stats: `${stats.knowledgeBase.active} active entries`,
      total: stats.knowledgeBase.total,
      active: stats.knowledgeBase.active,
      href: "/admin/knowledge-base",
      color: "cyan",
    },
    {
      icon: Upload,
      title: "Uploaded Documents",
      description: "PDF files and documents (Coming Soon)",
      stats: `${stats.documents.processed} processed, ${stats.documents.pending} pending`,
      total: stats.documents.total,
      active: stats.documents.processed,
      href: "#",
      color: "green",
      comingSoon: true,
    },
    {
      icon: Package,
      title: "Products & Services",
      description: "Product catalog and service information (Coming Soon)",
      stats: `${stats.products.active} active products`,
      total: stats.products.total,
      active: stats.products.active,
      href: "#",
      color: "purple",
      comingSoon: true,
    },
    {
      icon: Database,
      title: "CRM Integration",
      description: "Knowledge from your CRM system (Coming Soon)",
      stats: "Not configured",
      total: 0,
      active: 0,
      href: "/admin/settings",
      color: "amber",
      comingSoon: true,
    },
  ];

  const totalKnowledge = stats.knowledgeBase.active + stats.websitePages.approved + stats.documents.processed + stats.products.active;

  return (
    <AdminLayout>
      <SEO title="Knowledge Sources - AI Assistant Admin" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Sources</h1>
          <p className="text-slate-600">Manage where your AI assistant learns from</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Total Active Knowledge</span>
              </div>
              <p className="text-3xl font-bold text-indigo-600">{totalKnowledge}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Database className="h-4 w-4" />
                <span className="text-sm">Sources Connected</span>
              </div>
              <p className="text-3xl font-bold text-cyan-600">
                {[stats.knowledgeBase.total > 0, stats.websitePages.total > 0, stats.documents.total > 0, stats.products.total > 0].filter(Boolean).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Pending Review</span>
              </div>
              <p className="text-3xl font-bold text-amber-600">
                {stats.websitePages.pending + stats.documents.pending}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {sources.map((source) => {
            const Icon = source.icon;
            return (
              <Card key={source.title} className={source.comingSoon ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg bg-${source.color}-100`}>
                        <Icon className={`h-6 w-6 text-${source.color}-600`} />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {source.title}
                          {source.comingSoon && (
                            <span className="text-xs font-normal bg-slate-200 text-slate-600 px-2 py-1 rounded">
                              Coming Soon
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>{source.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{source.stats}</span>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full bg-${source.color}-600 transition-all`}
                          style={{
                            width: source.total > 0 ? `${(source.active / source.total) * 100}%` : "0%",
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 min-w-[3rem] text-right">
                        {source.total > 0 ? Math.round((source.active / source.total) * 100) : 0}%
                      </span>
                    </div>

                    {!source.comingSoon ? (
                      <Link href={source.href}>
                        <Button variant="outline" className="w-full">
                          Manage
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-indigo-900">How Knowledge Sources Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-indigo-800">
            <div className="flex gap-3">
              <div className="font-bold text-indigo-600">1.</div>
              <div>
                <p className="font-medium">Priority Order</p>
                <p className="text-indigo-700">AI checks Manual FAQ → Website Pages → Documents → Products → CRM in that order</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="font-bold text-indigo-600">2.</div>
              <div>
                <p className="font-medium">Source Tracking</p>
                <p className="text-indigo-700">Every AI answer logs which source was used - visible in conversation history</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="font-bold text-indigo-600">3.</div>
              <div>
                <p className="font-medium">Approval Required</p>
                <p className="text-indigo-700">Website pages and documents need admin approval before AI can use them</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="font-bold text-indigo-600">4.</div>
              <div>
                <p className="font-medium">Fallback Behavior</p>
                <p className="text-indigo-700">If no match found, AI says "I'm not sure" and offers to collect contact details</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}