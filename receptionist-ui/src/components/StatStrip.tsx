"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, Timer, FileText, AlertTriangle } from "lucide-react";

interface Stats {
  total: number;
  blocked: number;
  allowed: number;
  median_latency_ms: number;
  mismatches?: number;
}

interface StatStripProps {
  stats: Stats;
  connected: boolean;
}

interface PolicyInfo {
  pack: string;
  pack_label: string;
  version: string;
  sha256: string;
  rule_count: number;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/3 border border-white/8">
      <div className={`p-1.5 rounded-md ${color}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div>
        <p className="text-[10px] text-white/40 leading-none mb-0.5">{label}</p>
        <p className="text-sm font-bold text-white leading-none">{value}</p>
      </div>
    </div>
  );
}

export default function StatStrip({ stats, connected }: StatStripProps) {
  const [policy, setPolicy] = useState<PolicyInfo | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/policy-info`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setPolicy(data))
      .catch(() => setPolicy(null));
  }, []);

  return (
    <div className="space-y-2">
      {/* Connection status + active policy pack */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
          Security Event Feed
        </span>
        <div className="flex items-center gap-3">
          {policy && (
            <span
              className="flex items-center gap-1 text-[10px] font-mono text-purple-300/80 border border-purple-500/20 px-1.5 py-0.5 rounded"
              title={`Policy SHA-256: ${policy.sha256.slice(0, 16)}…  ·  ${policy.rule_count} rules`}
            >
              <span className="w-1 h-1 bg-purple-400 rounded-full" />
              {policy.pack_label} · v{policy.version}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-[10px]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
            />
            <span className={connected ? "text-emerald-400" : "text-red-400"}>
              {connected ? "Live" : "Offline"}
            </span>
          </span>
        </div>
      </div>

      {/* Stats row — 5 cells */}
      <div className="flex gap-2">
        <Stat
          icon={ShieldAlert}
          label="Blocked"
          value={stats.blocked}
          color="bg-red-500/10 text-red-400"
        />
        <Stat
          icon={ShieldCheck}
          label="Allowed"
          value={stats.allowed}
          color="bg-emerald-500/10 text-emerald-400"
        />
        <Stat
          icon={AlertTriangle}
          label="Mismatches"
          value={stats.mismatches ?? 0}
          color="bg-amber-500/10 text-amber-400"
        />
        <Stat
          icon={Timer}
          label="Median Latency"
          value={stats.median_latency_ms > 0 ? `${stats.median_latency_ms}ms` : "—"}
          color="bg-blue-500/10 text-blue-400"
        />
        <Stat
          icon={FileText}
          label="Total Events"
          value={stats.total}
          color="bg-purple-500/10 text-purple-400"
        />
      </div>
    </div>
  );
}
