import React from "react";
import Image from "next/image";

export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--background)]">
      {/* Left Form Area */}
      <div className="flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-24 xl:px-32 relative">
        <div className="absolute top-8 left-8 lg:top-12 lg:left-12 flex items-center gap-2">
          <Image src="/logo.png" alt="Algo Matrix" width={40} height={40} className="dark:invert" />
          <span className="font-bold text-xl tracking-tight text-[var(--foreground)]">Algo Admin</span>
        </div>
        
        <div className="mx-auto w-full max-w-sm mt-12 lg:mt-0">
          {children}
        </div>
      </div>

      {/* Right Hero Area */}
      <div className="hidden lg:flex flex-col justify-center p-12 bg-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-950 opacity-80"></div>
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 tracking-tight">Super Admin Portal</h2>
          <p className="text-blue-200 text-lg mb-8 leading-relaxed">
            Manage the entire WABA CRM platform, control multi-tenant infrastructure, and monitor global system health.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur">
              <h3 className="font-semibold text-lg text-white">Tenants</h3>
              <p className="text-blue-200 text-sm mt-1">Manage global workspaces.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur">
              <h3 className="font-semibold text-lg text-white">Billing</h3>
              <p className="text-blue-200 text-sm mt-1">Monitor subscriptions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
