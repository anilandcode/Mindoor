"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  action: "ALLOW" | "BLOCK" | "QUARANTINE";
  category: string;
  category_label: string;
  risk: number;
  rule: string;
  snippet: string;
  latency_ms: number;
  source: string;
}

interface EventCardProps {
  event: SecurityEvent;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

function RiskBadge({ risk }: { risk: number }) {
  const pct = Math.round(risk * 100);
  const color =
    risk >= 0.75
      ? "bg-red-500/20 text-red-400 border-red-500/30"
      : risk >= 0.4
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  return (
    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border", color)}>
      {pct}%
    </span>
  );
}

function ActionChip({ action }: { action: SecurityEvent["action"] }) {
  const map = {
    BLOCK:      "bg-red-500/15 text-red-400 border-red-500/25",
    QUARANTINE: "bg-orange-500/15 text-orange-400 border-orange-500/25",
    ALLOW:      "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  };
  const Icon = action === "ALLOW" ? ShieldCheck : action === "QUARANTINE" ? Shield : ShieldAlert;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border", map[action])}>
      <Icon className="w-3 h-3" />
      {action}
    </span>
  );
}

export default function EventCard({ event }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isAlert = event.action !== "ALLOW";

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-all duration-300 text-xs",
        isAlert
          ? "bg-red-950/20 border-red-800/30"
          : "bg-white/2 border-white/8",
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-white/40 font-mono">{formatTime(event.timestamp)}</span>
          <ActionChip action={event.action} />
          <RiskBadge risk={event.risk} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/50 text-[10px] truncate max-w-[140px]">
            {event.category_label}
          </span>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-white/30 hover:text-white/60 transition-colors"
            aria-label="Toggle details"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Snippet */}
      <p className="mt-1.5 text-white/50 truncate font-mono text-[10px] leading-relaxed">
        {event.snippet || "—"}
      </p>

      {/* Expanded */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/8 space-y-1.5">
          <Row label="Event ID"   value={event.id.toUpperCase()} />
          <Row label="Rule"       value={event.rule} />
          <Row label="Source"     value={event.source} />
          <Row label="Latency"    value={`${event.latency_ms} ms`} />
          <Row label="Risk Score" value={event.risk.toString()} />
          <div className="mt-2 p-2 bg-black/20 rounded text-[10px] font-mono text-white/40 break-all leading-relaxed">
            {event.snippet}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-white/30 w-20 shrink-0">{label}</span>
      <span className="text-white/60 font-mono truncate">{value}</span>
    </div>
  );
}
