import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Loader2, Info, Paperclip, Moon, Sun } from "lucide-react";
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
  const [triggerFired, setTriggerFired] = useState(false);
  const [consentMemory, setConsentMemory] = useState<boolean | null>(null);
  const [consentAnalytics, setConsentAnalytics] = useState<boolean | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTakenOver, setIsTakenOver] = useState(false);
  const [adminName, setAdminName] = useState<string>("");
  const [autoOpened, setAutoOpened] = useState(false);
  const initialMessages: Message[] = [
    {
      id: "welcome-1",
      role: "assistant",
      content: "Want to see where AI could help your business capture more leads?",
      timestamp: new Date().toISOString(),
      source_type: null,
      source_url: null,
      metadata: {},
      message_type: "system",
      sent_by_admin: null,
      conversation_id: "temp",
    },
  ];

  useEffect(() => {
    initializeWidget();
    loadSettings();
    detectDarkMode();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!triggerFired && !isOpen && settings?.is_enabled) {
      checkProactiveTriggers();
    }
  }, [triggerFired, isOpen, settings]);

  useEffect(() => {
    if (conversationId) {
      subscribeToMessages();
    }
  }, [conversationId]);

  // Auto-open chat after 10 seconds
  useEffect(() => {
    // Check if already auto-opened this session
    const hasAutoOpened = sessionStorage.getItem("ai_chat_auto_opened");
    
    if (!hasAutoOpened && !isOpen && settings?.is_enabled) {
      const timer = setTimeout(() => {
        if (!isOpen && !autoOpened) {
          setAutoOpened(true);
          sessionStorage.setItem("ai_chat_auto_opened", "true");
          handleOpen("auto_10s");
        }
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [isOpen, settings, autoOpened]);

  const subscribeToMessages = () => {
    if (!conversationId) return;

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
          const newMessage = payload.new as Message;
          
          // Check if it's a takeover/release system message
          if (newMessage.message_type === "system") {
            const metadata = newMessage.metadata as any;
            if (metadata?.system_event === "takeover") {
              setIsTakenOver(true);
              setAdminName(metadata?.admin_name || "a human agent");
            } else if (metadata?.system_event === "release") {
              setIsTakenOver(false);
              setAdminName("");
            }
          }
          
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const detectDarkMode = () => {
    // Check if user has widget theme preference
    const savedTheme = localStorage.getItem("ai_widget_theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
      return;
    }

    // Detect system dark mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    // Listen for system theme changes
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("ai_widget_theme")) {
        setIsDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  };

  const toggleWidgetTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("ai_widget_theme", newTheme);
  };

  const initializeWidget = () => {
    // Load or create visitor ID
    let visitor = localStorage.getItem("ai_visitor_id");
    if (!visitor) {
      visitor = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("ai_visitor_id", visitor);
    }
    setVisitorId(visitor);

    // Create session ID
    const session = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(session);

    // Load consent preferences
    const savedMemoryConsent = localStorage.getItem("ai_consent_memory");
    const savedAnalyticsConsent = localStorage.getItem("ai_consent_analytics");
    
    if (savedMemoryConsent !== null) {
      setConsentMemory(savedMemoryConsent === "true");
    }
    if (savedAnalyticsConsent !== null) {
      setConsentAnalytics(savedAnalyticsConsent === "true");
    }

    // Show consent UI if not set
    if (savedMemoryConsent === null || savedAnalyticsConsent === null) {
      setShowConsent(true);
    }
  };

  const handleConsentChoice = async (memory: boolean, analytics: boolean) => {
    setConsentMemory(memory);
    setConsentAnalytics(analytics);
    localStorage.setItem("ai_consent_memory", String(memory));
    localStorage.setItem("ai_consent_analytics", String(analytics));
    setShowConsent(false);

    // Create session
    await fetch("/api/widget/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId,
        sessionId,
        pageUrl: window.location.href,
        pageTitle: document.title,
        referrer: document.referrer || null,
        device: /mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
        browser: navigator.userAgent.split(" ").pop() || "unknown",
        consentMemory: memory,
        consentAnalytics: analytics,
      }),
    });
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

  const checkProactiveTriggers = async () => {
    try {
      const { data: triggers } = await supabase
        .from("trigger_settings")
        .select("*")
        .eq("enabled", true);

      if (!triggers || triggers.length === 0) return;

      const currentPath = window.location.pathname;

      for (const trigger of triggers) {
        if (trigger.page_match_pattern && !currentPath.includes(trigger.page_match_pattern)) {
          continue;
        }

        if (trigger.trigger_type === "time_delay" && trigger.trigger_value) {
          setTimeout(() => {
            if (!isOpen && !triggerFired) {
              handleOpen("time_based");
              setTriggerFired(true);
            }
          }, trigger.trigger_value * 1000);
        }

        if (trigger.trigger_type === "scroll_percentage" && trigger.trigger_value) {
          const handleScroll = () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent >= trigger.trigger_value && !isOpen && !triggerFired) {
              handleOpen("scroll_based");
              setTriggerFired(true);
              window.removeEventListener("scroll", handleScroll);
            }
          };
          window.addEventListener("scroll", handleScroll);
        }

        if (trigger.trigger_type === "exit_intent") {
          const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !isOpen && !triggerFired) {
              handleOpen("exit_intent");
              setTriggerFired(true);
              document.removeEventListener("mouseleave", handleMouseLeave);
            }
          };
          document.addEventListener("mouseleave", handleMouseLeave);
        }
      }
    } catch (error) {
      console.error("Error checking triggers:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const trackEvent = async (eventType: string, metadata?: any) => {
    if (!consentAnalytics) return;
    
    try {
      await fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          sessionId,
          conversationId,
          eventName: eventType,
          pageUrl: window.location.href,
          metadata: metadata || {},
        }),
      });
    } catch (error) {
      console.error("Error tracking event:", error);
    }
  };

  const handleOpen = async (triggerType: string = "manual") => {
    setIsOpen(true);
    await trackEvent("chat_opened");

    if (!conversationId) {
      // Start conversation with memory context
      const response = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          sessionId,
          consentMemory,
          channel: "website",
          triggerType,
        }),
      });

      const data = await response.json();
      setConversationId(data.conversationId);

      // Get personalized greeting based on business hours
      let greeting = settings?.welcome_message || "Hi! How can I help you today?";
      
      if (!data.isWorkingHours) {
        greeting = "Thanks for reaching out! We're currently outside business hours. Leave your details and we'll get back to you soon.";
      } else if (triggerType === "auto_10s") {
        greeting = "Hi there! 👋 I noticed you're browsing — want to see how AI could help your business capture more leads?";
      } else if (data.returningUser && data.userName) {
        greeting = `Welcome back, ${data.userName.split(' ')[0]}! ${greeting}`;
      } else if (data.returningUser) {
        greeting = `Welcome back! ${greeting}`;
      }

      const msg: Message = {
        id: `temp_${Date.now()}`,
        conversation_id: data.conversationId,
        role: "assistant",
        content: greeting,
        timestamp: new Date().toISOString(),
        source_type: null,
        source_url: null,
        metadata: {},
        message_type: "system",
        sent_by_admin: null,
      };
      setMessages([msg]);
    }
  };

  const handleClose = async () => {
    setIsOpen(false);
    
    if (conversationId && consentMemory) {
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversationId", conversationId);
    formData.append("visitorId", visitorId);

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.fileUrl) {
        const fileMessage: Message = {
          id: `temp_file_${Date.now()}`,
          conversation_id: conversationId,
          role: "user",
          content: `📎 Uploaded: ${file.name}`,
          timestamp: new Date().toISOString(),
          source_type: null,
          source_url: data.fileUrl,
          metadata: { file_url: data.fileUrl, file_name: file.name },
          message_type: "user",
          sent_by_admin: null,
        };
        setMessages((prev) => [...prev, fileMessage]);
      }
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
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
      metadata: {},
      message_type: "user",
      sent_by_admin: null,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputValue,
          conversationId,
          visitorId,
          sessionId,
          pageUrl: window.location.href,
          pageTitle: document.title,
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
        metadata: {},
        message_type: "ai",
        sent_by_admin: null,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.shouldCaptureLead && !leadCaptured) {
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
        metadata: {},
        message_type: "system",
        sent_by_admin: null,
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

      // Merge profile if consent given
      if (consentMemory) {
        try {
          await fetch("/api/memory/merge-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              visitorId,
              email: leadForm.email,
              phone: leadForm.phone,
              name: leadForm.name,
              company: leadForm.company,
            }),
          });
        } catch (mergeError) {
          console.error("Failed to merge profile", mergeError);
        }
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
          metadata: {},
          message_type: "system",
          sent_by_admin: null,
        };
        setMessages((prev) => [...prev, thankYouMessage]);
      }
    } catch (error) {
      console.error("Error capturing lead:", error);
    }
  };

  const primaryColor = isDarkMode 
    ? (settings?.dark_mode_primary_color || "#6366F1") 
    : (settings?.primary_color || "#4F46E5");

  const bgColor = isDarkMode ? "bg-slate-900" : "bg-white";
  const textColor = isDarkMode ? "text-white" : "text-slate-900";
  const borderColor = isDarkMode ? "border-slate-700" : "border-slate-200";
  const messageBg = isDarkMode ? "bg-slate-800" : "bg-slate-50";
  const assistantBubble = isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200";

  if (!settings?.is_enabled) return null;

  // Show consent banner if not decided
  if (showConsent && isOpen) {
    return (
      <Card className={`fixed bottom-6 right-6 w-[380px] shadow-2xl z-50 overflow-hidden ${bgColor} ${borderColor} transition-colors duration-300`}>
        <div
          className="flex items-center justify-between p-4 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            <h3 className="font-semibold">Privacy & Consent</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className={`p-4 space-y-4 ${textColor}`}>
          <p className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
            This AI assistant can remember your conversation to improve support and provide personalized help.
          </p>
          <div className="space-y-2">
            <p className={`text-xs font-medium ${isDarkMode ? "text-slate-400" : "text-slate-700"}`}>Your choices:</p>
            <ul className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"} space-y-1 ml-4 list-disc`}>
              <li>Remember my conversation for better support</li>
              <li>Track chat usage for analytics</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleConsentChoice(true, true)}
              className="flex-1"
              style={{ backgroundColor: primaryColor }}
            >
              Accept
            </Button>
            <Button
              onClick={() => handleConsentChoice(false, false)}
              variant="outline"
              className="flex-1"
            >
              Decline
            </Button>
          </div>
          <p className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-500"} text-center`}>
            You can change this anytime in settings
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => handleOpen("manual")}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {isOpen && (
        <Card className={`fixed bottom-6 right-6 w-[380px] h-[600px] shadow-2xl flex flex-col z-50 overflow-hidden ${bgColor} ${borderColor} transition-colors duration-300`}>
          <div
            className="flex items-center justify-between p-4 text-white relative"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">
                  {isTakenOver ? `Chatting with ${adminName}` : "Chat with us"}
                </h3>
                <p className="text-xs opacity-90">
                  {isTakenOver ? "Human support" : "We typically reply instantly"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <img 
                src="/onetech-logo.png" 
                alt="O.N.E.Tech" 
                className="h-8 w-8 mr-2"
              />
              {settings?.support_dark_mode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleWidgetTheme}
                  className="text-white hover:bg-white/20"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${messageBg} transition-colors duration-300`}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 transition-colors duration-300 ${
                    message.role === "user"
                      ? "bg-primary text-white"
                      : assistantBubble
                  }`}
                  style={
                    message.role === "user"
                      ? { backgroundColor: primaryColor }
                      : {}
                  }
                >
                  <p className={`text-sm ${message.role === "assistant" && isDarkMode ? "text-slate-100" : ""}`}>{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className={`${assistantBubble} rounded-lg p-3 transition-colors duration-300`}>
                  <Loader2 className={`h-4 w-4 animate-spin ${isDarkMode ? "text-slate-400" : "text-slate-400"}`} />
                </div>
              </div>
            )}
            {showLeadForm && (
              <div className={`border-2 rounded-lg p-4 space-y-3 transition-colors duration-300 ${isDarkMode ? "bg-slate-800 border-indigo-500" : "bg-white border-primary"}`}>
                <p className={`text-sm font-medium ${textColor}`}>Let's stay in touch!</p>
                <Input
                  placeholder="Your name"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : ""}
                />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  required
                  className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : ""}
                />
                <Input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : ""}
                />
                <Input
                  placeholder="Company (optional)"
                  value={leadForm.company}
                  onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                  className={isDarkMode ? "bg-slate-900 border-slate-700 text-white" : ""}
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

          <div className={`p-4 border-t ${borderColor} ${bgColor} transition-colors duration-300`}>
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              {settings?.allow_file_uploads && (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  disabled={uploadingFile}
                  className={isDarkMode ? "border-slate-700 hover:bg-slate-800" : ""}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              )}
              <Input
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={loading}
                className={isDarkMode ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" : ""}
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !inputValue.trim()}
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <button
                onClick={async () => {
                  if (conversationId) {
                    await supabase
                      .from("conversations")
                      .update({
                        handover_requested: true,
                        handover_requested_at: new Date().toISOString(),
                        handover_reason: "User requested human support",
                      })
                      .eq("id", conversationId);
                    
                    const msg: Message = {
                      id: `temp_handover_${Date.now()}`,
                      conversation_id: conversationId,
                      role: "assistant",
                      content: "I've notified our team. Someone will reach out to you shortly. In the meantime, please leave your contact details if you haven't already.",
                      timestamp: new Date().toISOString(),
                      source_type: null,
                      source_url: null,
                      metadata: {},
                      message_type: "system",
                      sent_by_admin: null,
                    };
                    setMessages((prev) => [...prev, msg]);
                    setShowLeadForm(true);
                  }
                }}
                className={`text-xs ${isDarkMode ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"} underline transition-colors`}
              >
                Request human support
              </button>
              <a 
                href="https://onetechautomation.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`text-xs ${isDarkMode ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"} transition-colors flex items-center gap-1`}
              >
                Powered by <span className="font-semibold">O.N.E.Tech</span>
              </a>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}