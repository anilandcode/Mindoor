import ChatInterface from "@/components/ChatInterface";
import SecurityFeed from "@/components/SecurityFeed";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OperatorPage() {
  return (
    <main className="h-screen flex flex-col overflow-hidden relative">
      {/* Background */}
      <div className="absolute top-[-10%] left-[-5%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px] -z-10" />

      {/* Top bar */}
      <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-white/8 bg-black/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Patient View
          </Link>
          <span className="text-white/20">·</span>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">Mindoor Operator Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/30">
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
            Veea Lobster Trap
          </span>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-medium">
            Gemini 2.5 Flash
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
            HIPAA §164.312
          </span>
        </div>
      </header>

      {/* Split pane */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* LEFT — Patient chat */}
        <div className="w-[55%] flex flex-col p-4 border-r border-white/8 min-h-0">
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-3 shrink-0">
            Patient Interface
          </p>
          <div className="flex-1 min-h-0">
            <ChatInterface compact />
          </div>
        </div>

        {/* RIGHT — Security feed */}
        <div className="w-[45%] flex flex-col p-4 min-h-0">
          <SecurityFeed />
        </div>

      </div>
    </main>
  );
}
