"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Shield, AlertTriangle, User, Bot, CheckCircle, RefreshCw } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: "user" | "assistant";
  content: string;
  isSecurityAlert?: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

async function reportBlockToEventLog(snippet: string, rule: string, latency: number) {
  try {
    await fetch(`${API_BASE}/api/log-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "BLOCK", snippet: snippet.slice(0, 90), rule, latency_ms: latency }),
    });
  } catch {
    // silent — log is best-effort
  }
}

interface ChatInterfaceProps {
  compact?: boolean;
}

export default function ChatInterface({ compact = false }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi, I'm the Mindoor front-desk assistant for Mindoor Health. I can help you book appointments, answer clinic questions, or take a message for our team. Every conversation here is logged and HIPAA-audited.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<"protected" | "alert">("protected");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (chatContainerRef.current) {
      gsap.from(".message-bubble", {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out",
      });
    }
  }, { dependencies: [messages] });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);
    setSecurityStatus("protected");

    const reqStart = Date.now();
    try {
      const response = await fetch(
        `${API_BASE}/api/chat`,
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: userMsg }].map(m => ({
              role: m.role,
              content: m.content,
            })),
          }),
        },
      );

      const latencyMs = Date.now() - reqStart;
      const data = await response.json();

      const isUpstreamError = data.upstream_error === true;
      const isLobsterTrapBlock = data._lobstertrap?.verdict === "DENY" || (!response.ok && !isUpstreamError);
      const isSecurityBlock = (isLobsterTrapBlock || data.security_alert === true) && !isUpstreamError;

      if (isLobsterTrapBlock && !data.security_alert) {
        reportBlockToEventLog(userMsg, "lobster_trap_dpi", latencyMs);
      }

      if (isSecurityBlock) {
        setSecurityStatus("alert");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response || data.choices?.[0]?.message?.content || "Security block triggered.",
            isSecurityAlert: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response || "I'm sorry, I couldn't process that." },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "System error. Please check if the backend is running." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col ${compact ? "h-full" : "h-[80vh] max-w-4xl"} w-full glass-dark rounded-2xl overflow-hidden shadow-2xl border border-white/10`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center border border-brand-primary/30">
            <Bot className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg leading-tight text-white">Mindoor Front Desk</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse" />
              <span className="text-xs text-white/50">Online • HIPAA Compliant</span>
            </div>
          </div>
        </div>
        
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-500",
          securityStatus === "protected" 
            ? "bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20" 
            : "bg-brand-destructive/10 text-brand-destructive border border-brand-destructive/20 glow shadow-brand-destructive/20"
        )}>
          {securityStatus === "protected" ? (
            <>
              <Shield className="w-3.5 h-3.5" />
              Protected by Lobster Trap
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
              Security Alert: Injection Blocked
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={cn(
              "flex w-full items-start gap-3 message-bubble",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              msg.role === "user" ? "bg-white/10" : "bg-brand-primary/20"
            )}>
              {msg.role === "user" ? <User className="w-4 h-4 text-white/70" /> : <Bot className="w-4 h-4 text-brand-primary" />}
            </div>
            
            <div className={cn(
              "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
              msg.role === "user" 
                ? "bg-brand-primary text-white rounded-tr-none" 
                : msg.isSecurityAlert
                  ? "bg-brand-destructive/20 text-brand-destructive border border-brand-destructive/30 rounded-tl-none font-medium italic"
                  : "bg-white/5 text-white/90 border border-white/5 rounded-tl-none"
            )}>
              {msg.content}
              {msg.isSecurityAlert && (
                <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-wider opacity-70">
                  <Shield className="w-3 h-3" />
                  Veea DPI Enforcement
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-brand-primary animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSendMessage}
        className="p-4 bg-white/5 border-t border-white/10"
      >
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary/80 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-center text-white/30">
          HIPAA-Compliant • PHI Redaction Active • Powered by Veea & Gemini 2.5 Flash
        </p>
      </form>
    </div>
  );
}
