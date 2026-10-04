import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HexaTransition() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [castAvailable, setCastAvailable] = useState(false);

  useEffect(() => {
    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable && window.cast?.framework && window.chrome?.cast) {
        try {
          window.cast.framework.CastContext.getInstance().setOptions({
            receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
          });
          setCastAvailable(true);
        } catch {}
      }
    };
    const timer = setTimeout(() => navigate("/dashboard"), 9000);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const draw = () => {
      ctx.fillStyle = "#0a0a1f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#00f0ff";
      ctx.strokeRect(canvas.width / 2 - 40, canvas.height / 2 - 40, 80, 80);
      raf = requestAnimationFrame(draw);
    };
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-[#0a0a1f]">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center font-mono">
        <p className="text-[#c300ff] text-[10px] tracking-[0.4em] uppercase">Neon Vigil // IWW</p>
        <h2 className="text-[#00f0ff] tracking-[0.3em] uppercase mt-4">Establishing handshake</h2>
      </div>
      <div className="absolute bottom-8 right-8 z-20 flex gap-3">
        {castAvailable && <button className="px-4 py-2 border border-[#c300ff] text-[#c300ff] text-xs tracking-[0.2em] uppercase">Cast</button>}
        <button onClick={() => navigate("/dashboard")} className="px-4 py-2 border border-[#ff00aa] text-[#ff00aa] text-xs tracking-[0.2em] uppercase">Skip</button>
      </div>
    </div>
  );
}
