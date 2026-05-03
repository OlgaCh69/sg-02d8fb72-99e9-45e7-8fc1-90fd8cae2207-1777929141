import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

export default function Home() {
  return (
    <>
      <SEO />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
        <div className="text-center space-y-8 max-w-3xl">
          <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            AI Assistant System
          </h1>
          <p className="text-xl text-slate-600">
            Intelligent chat widget with lead capture, CRM integration, and powerful analytics
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/demo">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                View Demo
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button size="lg" variant="outline">
                Admin Login
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-12 text-left">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold mb-2">For Admins</h3>
              <p className="text-slate-600 text-sm mb-4">
                Manage conversations, view analytics, edit knowledge base, and configure CRM integration
              </p>
              <Link href="/admin/login">
                <Button variant="link" className="p-0 h-auto text-indigo-600">
                  Go to Admin Panel →
                </Button>
              </Link>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold mb-2">For Visitors</h3>
              <p className="text-slate-600 text-sm mb-4">
                Try the AI chat widget and see how it helps answer questions and capture leads
              </p>
              <Link href="/demo">
                <Button variant="link" className="p-0 h-auto text-cyan-600">
                  Try Demo →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
