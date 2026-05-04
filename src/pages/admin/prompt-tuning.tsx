import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import {
  Play,
  Save,
  Plus,
  Edit,
  Trash2,
  Copy,
  History,
  BarChart3,
  TestTube,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

type PromptTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  created_at: string;
};

type PromptVersion = {
  id: string;
  template_id: string;
  version_number: number;
  prompt_content: string;
  system_instructions: string;
  temperature: number;
  max_tokens: number;
  variables: any[];
  is_published: boolean;
  created_at: string;
};

type TestCase = {
  id: string;
  test_name: string;
  test_input: string;
  expected_output: string;
  context_variables: any;
};

export default function PromptTuningPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editorData, setEditorData] = useState({
    prompt_content: "",
    system_instructions: "",
    temperature: 0.7,
    max_tokens: 500,
  });

  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [testContext, setTestContext] = useState({
    page_url: "https://example.com/pricing",
    page_title: "Pricing",
    visitor_name: "John Doe",
    lead_score: 45,
    lead_status: "WARM",
  });

  useEffect(() => {
    checkAuth();
    loadTemplates();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("prompt_templates")
        .select("*")
        .order("created_at", { ascending: false });

      setTemplates(data || []);

      if (data && data.length > 0) {
        await selectTemplate(data[0]);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = async (template: PromptTemplate) => {
    setSelectedTemplate(template);

    // Load versions
    const { data: versionsData } = await supabase
      .from("prompt_versions")
      .select("*")
      .eq("template_id", template.id)
      .order("version_number", { ascending: false });

    setVersions(versionsData || []);

    if (versionsData && versionsData.length > 0) {
      selectVersion(versionsData[0]);
    }

    // Load test cases
    const { data: testData } = await supabase
      .from("prompt_test_cases")
      .select("*")
      .eq("template_id", template.id);

    setTestCases(testData || []);
  };

  const selectVersion = (version: PromptVersion) => {
    setSelectedVersion(version);
    setEditorData({
      prompt_content: version.prompt_content,
      system_instructions: version.system_instructions || "",
      temperature: version.temperature || 0.7,
      max_tokens: version.max_tokens || 500,
    });
  };

  const handleSaveVersion = async () => {
    if (!selectedTemplate) return;

    try {
      setSaving(true);

      // Get next version number
      const nextVersion = Math.max(...versions.map(v => v.version_number), 0) + 1;

      const { data, error } = await supabase
        .from("prompt_versions")
        .insert({
          template_id: selectedTemplate.id,
          version_number: nextVersion,
          prompt_content: editorData.prompt_content,
          system_instructions: editorData.system_instructions,
          temperature: editorData.temperature,
          max_tokens: editorData.max_tokens,
          is_published: false,
        })
        .select()
        .single();

      if (error) throw error;

      alert(`Version ${nextVersion} saved successfully!`);
      await selectTemplate(selectedTemplate);
    } catch (error) {
      console.error("Error saving version:", error);
      alert("Failed to save version");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishVersion = async (versionId: string) => {
    if (!selectedTemplate) return;

    try {
      // Unpublish all other versions
      await supabase
        .from("prompt_versions")
        .update({ is_published: false })
        .eq("template_id", selectedTemplate.id);

      // Publish this version
      await supabase
        .from("prompt_versions")
        .update({ is_published: true })
        .eq("id", versionId);

      // Activate template
      await supabase
        .from("prompt_templates")
        .update({ is_active: true })
        .eq("id", selectedTemplate.id);

      alert("Version published successfully!");
      await selectTemplate(selectedTemplate);
    } catch (error) {
      console.error("Error publishing version:", error);
      alert("Failed to publish version");
    }
  };

  const handleTestPrompt = async () => {
    if (!editorData.prompt_content || !testInput) return;

    setTesting(true);
    setTestOutput("");

    try {
      // Replace template variables
      let processedPrompt = editorData.prompt_content;
      processedPrompt = processedPrompt.replace(/\{\{page_url\}\}/g, testContext.page_url);
      processedPrompt = processedPrompt.replace(/\{\{page_title\}\}/g, testContext.page_title);
      processedPrompt = processedPrompt.replace(/\{\{visitor_name\}\}/g, testContext.visitor_name);
      processedPrompt = processedPrompt.replace(/\{\{lead_score\}\}/g, String(testContext.lead_score));
      processedPrompt = processedPrompt.replace(/\{\{lead_status\}\}/g, testContext.lead_status);
      processedPrompt = processedPrompt.replace(/\{\{user_message\}\}/g, testInput);
      processedPrompt = processedPrompt.replace(/\{\{recent_messages\}\}/g, "");
      processedPrompt = processedPrompt.replace(/\{\{knowledge_chunks\}\}/g, "No knowledge available for this test.");
      processedPrompt = processedPrompt.replace(/\{\{user_memory\}\}/g, "");

      // Simulate AI response (in production, call OpenAI API here)
      const simulatedResponse = `[SIMULATED AI RESPONSE]

Based on your input: "${testInput}"

Context detected:
- Page: ${testContext.page_title}
- Lead Status: ${testContext.lead_status}
- Lead Score: ${testContext.lead_score}

This is a test response. In production, this would call the OpenAI API with:
- Temperature: ${editorData.temperature}
- Max Tokens: ${editorData.max_tokens}
- System Instructions: ${editorData.system_instructions}

Full processed prompt preview:
${processedPrompt.substring(0, 500)}...`;

      setTestOutput(simulatedResponse);
    } catch (error) {
      console.error("Test error:", error);
      setTestOutput("Error testing prompt: " + error);
    } finally {
      setTesting(false);
    }
  };

  const handleRunTestCases = async () => {
    if (!selectedVersion || testCases.length === 0) return;

    setTesting(true);

    try {
      const results = [];

      for (const testCase of testCases) {
        // Simulate running test case
        const passed = Math.random() > 0.3; // 70% pass rate for demo
        const result = {
          test_case_id: testCase.id,
          version_id: selectedVersion.id,
          actual_output: "Simulated test output",
          passed,
          response_time: Math.floor(Math.random() * 2000) + 500,
          tokens_used: Math.floor(Math.random() * 300) + 100,
        };

        await supabase.from("prompt_test_results").insert(result);
        results.push({ ...testCase, ...result });
      }

      setTestResults(results);
      alert(`Ran ${testCases.length} test cases. ${results.filter(r => r.passed).length} passed.`);
    } catch (error) {
      console.error("Error running tests:", error);
      alert("Failed to run test cases");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <SEO title="Prompt Tuning - AI Assistant Admin" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="Prompt Tuning - AI Assistant Admin" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI Prompt Tuning
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Train and optimize AI responses
            </p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Templates Sidebar */}
          <Card className="lg:col-span-1 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm dark:text-white">Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => selectTemplate(template)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedTemplate?.id === template.id
                      ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-700"
                      : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm dark:text-white">{template.name}</span>
                    {template.is_active && (
                      <Badge variant="default" className="text-xs">Active</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{template.category}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Main Editor */}
          <Card className="lg:col-span-3 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="dark:text-white">{selectedTemplate?.name}</CardTitle>
                  <CardDescription className="dark:text-slate-400">
                    {versions.length} versions • {testCases.length} test cases
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveVersion} disabled={saving} variant="outline">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                  <Button onClick={() => selectedVersion && handlePublishVersion(selectedVersion.id)} className="bg-indigo-600">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="dark:bg-slate-900">
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="test">Test</TabsTrigger>
                  <TabsTrigger value="versions">Versions</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="dark:text-white">Prompt Content</Label>
                    <Textarea
                      value={editorData.prompt_content}
                      onChange={(e) => setEditorData({ ...editorData, prompt_content: e.target.value })}
                      rows={15}
                      className="font-mono text-sm dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      placeholder="Enter your prompt template..."
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Available variables: {"{"}{"{"} page_url {"}"}{"}"}  {"{"}{"{"} page_title {"}"}{"}"}  {"{"}{"{"} visitor_name {"}"}{"}"}  {"{"}{"{"} lead_score {"}"}{"}"}  {"{"}{"{"} user_message {"}"}{"}"} 
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-white">System Instructions</Label>
                    <Textarea
                      value={editorData.system_instructions}
                      onChange={(e) => setEditorData({ ...editorData, system_instructions: e.target.value })}
                      rows={3}
                      className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      placeholder="Additional instructions for the AI..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="dark:text-white">Temperature: {editorData.temperature}</Label>
                      <Slider
                        value={[editorData.temperature]}
                        onValueChange={([value]) => setEditorData({ ...editorData, temperature: value })}
                        min={0}
                        max={2}
                        step={0.1}
                        className="dark:bg-slate-700"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Lower = more focused, Higher = more creative
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="dark:text-white">Max Tokens</Label>
                      <Input
                        type="number"
                        value={editorData.max_tokens}
                        onChange={(e) => setEditorData({ ...editorData, max_tokens: parseInt(e.target.value) })}
                        className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Response length limit
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="test" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="dark:text-white">Test Input</Label>
                        <Textarea
                          value={testInput}
                          onChange={(e) => setTestInput(e.target.value)}
                          rows={4}
                          className="mt-2 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                          placeholder="Enter a test message..."
                        />
                      </div>

                      <div>
                        <Label className="dark:text-white">Test Context</Label>
                        <div className="mt-2 space-y-2">
                          <Input
                            placeholder="Page URL"
                            value={testContext.page_url}
                            onChange={(e) => setTestContext({ ...testContext, page_url: e.target.value })}
                            className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                          />
                          <Input
                            placeholder="Visitor Name"
                            value={testContext.visitor_name}
                            onChange={(e) => setTestContext({ ...testContext, visitor_name: e.target.value })}
                            className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                          />
                          <Select
                            value={testContext.lead_status}
                            onValueChange={(value) => setTestContext({ ...testContext, lead_status: value })}
                          >
                            <SelectTrigger className="dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HOT">HOT</SelectItem>
                              <SelectItem value="WARM">WARM</SelectItem>
                              <SelectItem value="COLD">COLD</SelectItem>
                              <SelectItem value="UNKNOWN">UNKNOWN</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button onClick={handleTestPrompt} disabled={testing} className="w-full bg-indigo-600">
                        {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                        Test Prompt
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="dark:text-white">AI Response</Label>
                      <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border dark:border-slate-700 min-h-[300px]">
                        {testOutput ? (
                          <pre className="text-sm whitespace-pre-wrap dark:text-slate-300">{testOutput}</pre>
                        ) : (
                          <p className="text-slate-400 text-sm">Run a test to see the AI response...</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t dark:border-slate-700 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold dark:text-white">Test Cases ({testCases.length})</h3>
                      <Button onClick={handleRunTestCases} disabled={testing || testCases.length === 0} variant="outline">
                        <TestTube className="h-4 w-4 mr-2" />
                        Run All Tests
                      </Button>
                    </div>

                    {testResults.length > 0 && (
                      <div className="space-y-2">
                        {testResults.map((result, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <div className="flex items-center gap-3">
                              {result.passed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              <div>
                                <p className="font-medium text-sm dark:text-white">{result.test_name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{result.response_time}ms • {result.tokens_used} tokens</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="versions" className="space-y-4 mt-4">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className="p-4 border dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                      onClick={() => selectVersion(version)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold dark:text-white">Version {version.version_number}</span>
                          {version.is_published && (
                            <Badge variant="default">Published</Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => selectVersion(version)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!version.is_published && (
                            <Button size="sm" variant="outline" onClick={() => handlePublishVersion(version.id)}>
                              <Sparkles className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {version.prompt_content.substring(0, 150)}...
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>Temp: {version.temperature}</span>
                        <span>Max Tokens: {version.max_tokens}</span>
                        <span>{new Date(version.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="performance" className="mt-4">
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                    <p className="text-slate-500 dark:text-slate-400">
                      Performance analytics will show here once you have production data
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}