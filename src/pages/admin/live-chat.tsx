import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import {
  MessageSquare,
  User,
  Send,
  LogOut,
  Clock,
  TrendingUp,
  Loader2,
  Radio,
} from "lucide-react";

type Message = {
  id: string;
  role: string;
  content: string;
  timestamp: string;
  message_type: string;
  sent_by_admin: string | null;
};

type Conversation = {
  id: string;
  visitor_profile_id: string;
  started_at: string;
  is_live_takeover: boolean;
  taken_over_by: string | null;
  page_url: string;
  page_title: string;
  visitor_profiles: {
    name: string;
    email: string;
    company: string;
    lead_score: number;
    lead_status: string;
  };
  last_message: Message;
  message_count: number;
};

export default function LiveChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [taking, setTaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [adminId, setAdminId] = useState<string>("");

  useEffect(() => {
    checkAuth();
    loadActiveConversations();
    
    // Refresh every 3 seconds
    const interval = setInterval(loadActiveConversations, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv.id);
      subscribeToMessages(selectedConv.id);
    }
  }, [selectedConv]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }
    setAdminId(session.user.id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadActiveConversations = async () => {
    try {
      const response = await fetch("/api/admin/active-conversations");
      const data = await response.json();
      
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("timestamp", { ascending: true });

      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleTakeover = async (conversationId: string) => {
    try {
      setTaking(true);
      const response = await fetch("/api/admin/takeover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });

      const data = await response.json();

      if (response.ok) {
        await loadActiveConversations();
        const conv = conversations.find(c => c.id === conversationId);
        if (conv) {
          setSelectedConv({ ...conv, is_live_takeover: true, taken_over_by: adminId });
        }
      } else {
        alert(data.error || "Failed to take over conversation");
      }
    } catch (error) {
      console.error("Takeover error:", error);
      alert("Failed to take over conversation");
    } finally {
      setTaking(false);
    }
  };

  const handleRelease = async () => {
    if (!selectedConv) return;

    try {
      const response = await fetch("/api/admin/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedConv.id }),
      });

      if (response.ok) {
        await loadActiveConversations();
        setSelectedConv({ ...selectedConv, is_live_takeover: false });
      }
    } catch (error) {
      console.error("Release error:", error);
      alert("Failed to release conversation");
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedConv) return;

    try {
      setSending(true);
      const response = await fetch("/api/admin/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConv.id,
          message: inputValue,
        }),
      });

      if (response.ok) {
        setInputValue("");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Send error:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const getLeadStatusColor = (status: string) => {
    if (status === "HOT") return "bg-red-500";
    if (status === "WARM") return "bg-orange-500";
    if (status === "COLD") return "bg-blue-500";
    return "bg-slate-400";
  };

  const getMessageSender = (msg: Message) => {
    if (msg.message_type === "system") return "System";
    if (msg.message_type === "admin") return "You";
    if (msg.role === "user") return "Visitor";
    return "AI";
  };

  if (loading) {
    return (
      <AdminLayout>
        <SEO title="Live Chat - AI Assistant Admin" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="Live Chat - AI Assistant Admin" />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Live Chat
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Jump into active conversations and chat with visitors in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Conversations List */}
          <Card className="lg:col-span-1 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Radio className="h-5 w-5 text-green-500 animate-pulse" />
                Active Chats ({conversations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[700px] overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">No active conversations</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedConv?.id === conv.id
                        ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-700"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-sm dark:text-white">
                          {conv.visitor_profiles?.name || conv.visitor_profiles?.email || "Anonymous"}
                        </span>
                      </div>
                      {conv.is_live_takeover && (
                        <Badge variant="default" className="text-xs">Live</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`h-2 w-2 rounded-full ${getLeadStatusColor(conv.visitor_profiles?.lead_status)}`} />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {conv.visitor_profiles?.lead_status} • Score: {conv.visitor_profiles?.lead_score}
                      </span>
                    </div>

                    {conv.last_message && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {conv.last_message.content.substring(0, 60)}...
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      {new Date(conv.started_at).toLocaleTimeString()}
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2 dark:bg-slate-800 dark:border-slate-700">
            {selectedConv ? (
              <>
                <CardHeader className="border-b dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="dark:text-white">
                        {selectedConv.visitor_profiles?.name || "Anonymous Visitor"}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <span>{selectedConv.visitor_profiles?.company}</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {selectedConv.visitor_profiles?.lead_status} ({selectedConv.visitor_profiles?.lead_score})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        On: {selectedConv.page_title || selectedConv.page_url}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!selectedConv.is_live_takeover ? (
                        <Button
                          onClick={() => handleTakeover(selectedConv.id)}
                          disabled={taking}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          {taking ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                          Take Over
                        </Button>
                      ) : selectedConv.taken_over_by === adminId ? (
                        <Button
                          onClick={handleRelease}
                          variant="outline"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Release
                        </Button>
                      ) : (
                        <Badge variant="secondary">Taken by another admin</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Messages */}
                  <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className="max-w-[80%]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {getMessageSender(msg)}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div
                            className={`rounded-lg p-3 ${
                              msg.role === "user"
                                ? "bg-indigo-600 text-white"
                                : msg.message_type === "admin"
                                ? "bg-green-100 border border-green-200 text-slate-900 dark:bg-green-900 dark:border-green-700 dark:text-white"
                                : msg.message_type === "system"
                                ? "bg-amber-100 border border-amber-200 text-slate-900 dark:bg-amber-900 dark:border-amber-700 dark:text-white"
                                : "bg-white border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t dark:border-slate-700">
                    {selectedConv.is_live_takeover && selectedConv.taken_over_by === adminId ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                          disabled={sending}
                          className="dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={sending || !inputValue.trim()}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-3 text-sm text-slate-500 dark:text-slate-400">
                        {selectedConv.is_live_takeover
                          ? "This conversation is taken over by another admin"
                          : "Take over this conversation to start chatting"}
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-[650px]">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    Select a conversation to start chatting
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}