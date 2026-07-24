import React from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--background)]">
      {/* Left Form Area */}
      <div className="flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-24 xl:px-32 relative">
        <div className="absolute top-8 left-8 lg:top-12 lg:left-12 flex items-center gap-2">
          <Image src="/logo.png" alt="Algo Matrix" width={40} height={40} className="dark:invert" />
          <span className="font-bold text-xl tracking-tight text-[var(--foreground)]">Algo Matrix</span>
        </div>
        
        <div className="mx-auto w-full max-w-sm mt-12 lg:mt-0">
          {children}
        </div>
      </div>

      {/* Right Hero Area */}
      <div className="hidden lg:flex flex-col justify-center p-12 bg-zinc-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 opacity-50"></div>
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 tracking-tight">The Ultimate WhatsApp Cloud API CRM</h2>
          <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
            Manage your campaigns, agents, and templates across multiple workspaces securely. Scale your communications instantly.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
              <h3 className="font-semibold text-lg">Multi-tenant</h3>
              <p className="text-zinc-500 text-sm mt-1">Isolate your clients seamlessly.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
              <h3 className="font-semibold text-lg">Role-based</h3>
              <p className="text-zinc-500 text-sm mt-1">Granular access control.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
              <h3 className="font-semibold text-lg">Automations</h3>
              <p className="text-zinc-500 text-sm mt-1">Trigger events dynamically.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
              <h3 className="font-semibold text-lg">Real-time</h3>
              <p className="text-zinc-500 text-sm mt-1">Instant updates on messages.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
