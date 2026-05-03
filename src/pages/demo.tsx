import { ChatWidget } from "@/components/ChatWidget";
import { SEO } from "@/components/SEO";
import Link from "next/link";

export default function DemoPage() {
  return (
    <>
      <SEO 
        title="AI Assistant Demo"
        description="Try our AI-powered chat assistant"
      />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                AI Assistant Demo
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Experience our intelligent chat widget that helps visitors, captures leads, and provides instant answers to common questions.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Instant Answers</h3>
                <p className="text-slate-600 text-sm">
                  AI-powered responses based on your knowledge base and FAQs
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Lead Capture</h3>
                <p className="text-slate-600 text-sm">
                  Automatically collect visitor information and sync to your CRM
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                <p className="text-slate-600 text-sm">
                  Track conversations, conversions, and visitor behavior
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 mt-12">
              <h2 className="text-2xl font-bold mb-4">Try It Out</h2>
              <p className="text-slate-600 mb-6">
                Click the chat button in the bottom-right corner to start a conversation with our AI assistant.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left">
                <p className="text-sm font-medium text-slate-700 mb-2">Sample questions you can ask:</p>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>• "What are your business hours?"</li>
                  <li>• "How much does it cost?"</li>
                  <li>• "Do you offer support?"</li>
                  <li>• "Can I get a demo?"</li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="text-slate-500 text-sm">
                Want to add this to your website?{" "}
                <Link href="/admin/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Login to admin panel
                </Link>{" "}
                to get the embed code.
              </p>
            </div>
          </div>
        </div>

        <ChatWidget />
      </div>
    </>
  );
}