"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Shield, AlertTriangle, User, Bot, CheckCircle, RefreshCw, Search, Cpu, Sparkles } from "lucide-react";
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
  light?: boolean;  // light theme for the landing-page embed
}

export default function ChatInterface({ compact = false, light = false }: ChatInterfaceProps) {
  // Theme-aware class helper — picks light or dark variant
  const t = (lightCls: string, darkCls: string) => (light ? lightCls : darkCls);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi, I'm the Mindoor front-desk assistant for Mindoor Health. I can help you book appointments, answer clinic questions, or take a message for our team. Every conversation here is logged and HIPAA-audited.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loaderStage, setLoaderStage] = useState(0);
  const [securityStatus, setSecurityStatus] = useState<"protected" | "alert">("protected");
  const [guardsOff, setGuardsOff] = useState(false);
  const [declaredIntent, setDeclaredIntent] = useState<string>("info");

  const DECLARED_INTENTS: { value: string; label: string }[] = [
    { value: "booking",   label: "Book an appointment" },
    { value: "info",      label: "Clinic info (hours / services)" },
    { value: "insurance", label: "Insurance question" },
    { value: "records",   label: "Request my records" },
    { value: "message",   label: "Leave a message" },
  ];

  useEffect(() => {
    if (!isLoading) {
      setLoaderStage(0);
      return;
    }
    setLoaderStage(0);
    const id = setInterval(() => {
      setLoaderStage((s) => (s < 3 ? s + 1 : s));
    }, 750);
    return () => clearInterval(id);
  }, [isLoading]);
  
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
        `${API_BASE}/api/chat${guardsOff ? "?guards_off=true" : ""}`,
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: userMsg }].map(m => ({
              role: m.role,
              content: m.content,
            })),
            declared_intent: declaredIntent,
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
    <div className={cn(
      "flex flex-col w-full rounded-2xl overflow-hidden",
      compact ? "h-full" : "h-[80vh] max-w-4xl",
      t(
        "bg-white border border-neutral-200 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.15)]",
        "glass-dark border border-white/10 shadow-2xl"
      )
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 flex items-center justify-between border-b",
        t("bg-neutral-50/60 border-neutral-200", "bg-white/5 border-white/10")
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border",
            t("bg-emerald-50 border-emerald-200", "bg-brand-primary/20 border-brand-primary/30")
          )}>
            <Bot className={cn("w-6 h-6", t("text-emerald-700", "text-brand-primary"))} />
          </div>
          <div>
            <h2 className={cn("font-semibold text-lg leading-tight", t("text-neutral-900", "text-white"))}>Mindoor Front Desk</h2>
            <div className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full animate-pulse", t("bg-emerald-500", "bg-brand-secondary"))} />
              <span className={cn("text-xs", t("text-neutral-500", "text-white/50"))}>Online • HIPAA Compliant</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Veea ON / OFF demo toggle */}
          <button
            type="button"
            onClick={() => setGuardsOff((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all border",
              guardsOff
                ? t(
                    "bg-red-50 text-red-700 border-red-300 hover:bg-red-100",
                    "bg-brand-destructive/15 text-brand-destructive border-brand-destructive/40 hover:bg-brand-destructive/25"
                  )
                : t(
                    "bg-neutral-50 text-neutral-600 border-neutral-200 hover:text-neutral-900 hover:bg-neutral-100",
                    "bg-white/5 text-white/60 border-white/10 hover:text-white/90 hover:bg-white/10"
                  )
            )}
            title="Toggle Veea Lobster Trap on/off for demo"
          >
            <span className={cn("w-1.5 h-1.5 rounded-full",
              guardsOff
                ? t("bg-red-600 animate-pulse", "bg-brand-destructive animate-pulse")
                : t("bg-emerald-500", "bg-brand-secondary")
            )} />
            Veea {guardsOff ? "OFF" : "ON"}
          </button>

          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-500 border",
            guardsOff
              ? t(
                  "bg-red-50 text-red-700 border-red-200",
                  "bg-brand-destructive/10 text-brand-destructive border-brand-destructive/30"
                )
              : securityStatus === "protected"
                ? t(
                    "bg-emerald-50 text-emerald-700 border-emerald-200",
                    "bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20"
                  )
                : t(
                    "bg-red-50 text-red-700 border-red-200",
                    "bg-brand-destructive/10 text-brand-destructive border-brand-destructive/20 glow shadow-brand-destructive/20"
                  )
          )}>
            {guardsOff ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                Guardrails Disabled · DEMO
              </>
            ) : securityStatus === "protected" ? (
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
              msg.role === "user"
                ? t("bg-neutral-200", "bg-white/10")
                : t("bg-emerald-50 border border-emerald-100", "bg-brand-primary/20")
            )}>
              {msg.role === "user"
                ? <User className={cn("w-4 h-4", t("text-neutral-600", "text-white/70"))} />
                : <Bot className={cn("w-4 h-4", t("text-emerald-700", "text-brand-primary"))} />}
            </div>

            <div className={cn(
              "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
              msg.role === "user"
                ? t("bg-neutral-900 text-white rounded-tr-none", "bg-brand-primary text-white rounded-tr-none")
                : msg.isSecurityAlert
                  ? t(
                      "bg-red-50 text-red-700 border border-red-200 rounded-tl-none font-medium italic",
                      "bg-brand-destructive/20 text-brand-destructive border border-brand-destructive/30 rounded-tl-none font-medium italic"
                    )
                  : t(
                      "bg-neutral-100 text-neutral-900 border border-neutral-200 rounded-tl-none",
                      "bg-white/5 text-white/90 border border-white/5 rounded-tl-none"
                    )
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
        {isLoading && (() => {
          const stages = [
            { icon: Shield,    label: "Inspecting message",         sub: "Veea Lobster Trap · DPI" },
            { icon: Search,    label: "Pattern matching",           sub: "22 healthcare attack signatures" },
            { icon: Cpu,       label: "Routing through model chain", sub: "Vultr → Featherless → Gemini" },
            { icon: Sparkles,  label: "Generating compliant response", sub: "HIPAA-aware reply" },
          ];
          const s = stages[loaderStage] ?? stages[stages.length - 1];
          const Icon = s.icon;
          return (
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                t("bg-emerald-50 border border-emerald-100", "bg-brand-primary/20")
              )}>
                <Icon className={cn("w-4 h-4", t("text-emerald-700", "text-brand-primary"))} />
              </div>
              <div className={cn(
                "px-4 py-3 rounded-2xl rounded-tl-none min-w-[280px] max-w-[340px] border",
                t("bg-emerald-50/60 border-emerald-200", "bg-white/5 border-brand-primary/20")
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-sm font-medium", t("text-neutral-900", "text-white/90"))}>{s.label}</span>
                  <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", t("bg-emerald-600", "bg-brand-primary"))} />
                </div>
                <div className={cn("text-[10px] uppercase tracking-wider mb-2", t("text-neutral-500", "text-white/40"))}>{s.sub}</div>
                <div className={cn("h-[3px] w-full rounded-full overflow-hidden", t("bg-emerald-100", "bg-white/5"))}>
                  <div
                    className={cn(
                      "h-full bg-[length:200%_100%] animate-[shimmer_1.4s_linear_infinite]",
                      t(
                        "bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600",
                        "bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary"
                      )
                    )}
                    style={{ width: `${25 * (loaderStage + 1)}%` }}
                  />
                </div>
                <div className="mt-2 flex gap-1.5">
                  {stages.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-all duration-500",
                        i <= loaderStage
                          ? t("bg-emerald-600", "bg-brand-primary")
                          : t("bg-neutral-200", "bg-white/10")
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className={cn(
          "p-4 border-t space-y-2",
          t("bg-neutral-50/40 border-neutral-200", "bg-white/5 border-white/10")
        )}
      >
        {/* Declared-intent dropdown (Veea declared-vs-detected mismatch signal) */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className={cn(
            "font-mono uppercase tracking-wider",
            t("text-neutral-500", "text-white/40")
          )}>
            I want to:
          </span>
          <select
            value={declaredIntent}
            onChange={(e) => setDeclaredIntent(e.target.value)}
            className={cn(
              "flex-1 rounded-md py-1 px-2 text-[12px] border focus:outline-none focus:ring-1 transition-all",
              t(
                "bg-white border-neutral-200 text-neutral-800 focus:ring-emerald-500/30",
                "bg-white/5 border-white/10 text-white/80 focus:ring-brand-primary/30"
              )
            )}
          >
            {DECLARED_INTENTS.map((it) => (
              <option key={it.value} value={it.value} className={t("text-neutral-900", "text-neutral-900")}>
                {it.label}
              </option>
            ))}
          </select>
          <span className={cn(
            "text-[10px] font-mono",
            t("text-neutral-400", "text-white/30")
          )}>
            · declared intent
          </span>
        </div>
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className={cn(
              "w-full rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 transition-all border",
              t(
                "bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:ring-emerald-500/30 focus:border-emerald-500/60",
                "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-brand-primary/50 focus:border-brand-primary/50"
              )
            )}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
              t("bg-emerald-600 hover:bg-emerald-700", "bg-brand-primary hover:bg-brand-primary/80")
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className={cn("mt-2 text-[10px] text-center", t("text-neutral-500", "text-white/30"))}>
          HIPAA-Compliant • PHI Redaction Active • Powered by Veea & Gemini 2.5 Flash
        </p>
      </form>
    </div>
  );
}
