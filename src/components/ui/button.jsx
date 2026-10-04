import React from "react";
export function Button({ className = "", children, ...props }) {
  return <button className={`border border-[#00f0ff]/40 text-[#e6e6f0] px-4 ${className}`} {...props}>{children}</button>;
}
