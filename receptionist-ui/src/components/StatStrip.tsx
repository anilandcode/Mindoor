"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, Timer, FileText } from "lucide-react";

interface Stats {
  total: number;
  blocked: number;
  allowed: number;
  median_latency_ms: number;
}

interface StatStripProps {
  stats: Stats;
  connected: boolean;
}

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
  return (
    <div className="space-y-2">
      {/* Connection status */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
          Security Event Feed
        </span>
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

      {/* Stats row */}
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
