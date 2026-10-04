import React from "react";

export default function UserNotRegisteredError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1f] text-[#e6e6f0] font-mono px-6">
      <div className="max-w-md border border-[#ff00aa]/40 p-8">
        <p className="text-[#ff00aa] text-[10px] tracking-[0.3em] uppercase mb-3">Access restricted</p>
        <h1 className="text-[#00f0ff] text-xl tracking-[0.2em] uppercase mb-4">Not registered</h1>
        <p className="text-sm text-[#e6e6f0]/70">This account is not registered for the gate. Use the account that owns the sigil, or ask the admin.</p>
      </div>
    </div>
  );
}
