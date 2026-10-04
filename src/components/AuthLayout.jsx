import React from "react";
import { Link, useLocation } from "react-router-dom";
import HexaBackground from "@/components/HexaBackground";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  const location = useLocation();
  const showTabs = ["/login", "/register"].includes(location.pathname);
  const isLogin = location.pathname === "/login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1f] px-4 font-mono relative">
      <HexaBackground density={55} />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-[#c300ff] text-[10px] tracking-[0.4em] uppercase mb-3">Neon Vigil // IWW</p>
          <div className="inline-flex items-center justify-center w-14 h-14 border border-[#00f0ff]/40 bg-[#00f0ff]/10 mb-4">
            {Icon && <Icon className="w-6 h-6 text-[#00f0ff]" aria-hidden="true" />}
          </div>
          <h1 className="text-[#00f0ff] text-2xl tracking-[0.2em] uppercase">{title}</h1>
          {subtitle && (
            <p className="text-[#ff00aa]/70 text-[10px] tracking-[0.25em] uppercase mt-2">{subtitle}</p>
          )}
        </div>
        {showTabs && (
          <div className="grid grid-cols-2 mb-6 border border-[#00f0ff]/30">
            <Link to="/login" className={`py-2 text-[10px] tracking-[0.3em] uppercase text-center ${
              isLogin ? "bg-[#00f0ff]/15 text-[#00f0ff] border-b-2 border-[#00f0ff]" : "text-[#e6e6f0]/40"
            }`}>Sign In</Link>
            <Link to="/register" className={`py-2 text-[10px] tracking-[0.3em] uppercase text-center ${
              !isLogin ? "bg-[#c300ff]/15 text-[#c300ff] border-b-2 border-[#c300ff]" : "text-[#e6e6f0]/40"
            }`}>Create Account</Link>
          </div>
        )}
        <div className="bg-[#0a0a1f]/80 backdrop-blur-sm border border-[#c300ff]/30 p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-[10px] tracking-[0.2em] uppercase text-[#e6e6f0]/40 mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}
