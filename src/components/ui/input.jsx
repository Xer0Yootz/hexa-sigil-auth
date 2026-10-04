import React from "react";
export function Input({ className = "", ...props }) {
  return <input className={`w-full bg-black/60 border border-[#00f0ff]/30 px-3 text-[#e6e6f0] ${className}`} {...props} />;
}
