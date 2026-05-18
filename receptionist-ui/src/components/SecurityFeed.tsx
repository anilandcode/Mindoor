"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Download, RefreshCw } from "lucide-react";
import EventCard, { type SecurityEvent } from "./EventCard";
import StatStrip from "./StatStrip";
import InspectorPanel from "./InspectorPanel";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const EVENTS_URL = `${API_BASE}/api/events`;
const AUDIT_URL  = `${API_BASE}/api/audit/export`;

const POLL_INTERVAL_MS = 1500;

const EMPTY_STATS = { total: 0, blocked: 0, allowed: 0, median_latency_ms: 0 };

export default function SecurityFeed() {
  const [events,    setEvents]    = useState<SecurityEvent[]>([]);
  const [stats,     setStats]     = useState(EMPTY_STATS);
  const [connected, setConnected] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(EVENTS_URL, { cache: "no-store" });
      if (!res.ok) { setConnected(false); return; }
      const data = await res.json();
      setConnected(true);
      setStats(data.stats ?? EMPTY_STATS);

      const incoming: SecurityEvent[] = data.events ?? [];
      if (incoming.length === 0) return;

      setEvents((prev) => {
        if (prev.length === 0) return incoming;
        const existingIds = new Set(prev.map((e) => e.id));
        const fresh = incoming.filter((e) => !existingIds.has(e.id));
        if (fresh.length === 0) return prev;
        // prepend fresh events (feed is newest-first)
        return [...fresh, ...prev].slice(0, 200);
      });

      lastIdRef.current = incoming[0]?.id ?? lastIdRef.current;
    } catch {
      setConnected(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchEvents();
    const id = setInterval(fetchEvents, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchEvents]);

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${AUDIT_URL}?format=pdf&days=30`);
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `mindoor_hipaa_audit_${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Make sure the backend is running and reportlab is installed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Stats */}
      <StatStrip stats={stats} connected={connected} />

      {/* Event feed */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1"
        style={{ scrollbarWidth: "thin" }}
      >
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-white/20 text-xs gap-2">
            <RefreshCw className="w-5 h-5 animate-spin opacity-40" />
            <span>Waiting for interactions…</span>
          </div>
        ) : (
          events.map((ev) => <EventCard key={ev.id} event={ev} />)
        )}

        {/* Inspector panel — Veea ./lobstertrap inspect CLI as a UI */}
        <InspectorPanel />
      </div>

      {/* HIPAA Export button */}
      <div className="shrink-0 pt-2 border-t border-white/8">
        <button
          onClick={handleDownloadPDF}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
            bg-gradient-to-r from-blue-600/20 to-purple-600/20
            border border-blue-500/30 text-blue-300 text-xs font-semibold
            hover:from-blue-600/30 hover:to-purple-600/30 hover:border-blue-400/40
            transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          {loading ? "Generating HIPAA Report…" : "Download HIPAA Audit Report (PDF)"}
        </button>
        <p className="text-center text-[9px] text-white/20 mt-1.5">
          HIPAA §164.312 mapped · Regulator-readable · Auto-signed
        </p>
      </div>
    </div>
  );
}
