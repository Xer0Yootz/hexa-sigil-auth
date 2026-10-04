import React from "react";
export function Label({ className = "", ...props }) {
  return <label className={`text-[10px] tracking-[0.2em] uppercase text-[#e6e6f0]/70 ${className}`} {...props} />;
}
