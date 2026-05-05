import { useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Send, RotateCcw, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

export default function TestingPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const handleTest = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/test/demo-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: message }),
      });

      const data = await res.json();
      setResponse(data);
      setHistory(data.messageHistory || []);
      setMessage("");
    } catch (error) {
      console.error("Test error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await fetch("/api/test/cleanup-demo", {
        method: "POST",
      });
      setResponse(null);
      setHistory([]);
      setMessage("");
    } catch (error) {
      console.error("Reset error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRuleStatus = (passes: boolean) => {
    return passes ? (
      <Badge variant="default" className="bg-green-600">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Pass
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Fail
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <SEO title="AI Testing - AI Assistant Admin" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI Testing
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Test AI responses and validate prompt rules
            </p>
          </div>
          <Button onClick={handleReset} variant="outline" disabled={loading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Test
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Input */}
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Test Conversation</CardTitle>
              <CardDescription className="dark:text-slate-400">
                Send messages to test AI responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a test message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleTest()}
                  disabled={loading}
                  className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
                <Button onClick={handleTest} disabled={loading || !message.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>

              {/* Conversation History */}
              <div className="border dark:border-slate-700 rounded-lg p-4 min-h-[400px] max-h-[500px] overflow-y-auto bg-slate-50 dark:bg-slate-900">
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                    No messages yet. Send a test message to start.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {history.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg p-3 ${
                            msg.role === "user"
                              ? "bg-indigo-600 text-white"
                              : msg.type === "system"
                              ? "bg-amber-100 border border-amber-200 text-slate-900 dark:bg-amber-900 dark:border-amber-700 dark:text-white"
                              : "bg-white border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Response Analysis */}
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Response Analysis</CardTitle>
              <CardDescription className="dark:text-slate-400">
                Validate against response rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!response ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-slate-400 mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Send a message to see response analysis
                  </p>
                </div>
              ) : (
                <>
                  {/* Overall Status */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-100 dark:bg-slate-900">
                    <span className="font-medium dark:text-white">Overall</span>
                    {response.passesRules ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Passes All Rules
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-4 w-4 mr-1" />
                        Rule Violations
                      </Badge>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border dark:border-slate-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium dark:text-white">Word Count</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Target: 40-120 words
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold dark:text-white">
                          {response.metrics?.wordCount || 0}
                        </span>
                        {getRuleStatus(response.metrics?.withinWordLimit)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border dark:border-slate-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium dark:text-white">Sentence Count</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Target: 3-5 sentences
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold dark:text-white">
                          {response.metrics?.sentenceCount || 0}
                        </span>
                        {getRuleStatus(response.metrics?.sentenceStructure)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border dark:border-slate-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium dark:text-white">Question Count</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Target: ≤1 question
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold dark:text-white">
                          {response.metrics?.questionsAsked || 0}
                        </span>
                        {getRuleStatus(response.metrics?.askedQualifyingQuestions)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border dark:border-slate-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium dark:text-white">Paragraph Count</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Keep minimal
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold dark:text-white">
                          {response.metrics?.personalizedElements || 0}
                        </span>
                        {getRuleStatus(response.metrics?.personalized)}
                      </div>
                    </div>
                  </div>

                  {/* AI Response Preview */}
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2 dark:text-white">AI Response:</p>
                    <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border dark:border-slate-700">
                      <p className="text-sm dark:text-slate-300">{response.aiResponse}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}