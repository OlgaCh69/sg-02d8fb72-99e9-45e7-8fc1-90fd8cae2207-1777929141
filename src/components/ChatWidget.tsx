import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Message = Database["public"]["Tables"]["messages"]["Row"];
type WidgetSettings = Database["public"]["Tables"]["widget_settings"]["Row"];

interface ChatWidgetProps {
  apiUrl?: string;
}

export function ChatWidget({ apiUrl }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [settings, setSettings] = useState<WidgetSettings | null>(null);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeWidget();
    loadSettings();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeWidget = () => {
    let visitor = localStorage.getItem("ai_visitor_id");
    if (!visitor) {
      visitor = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("ai_visitor_id", visitor);
    }
    setVisitorId(visitor);
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  };

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from("widget_settings")
        .select("*")
        .single();
      setSettings(data);
    } catch (error) {
      console.error("Error loading widget settings:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const trackEvent = async (eventType: string, metadata?: any) => {
    try {
      await supabase.from("analytics_events").insert({
        event_type: eventType,
        visitor_id: visitorId,
        session_id: sessionId,
        page_url: window.location.href,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error("Error tracking event:", error);
    }
  };

  const handleOpen = async () => {
    setIsOpen(true);
    await trackEvent("chat_opened");

    if (!conversationId) {
      const { data } = await supabase
        .from("conversations")
        .insert({
          visitor_id: visitorId,
          session_id: sessionId,
          page_url: window.location.href,
          status: "active",
          device: /mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
          browser: navigator.userAgent.split(" ").pop() || "unknown",
        })
        .select()
        .single();

      if (data) {
        setConversationId(data.id);
        
        // Check if we know this user
        let greeting = settings?.welcome_message || "Hi! How can I help you today?";
        try {
          const { data: profiles } = await supabase
            .from("user_profiles")
            .select("full_name")
            .eq("visitor_id", visitorId)
            .limit(1);
          
          if (profiles && profiles.length > 0 && profiles[0].full_name) {
            greeting = `Welcome back, ${profiles[0].full_name.split(' ')[0]}! How can I help you today?`;
          } else if (profiles && profiles.length > 0) {
            greeting = `Welcome back! How can I help you today?`;
          }
        } catch (e) {
          console.error("Failed to check returning user", e);
        }

        const msg: Message = {
          id: `temp_${Date.now()}`,
          conversation_id: data.id,
          role: "assistant",
          content: greeting,
          timestamp: new Date().toISOString(),
          source_type: null,
          source_url: null,
        };
        setMessages([msg]);
      }
    }
  };

  const handleClose = async () => {
    setIsOpen(false);
    
    // Trigger conversation summarization for long-term memory
    if (conversationId) {
      try {
        await fetch("/api/chat/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, visitorId }),
        });
      } catch (error) {
        console.error("Failed to trigger summarization", error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId) return;

    const userMessage: Message = {
      id: `temp_user_${Date.now()}`,
      conversation_id: conversationId,
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
      source_type: null,
      source_url: null,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: inputValue,
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputValue,
          conversationId,
          visitorId,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: `temp_assistant_${Date.now()}`,
        conversation_id: conversationId,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
        source_type: data.sourceType || null,
        source_url: data.sourceUrl || null,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: data.response,
        source_url: data.sourceUrl || null,
        source_type: data.sourceType || null,
      });

      if (data.shouldCaptureLead) {
        setShowLeadForm(true);
      }

      await trackEvent("message_sent");
    } catch (error) {
      console.error("Message error:", error);
      const errorMessage: Message = {
        id: `temp_error_${Date.now()}`,
        conversation_id: conversationId,
        role: "assistant",
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date().toISOString(),
        source_type: null,
        source_url: null,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async () => {
    if (!leadForm.email || !conversationId) return;

    try {
      const { data } = await supabase
        .from("leads")
        .insert({
          conversation_id: conversationId,
          visitor_id: visitorId,
          name: leadForm.name,
          email: leadForm.email,
          phone: leadForm.phone,
          company: leadForm.company,
          lead_score: 75,
        })
        .select()
        .single();

      // Update AI User Profile Memory with the captured details
      try {
        await supabase
          .from("user_profiles")
          .update({
            email: leadForm.email,
            full_name: leadForm.name,
            phone: leadForm.phone,
            lead_status: "warm"
          })
          .eq("visitor_id", visitorId);
      } catch (memError) {
        console.error("Failed to update memory profile", memError);
      }

      if (data) {
        setLeadCaptured(true);
        setShowLeadForm(false);
        await trackEvent("lead_captured", { lead_id: data.id });

        const thankYouMessage: Message = {
          id: `temp_thanks_${Date.now()}`,
          conversation_id: conversationId,
          role: "assistant",
          content: "Thank you! I'll have someone from our team reach out to you shortly.",
          timestamp: new Date().toISOString(),
          source_type: null,
          source_url: null,
        };
        setMessages((prev) => [...prev, thankYouMessage]);
      }
    } catch (error) {
      console.error("Error capturing lead:", error);
    }
  };

  const primaryColor = settings?.primary_color || "#4F46E5";

  if (!settings?.is_enabled) return null;

  return (
    <>
      {!isOpen && (
        <Button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[380px] h-[600px] shadow-2xl flex flex-col z-50 overflow-hidden">
          <div
            className="flex items-center justify-between p-4 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Chat with us</h3>
                <p className="text-xs opacity-90">We typically reply instantly</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-white"
                      : "bg-white border border-slate-200"
                  }`}
                  style={
                    message.role === "user"
                      ? { backgroundColor: primaryColor }
                      : {}
                  }
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                </div>
              </div>
            )}
            {showLeadForm && (
              <div className="bg-white border-2 border-primary rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium">Let's stay in touch!</p>
                <Input
                  placeholder="Your name"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  required
                />
                <Input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                />
                <Input
                  placeholder="Company (optional)"
                  value={leadForm.company}
                  onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                />
                <Button
                  onClick={handleLeadSubmit}
                  className="w-full"
                  style={{ backgroundColor: primaryColor }}
                >
                  Submit
                </Button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={loading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !inputValue.trim()}
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}