import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Brain, Save, RotateCcw, Sparkles, MessageSquare, Sliders } from "lucide-react";

interface AIConfig {
  id: string;
  system_prompt: string;
  tone: string;
  temperature: number;
  max_tokens: number;
  response_style: string;
  personality_traits: string[];
  custom_instructions: string;
  fallback_message: string;
  greeting_message: string;
  is_active: boolean;
}

export default function AISettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AIConfig | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/admin/login");
      return;
    }
    loadConfig();
  };

  const loadConfig = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ai_config")
      .select("*")
      .eq("is_active", true)
      .single();

    if (data) {
      setConfig(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("ai_config")
        .update({
          system_prompt: config.system_prompt,
          tone: config.tone,
          temperature: config.temperature,
          max_tokens: config.max_tokens,
          response_style: config.response_style,
          personality_traits: config.personality_traits,
          custom_instructions: config.custom_instructions,
          fallback_message: config.fallback_message,
          greeting_message: config.greeting_message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", config.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "AI settings saved successfully",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const defaultConfig: Partial<AIConfig> = {
      system_prompt: 'You are O.N.E.Tech\'s AI Revenue Assistant. You help businesses capture and convert leads through intelligent conversations. Be helpful, professional, and revenue-focused. Keep responses concise (40-120 words). Ask qualifying questions when appropriate.',
      tone: 'professional',
      temperature: 0.7,
      max_tokens: 200,
      response_style: 'balanced',
      personality_traits: ['helpful', 'professional', 'concise', 'revenue-focused'],
      custom_instructions: 'Focus on understanding the visitor\'s business needs and goals. Qualify leads by asking about their business type, current challenges, and timeline.',
      fallback_message: 'I\'m not entirely sure about that. Would you like me to connect you with our team for a detailed answer?',
      greeting_message: 'Hi! Want to see how we can help you capture more leads automatically?',
    };

    setConfig(prev => prev ? { ...prev, ...defaultConfig } : null);
    
    toast({
      title: "Reset",
      description: "Settings reset to defaults (not saved yet)",
    });
  };

  if (loading || !config) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading AI settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="AI Settings - O.N.E.Tech AI Assistant" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Settings</h1>
              <p className="text-slate-600 dark:text-slate-400">Customize your AI assistant's behavior and personality</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            These settings control how your AI assistant responds to visitors. Changes take effect immediately for new conversations.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="instructions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="instructions">
              <MessageSquare className="h-4 w-4 mr-2" />
              Instructions
            </TabsTrigger>
            <TabsTrigger value="personality">
              <Sparkles className="h-4 w-4 mr-2" />
              Personality
            </TabsTrigger>
            <TabsTrigger value="parameters">
              <Sliders className="h-4 w-4 mr-2" />
              Parameters
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* System Instructions Tab */}
          <TabsContent value="instructions">
            <Card>
              <CardHeader>
                <CardTitle>System Instructions</CardTitle>
                <CardDescription>
                  The core prompt that defines your AI assistant's role and behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">System Prompt</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    This is the primary instruction that guides all AI responses
                  </p>
                  <Textarea
                    value={config.system_prompt}
                    onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold">Custom Instructions</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Additional context or specific guidelines for the AI
                  </p>
                  <Textarea
                    value={config.custom_instructions || ''}
                    onChange={(e) => setConfig({ ...config, custom_instructions: e.target.value })}
                    rows={4}
                    placeholder="Add specific instructions about your business, products, or how to handle certain situations..."
                  />
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Tips:</strong> Be specific about what the AI should and shouldn't do. Include your business context, key products/services, and desired conversation flow.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personality Tab */}
          <TabsContent value="personality">
            <Card>
              <CardHeader>
                <CardTitle>Personality & Tone</CardTitle>
                <CardDescription>
                  Define how your AI assistant communicates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tone</Label>
                  <Select
                    value={config.tone}
                    onValueChange={(value) => setConfig({ ...config, tone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Response Style</Label>
                  <Select
                    value={config.response_style}
                    onValueChange={(value) => setConfig({ ...config, response_style: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise - Short, direct answers</SelectItem>
                      <SelectItem value="balanced">Balanced - Medium-length responses</SelectItem>
                      <SelectItem value="detailed">Detailed - Comprehensive explanations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Personality Traits</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Current traits (comma-separated in database)
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {config.personality_traits?.map((trait, i) => (
                      <Badge key={i} variant="secondary">{trait}</Badge>
                    ))}
                  </div>
                  <Input
                    value={config.personality_traits?.join(', ') || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      personality_traits: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
                    })}
                    placeholder="helpful, professional, empathetic, concise"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parameters Tab */}
          <TabsContent value="parameters">
            <Card>
              <CardHeader>
                <CardTitle>AI Parameters</CardTitle>
                <CardDescription>
                  Technical settings that control AI behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Temperature: {config.temperature}</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Controls creativity vs consistency (0.0 = consistent, 1.0 = creative)
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Consistent</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div>
                  <Label>Max Response Length (tokens)</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Maximum length of AI responses (~1 token = 4 characters)
                  </p>
                  <Input
                    type="number"
                    min="50"
                    max="500"
                    value={config.max_tokens}
                    onChange={(e) => setConfig({ ...config, max_tokens: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Recommended: 150-250 tokens for balanced responses
                  </p>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Recommended Settings:</strong>
                    <ul className="list-disc ml-4 mt-2 text-sm">
                      <li>Temperature: 0.7 for balanced responses</li>
                      <li>Max Tokens: 200 for concise but complete answers</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Predefined Messages</CardTitle>
                <CardDescription>
                  Customize key messages used by the AI assistant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Greeting Message</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    First message visitors see when opening the chat
                  </p>
                  <Textarea
                    value={config.greeting_message}
                    onChange={(e) => setConfig({ ...config, greeting_message: e.target.value })}
                    rows={2}
                    placeholder="Hi! How can I help you today?"
                  />
                </div>

                <div>
                  <Label>Fallback Message</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Response when AI doesn't know the answer
                  </p>
                  <Textarea
                    value={config.fallback_message}
                    onChange={(e) => setConfig({ ...config, fallback_message: e.target.value })}
                    rows={2}
                    placeholder="I'm not sure about that. Would you like to speak with our team?"
                  />
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Best Practices:</strong>
                    <ul className="list-disc ml-4 mt-2 text-sm">
                      <li>Keep greetings friendly and actionable</li>
                      <li>Fallback messages should offer human handoff</li>
                      <li>Use clear, conversational language</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Ready to save changes?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your new settings will apply to all future conversations
                </p>
              </div>
              <Button onClick={handleSave} disabled={saving} size="lg">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save All Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}