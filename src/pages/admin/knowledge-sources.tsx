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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SEO } from "@/components/SEO";
import {
  BookOpen,
  Globe,
  FileText,
  Package,
  Database as DatabaseIcon,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  Trash2,
  Plus,
  ExternalLink,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type KnowledgeStats = {
  knowledgeBase: { total: number; active: number };
  websitePages: { total: number; approved: number; pending: number };
  documents: { total: number; approved: number; pending: number };
  products: { total: number; active: number };
};

type Document = Database["public"]["Tables"]["documents"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];

export default function KnowledgeSourcesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<KnowledgeStats>({
    knowledgeBase: { total: 0, active: 0 },
    websitePages: { total: 0, approved: 0, pending: 0 },
    documents: { total: 0, approved: 0, pending: 0 },
    products: { total: 0, active: 0 },
  });

  // Documents state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: "", content: "" });

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    features: "",
  });

  useEffect(() => {
    checkAuth();
    loadStats();
    loadDocuments();
    loadProducts();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("admin_role")
      .eq("id", session.user.id)
      .single();

    if (profile?.admin_role !== "admin") {
      router.push("/admin/login");
    }
  };

  const loadStats = async () => {
    try {
      const [kb, pages, docs, prods] = await Promise.all([
        supabase.from("knowledge_base").select("id, is_active"),
        supabase.from("website_pages").select("id, status"),
        supabase.from("documents").select("id, status"),
        supabase.from("products").select("id, is_active"),
      ]);

      setStats({
        knowledgeBase: {
          total: kb.data?.length || 0,
          active: kb.data?.filter(k => k.is_active).length || 0,
        },
        websitePages: {
          total: pages.data?.length || 0,
          approved: pages.data?.filter(p => p.status === "approved").length || 0,
          pending: pages.data?.filter(p => p.status === "pending").length || 0,
        },
        documents: {
          total: docs.data?.length || 0,
          approved: docs.data?.filter(d => d.status === "approved").length || 0,
          pending: docs.data?.filter(d => d.status === "pending").length || 0,
        },
        products: {
          total: prods.data?.length || 0,
          active: prods.data?.filter(p => p.is_active).length || 0,
        },
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .order("uploaded_at", { ascending: false });
    setDocuments(data || []);
  };

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts(data || []);
  };

  const handleDocumentUpload = async () => {
    if (!newDoc.title || !newDoc.content) return;
    
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      await supabase.from("documents").insert({
        title: newDoc.title,
        content: newDoc.content,
        status: "pending",
        uploaded_by: session?.user.id,
        file_name: `${newDoc.title.replace(/\s+/g, "_").toLowerCase()}.txt`,
        file_type: "text/plain",
        file_url: ""
      });

      setNewDoc({ title: "", content: "" });
      await loadDocuments();
      await loadStats();
    } catch (error) {
      console.error("Error uploading document:", error);
    } finally {
      setUploading(false);
    }
  };

  const updateDocumentStatus = async (id: string, status: string) => {
    await supabase
      .from("documents")
      .update({ status })
      .eq("id", id);
    await loadDocuments();
    await loadStats();
  };

  const deleteDocument = async (id: string) => {
    await supabase.from("documents").delete().eq("id", id);
    await loadDocuments();
    await loadStats();
  };

  const handleProductSubmit = async () => {
    if (!newProduct.name || !newProduct.description) return;

    try {
      await supabase.from("products").insert({
        name: newProduct.name,
        description: newProduct.description,
        pricing: newProduct.price || null,
        category: newProduct.category || null,
        features: newProduct.features,
        is_active: true,
      });

      setNewProduct({ name: "", description: "", price: "", category: "", features: "" });
      setShowProductForm(false);
      await loadProducts();
      await loadStats();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const toggleProduct = async (id: string, isActive: boolean) => {
    await supabase
      .from("products")
      .update({ is_active: !isActive })
      .eq("id", id);
    await loadProducts();
    await loadStats();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    await loadProducts();
    await loadStats();
  };

  if (loading) {
    return (
      <AdminLayout>
        <SEO title="Knowledge Sources - AI Assistant Admin" />
        <p>Loading...</p>
      </AdminLayout>
    );
  };

  const sourceCards = [
    {
      title: "Website Crawler",
      description: "Auto-sync pages from your website",
      icon: Globe,
      color: "cyan",
      stats: `${stats.websitePages.approved} approved, ${stats.websitePages.pending} pending`,
      href: "/admin/website-sync",
    },
    {
      title: "Manual FAQ",
      description: "Hand-crafted Q&A entries",
      icon: BookOpen,
      color: "indigo",
      stats: `${stats.knowledgeBase.active} active of ${stats.knowledgeBase.total}`,
      href: "/admin/knowledge-base",
    },
    {
      title: "Documents",
      description: "Upload PDFs, docs, and text files",
      icon: FileText,
      color: "green",
      stats: `${stats.documents.approved} approved, ${stats.documents.pending} pending`,
      href: "#documents",
    },
    {
      title: "Products & Services",
      description: "Your product/service catalog",
      icon: Package,
      color: "purple",
      stats: `${stats.products.active} active of ${stats.products.total}`,
      href: "#products",
    },
    {
      title: "CRM Integration",
      description: "Sync with your CRM system",
      icon: DatabaseIcon,
      color: "orange",
      stats: "Configure webhook",
      href: "/admin/settings",
    },
  ];

  return (
    <AdminLayout>
      <SEO title="Knowledge Sources - AI Assistant Admin" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Sources</h1>
          <p className="text-slate-600 mt-1">
            Connect and manage all knowledge sources for your AI assistant
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sourceCards.map((source) => (
            <Card key={source.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-2 bg-${source.color}-100 rounded-lg`}>
                    <source.icon className={`h-6 w-6 text-${source.color}-600`} />
                  </div>
                  {source.href.startsWith("#") ? (
                    <Badge variant="outline">{stats.websitePages.total > 0 ? "Active" : "Setup"}</Badge>
                  ) : (
                    <a href={source.href}>
                      <ExternalLink className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                    </a>
                  )}
                </div>
                <CardTitle className="mt-4">{source.title}</CardTitle>
                <CardDescription>{source.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">{source.stats}</p>
                  {!source.href.startsWith("#") && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(source.href)}
                    >
                      Manage
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="products">Products & Services</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Priority Order</CardTitle>
                <CardDescription>
                  The AI checks these sources in order when answering questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Badge>1</Badge>
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    <div className="flex-1">
                      <p className="font-medium">Manual FAQ Entries</p>
                      <p className="text-sm text-slate-600">Hand-crafted Q&A for common questions</p>
                    </div>
                    <Badge variant="outline">{stats.knowledgeBase.active} active</Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Badge>2</Badge>
                    <Globe className="h-5 w-5 text-cyan-600" />
                    <div className="flex-1">
                      <p className="font-medium">Website Pages</p>
                      <p className="text-sm text-slate-600">Auto-crawled approved content</p>
                    </div>
                    <Badge variant="outline">{stats.websitePages.approved} approved</Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Badge>3</Badge>
                    <FileText className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium">Documents</p>
                      <p className="text-sm text-slate-600">Uploaded PDFs and text files</p>
                    </div>
                    <Badge variant="outline">{stats.documents.approved} approved</Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Badge>4</Badge>
                    <Package className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="font-medium">Products & Services</p>
                      <p className="text-sm text-slate-600">Your catalog for recommendations</p>
                    </div>
                    <Badge variant="outline">{stats.products.active} active</Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Badge>5</Badge>
                    <DatabaseIcon className="h-5 w-5 text-orange-600" />
                    <div className="flex-1">
                      <p className="font-medium">CRM Data</p>
                      <p className="text-sm text-slate-600">Customer history from your CRM</p>
                    </div>
                    <Badge variant="outline">Configure</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>Upload and manage knowledge documents</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                  <Label>Upload New Document</Label>
                  <Input
                    placeholder="Document title"
                    value={newDoc.title}
                    onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Paste document content here..."
                    value={newDoc.content}
                    onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                    rows={6}
                  />
                  <Button
                    onClick={handleDocumentUpload}
                    disabled={uploading || !newDoc.title || !newDoc.content}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.title}</TableCell>
                        <TableCell>
                          {doc.status === "approved" && (
                            <Badge className="bg-green-100 text-green-800">Approved</Badge>
                          )}
                          {doc.status === "pending" && (
                            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                          )}
                          {doc.status === "excluded" && (
                            <Badge className="bg-slate-100 text-slate-800">Excluded</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {new Date(doc.uploaded_at || new Date()).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {doc.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateDocumentStatus(doc.id, "approved")}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {doc.status === "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateDocumentStatus(doc.id, "excluded")}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteDocument(doc.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {documents.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    No documents uploaded yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Products & Services</CardTitle>
                    <CardDescription>Manage your catalog for AI recommendations</CardDescription>
                  </div>
                  <Button onClick={() => setShowProductForm(!showProductForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showProductForm && (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                    <Input
                      placeholder="Product/Service name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                    <Textarea
                      placeholder="Description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      rows={3}
                    />
                    <div className="grid md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Price (optional)"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      />
                      <Input
                        placeholder="Category (optional)"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      />
                    </div>
                    <Textarea
                      placeholder="Features (one per line)"
                      value={newProduct.features}
                      onChange={(e) => setNewProduct({ ...newProduct, features: e.target.value })}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleProductSubmit} className="flex-1">
                        Create Product
                      </Button>
                      <Button variant="outline" onClick={() => setShowProductForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category || "-"}</TableCell>
                        <TableCell>{product.pricing || "-"}</TableCell>
                        <TableCell>
                          <Badge className={product.is_active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}>
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleProduct(product.id, product.is_active)}
                            >
                              {product.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteProduct(product.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {products.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    No products added yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}