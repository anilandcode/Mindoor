import ChatInterface from "@/components/ChatInterface";
import { Shield, Sparkles, Calendar } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-24 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-accent/20 rounded-full blur-[120px] -z-10" />
      
      {/* Hero Section */}
      <div className="text-center mb-12 space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 mb-2">
          <Sparkles className="w-3 h-3 text-brand-primary" />
          <span>Next-Generation AI Receptionist</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
          Secure, Intelligent <br />
          <span className="gradient-text">Receptionist for Wellness</span>
        </h1>
        <p className="text-lg text-white/50">
          Experience the future of medical coordination. Powered by Gemini 2.5 Flash 
          and protected by Veea Lobster Trap Enterprise Security.
        </p>
      </div>

      {/* Chat Component */}
      <ChatInterface />

      {/* Footer Info */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="glass rounded-xl p-4 flex items-center gap-4 border border-white/5">
          <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
            <Shield className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Hardened Security</h4>
            <p className="text-xs text-white/40">Real-time DPI protection</p>
          </div>
        </div>
        
        <div className="glass rounded-xl p-4 flex items-center gap-4 border border-white/5">
          <div className="w-10 h-10 rounded-lg bg-brand-secondary/10 flex items-center justify-center border border-brand-secondary/20">
            <Sparkles className="w-5 h-5 text-brand-secondary" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Gemini 2.5 Flash</h4>
            <p className="text-xs text-white/40">Ultra-low latency reasoning</p>
          </div>
        </div>

        <div className="glass rounded-xl p-4 flex items-center gap-4 border border-white/5">
          <div className="w-10 h-10 rounded-lg bg-brand-accent/10 flex items-center justify-center border border-brand-accent/20">
            <Calendar className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Live Booking</h4>
            <p className="text-xs text-white/40">Tool-integrated scheduling</p>
          </div>
        </div>
      </div>
    </main>
  );
}
