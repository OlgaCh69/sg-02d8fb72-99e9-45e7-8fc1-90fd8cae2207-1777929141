import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import { MessageCircle, User, Clock, Tag, AlertCircle, CheckCircle, Archive } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
type TeamAssignment = Database["public"]["Tables"]["conversation_assignments"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function TeamInboxPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [assignment, setAssignment] = useState<TeamAssignment | null>(null);
  const [internalNote, setInternalNote] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("open");

  useEffect(() => {
    checkAuth();
    loadData();
  }, [filterStatus]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Load conversations
      let query = supabase
        .from("conversations")
        .select("*")
        .order("started_at", { ascending: false });

      if (filterStatus && filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data: convData } = await query;
      setConversations(convData || []);

      // Load team members
      const { data: teamData } = await supabase
        .from("profiles")
        .select("*")
        .in("admin_role", ["admin", "agent"]);
      setTeamMembers(teamData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv);

    // Load assignment
    const { data: assignmentData } = await supabase
      .from("conversation_assignments")
      .select("*")
      .eq("conversation_id", conv.id)
      .limit(1)
      .maybeSingle();

    setAssignment(assignmentData);
  };

  const handleAssign = async (userId: string) => {
    if (!selectedConversation) return;

    await supabase.from("conversation_assignments").delete().eq("conversation_id", selectedConversation.id);
    const { error } = await supabase.from("conversation_assignments").insert({
      conversation_id: selectedConversation.id,
      assigned_to: userId,
    });

    if (!error) {
      loadData();
      alert("Conversation assigned successfully");
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedConversation) return;

    await supabase
      .from("conversations")
      .update({ status })
      .eq("id", selectedConversation.id);

    loadData();
  };

  const handleAddNote = async () => {
    if (!selectedConversation || !internalNote) return;

    await supabase.from("conversation_notes").insert({
      conversation_id: selectedConversation.id,
      note_text: internalNote,
    });

    setInternalNote("");
    alert("Note added successfully");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "resolved": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "archived": return <Archive className="h-4 w-4 text-slate-600" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <SEO title="Team Inbox - AI Assistant Admin" />
        <p>Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="Team Inbox - AI Assistant Admin" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Inbox</h1>
          <p className="text-slate-600 mt-1">
            Manage and assign conversations to team members
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterStatus === "open" ? "default" : "outline"}
            onClick={() => setFilterStatus("open")}
          >
            Open
          </Button>
          <Button
            variant={filterStatus === "pending" ? "default" : "outline"}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </Button>
          <Button
            variant={filterStatus === "resolved" ? "default" : "outline"}
            onClick={() => setFilterStatus("resolved")}
          >
            Resolved
          </Button>
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
          >
            All
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Conversations List */}
          <Card>
            <CardHeader>
              <CardTitle>Conversations ({conversations.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left p-4 border-b hover:bg-slate-50 transition-colors ${
                      selectedConversation?.id === conv.id ? "bg-indigo-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(conv.status)}
                        <p className="font-medium">{conv.visitor_profile_id?.slice(0, 12)}...</p>
                      </div>
                      <Badge>{conv.channel}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{conv.page_url}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(conv.started_at || new Date()).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conversation Details */}
          {selectedConversation ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Conversation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={selectedConversation.status} onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Assign To</label>
                    <Select onValueChange={handleAssign} value={assignment?.assigned_to || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Internal Notes</label>
                    <Textarea
                      placeholder="Add internal notes..."
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={handleAddNote} className="mt-2" size="sm">
                      Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a conversation to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}