import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a1f] text-[#e6e6f0] font-mono flex items-center justify-center">
      <div className="text-center">
        <p className="text-[#ff00aa] tracking-[0.3em] uppercase">404</p>
        <Link to="/" className="text-[#00f0ff] text-sm mt-4 inline-block">Return</Link>
      </div>
    </div>
  );
}
