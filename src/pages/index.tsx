import { ChatWidget } from "@/components/ChatWidget";
import { SEO } from "@/components/SEO";

export default function Home() {
  return (
    <>
      <SEO 
        title="O.N.E.Tech AI Assistant - 24/7 Lead Capture & Conversion"
        description="Turn website visitors into qualified leads automatically with our AI-powered chat assistant. Built by O.N.E.Tech Automation for high-growth businesses."
      />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-8">
              <img 
                src="/onetech-logo.png" 
                alt="O.N.E.Tech" 
                className="h-20 w-20"
              />
              <div className="text-left">
                <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-2">
                  O.N.E.Tech AI Assistant
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400">
                  Capture & Convert More Leads Automatically
                </p>
              </div>
            </div>
            
            <p className="text-lg text-slate-700 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
              AI-powered chat widget that helps website visitors 24/7, qualifies leads intelligently, 
              and syncs with your CRM automatically. Built by O.N.E.Tech Automation.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Smart Chat Widget</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Floating chat button that opens into a modern, mobile-responsive chat window
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Lead Qualification</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  AI asks smart questions to qualify leads and capture contact details naturally
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Analytics & CRM</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Detailed analytics dashboard and automatic CRM sync with full conversation data
                </p>
              </div>
            </div>

            <div className="bg-indigo-600 text-white p-8 rounded-xl shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Ready to Capture More Leads?</h2>
              <p className="mb-6">Click the chat widget in the bottom right to see it in action!</p>
              <a 
                href="/admin/login"
                className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
              >
                Admin Dashboard →
              </a>
            </div>
          </div>
        </div>
      </div>
      <ChatWidget />
    </>
  );
}
