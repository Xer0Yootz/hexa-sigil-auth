import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import HexaBackground from "@/components/HexaBackground";

const ARCHETYPES = [
  { id: "Signalblade", lore: "Cuts through corrupted data with edged light." },
  { id: "Veilweaver", lore: "Threads the unseen between worlds." },
  { id: "Pulsewright", lore: "Shapes the living signal." },
  { id: "Nullseer", lore: "Reads the silence where others see static." },
  { id: "Chromeveil", lore: "Wears the mirror and walks unseen." },
];
const STATS = [
  { key: "vigor", label: "Vigor" },
  { key: "cognition", label: "Cognition" },
  { key: "pulse", label: "Pulse" },
  { key: "veil", label: "Veil" },
  { key: "signal", label: "Signal" },
];
const TOTAL = 25;
const MIN = 3;
const MAX = 10;

export default function CharacterCreation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [codename, setCodename] = useState("");
  const [vigilName, setVigilName] = useState("");
  const [archetype, setArchetype] = useState("Signalblade");
  const [stats, setStats] = useState({ vigor: 5, cognition: 5, pulse: 5, veil: 5, signal: 5 });
  const [creed, setCreed] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const used = Object.values(stats).reduce((a, b) => a + b, 0);
  const remaining = TOTAL - used;

  useEffect(() => {
    (async () => {
      try {
        const mine = await base44.entities.Character.filter({ created_by_id: user?.id }, "-created_date", 1);
        if (mine?.length) navigate("/transition", { replace: true });
      } catch {}
    })();
  }, [user, navigate]);

  const bump = (key, delta) => {
    setStats((prev) => {
      const next = { ...prev };
      const value = next[key] + delta;
      if (value < MIN || value > MAX) return prev;
      if (used + delta > TOTAL) return prev;
      next[key] = value;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codename.trim()) return setError("A codename is required.");
    if (remaining !== 0) return setError("Distribute all 25 points.");
    setSaving(true);
    try {
      await base44.entities.Character.create({ codename: codename.trim(), vigil_name: vigilName.trim(), archetype, ...stats, creed: creed.trim() });
      navigate("/transition");
    } catch (err) {
      setError(err.message || "Could not seal the sigil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1f] text-[#e6e6f0] font-mono relative">
      <HexaBackground density={40} />
      <form onSubmit={handleSubmit} className="relative z-10 max-w-xl mx-auto px-6 py-12 space-y-6">
        <p className="text-[#c300ff] text-[10px] tracking-[0.4em] uppercase">Forge</p>
        <input value={codename} onChange={(e) => setCodename(e.target.value)} maxLength={40} placeholder="Codename" className="w-full bg-black/60 border border-[#00f0ff]/30 px-3 py-2" required />
        <input value={vigilName} onChange={(e) => setVigilName(e.target.value)} placeholder="Vigil name" className="w-full bg-black/60 border border-[#00f0ff]/30 px-3 py-2" />
        <div className="space-y-2">
          {ARCHETYPES.map((a) => (
            <button type="button" key={a.id} onClick={() => setArchetype(a.id)} className={`w-full text-left p-3 border ${archetype === a.id ? "border-[#c300ff]" : "border-[#00f0ff]/20"}`}>
              <span className="text-[#00f0ff] text-xs tracking-[0.2em] uppercase">{a.id}</span>
              <p className="text-[11px] text-[#e6e6f0]/60 mt-1">{a.lore}</p>
            </button>
          ))}
        </div>
        <p className="text-xs tracking-[0.2em] uppercase text-[#ff00aa]">Points left: {remaining}</p>
        {STATS.map((s) => (
          <div key={s.key} className="flex items-center justify-between">
            <span className="text-xs tracking-[0.2em] uppercase">{s.label}</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => bump(s.key, -1)} className="px-2 border border-[#00f0ff]/30">-</button>
              <span>{stats[s.key]}</span>
              <button type="button" onClick={() => bump(s.key, 1)} className="px-2 border border-[#00f0ff]/30">+</button>
            </div>
          </div>
        ))}
        <input value={creed} onChange={(e) => setCreed(e.target.value)} placeholder="Creed" className="w-full bg-black/60 border border-[#00f0ff]/30 px-3 py-2" />
        {error && <p className="text-[#ff00aa] text-sm">{error}</p>}
        <button disabled={saving} className="w-full border border-[#00f0ff] text-[#00f0ff] py-3 tracking-[0.2em] uppercase">{saving ? "Sealing" : "Seal"}</button>
      </form>
    </div>
  );
}
