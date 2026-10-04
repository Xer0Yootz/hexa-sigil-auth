import { useEffect, useRef } from "react";

export default function HexaBackground({ density = 90, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const colors = ["#00f0ff", "#c300ff", "#ff00aa"];
    const particles = [];

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.r = Math.random() * 1.6 + 0.4;
      }
      update() {
        this.vx += (Math.random() - 0.5) * 0.02;
        this.vy += (Math.random() - 0.5) * 0.02;
        this.vx *= 0.99;
        this.vy *= 0.99;
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < density; i++) particles.push(new Particle());
    let raf;
    const animate = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#0a0a1f";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      particles.forEach((p) => { p.update(); p.draw(); });
      raf = requestAnimationFrame(animate);
    };
    animate();
    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [density]);

  return (
    <div className={`fixed inset-0 -z-10 bg-[#0a0a1f] ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 40%, rgba(26,0,51,0.6), rgba(10,10,31,0.95) 70%)" }} />
    </div>
  );
}
