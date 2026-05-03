import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SEO } from "@/components/SEO";
import { Plus, Trash2, Edit2, Save, X, Search } from "lucide-react";

type KnowledgeEntry = {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function KnowledgeBasePage() {
  const router = useRouter();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    is_active: true,
  });

  useEffect(() => {
    checkAuth();
    loadEntries();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
    }
  };

  const loadEntries = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("knowledge_base")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setEntries(data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!formData.question || !formData.answer) return;

    const { error } = await supabase.from("knowledge_base").insert({
      question: formData.question,
      answer: formData.answer,
      category: formData.category || "General",
      is_active: formData.is_active,
    });

    if (!error) {
      setFormData({ question: "", answer: "", category: "", is_active: true });
      setShowAddForm(false);
      loadEntries();
    }
  };

  const handleUpdate = async (id: string, updates: Partial<KnowledgeEntry>) => {
    const { error } = await supabase
      .from("knowledge_base")
      .update(updates)
      .eq("id", id);

    if (!error) {
      loadEntries();
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    const { error } = await supabase
      .from("knowledge_base")
      .delete()
      .eq("id", id);

    if (!error) loadEntries();
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await handleUpdate(id, { is_active: isActive });
  };

  const filteredEntries = entries.filter(entry =>
    entry.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(entries.map(e => e.category)));

  return (
    <AdminLayout>
      <SEO title="Knowledge Base - AI Assistant Admin" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Knowledge Base</h1>
            <p className="text-slate-600">Manage FAQ entries for your AI assistant</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search questions, answers, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {showAddForm && (
          <Card className="border-2 border-indigo-200">
            <CardHeader>
              <CardTitle>Add New Entry</CardTitle>
              <CardDescription>Create a new FAQ entry for your AI assistant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  placeholder="What are your business hours?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  placeholder="We're open Monday-Friday, 9am-5pm EST..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  placeholder="General, Pricing, Support, etc."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Entry
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center text-slate-500">
                Loading entries...
              </CardContent>
            </Card>
          ) : filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-slate-500">
                {searchQuery ? "No entries match your search" : "No entries yet. Add your first FAQ!"}
              </CardContent>
            </Card>
          ) : (
            filteredEntries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {editingId === entry.id ? (
                        <>
                          <Input
                            defaultValue={entry.question}
                            onBlur={(e) => handleUpdate(entry.id, { question: e.target.value })}
                            className="font-medium"
                          />
                          <Textarea
                            defaultValue={entry.answer}
                            onBlur={(e) => handleUpdate(entry.id, { answer: e.target.value })}
                            rows={3}
                          />
                          <Input
                            defaultValue={entry.category}
                            onBlur={(e) => handleUpdate(entry.id, { category: e.target.value })}
                            placeholder="Category"
                          />
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{entry.question}</h3>
                            <Badge variant={entry.is_active ? "default" : "secondary"}>
                              {entry.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">{entry.category}</Badge>
                          </div>
                          <p className="text-slate-600">{entry.answer}</p>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Switch
                        checked={entry.is_active}
                        onCheckedChange={(checked) => handleToggleActive(entry.id, checked)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(editingId === entry.id ? null : entry.id)}
                      >
                        {editingId === entry.id ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {!loading && entries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Total Entries</p>
                  <p className="text-2xl font-bold">{entries.length}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {entries.filter(e => e.is_active).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Categories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}