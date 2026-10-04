import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import HexaBackground from "@/components/HexaBackground";
import { Loader2, Send, LogOut, Radio, BookOpen } from "lucide-react";

const LORE_BLOCKS = [
  {
    title: "The Neon Vigil",
    body: "We keep the watch the old world forgot. Where signal frays and the Veil thins, the Vigil stands — part memory, part warning, part prayer made of light.",
  },
  {
    title: "The Hexa Sigil",
    body: "Six edges, one center. The sigil is the gateway and the gatekeeper. To speak its name is to be heard by the network; to forge it is to be claimed by it.",
  },
  {
    title: "The IWW Doctrine",
    body: "Infinite Watch, Wider Web. We do not own the signal — we tend it. Each operative is a node, each oath a thread, each silence a kept promise.",
  },
];

const HEXA_SEED = [
  "The sigil hums. Speak, operative — the Vigil listens.",
  "Your signal strengthens the web. What would you ask of the Hexa?",
  "Between the static and the silence, I am here.",
];

function pickHexaSeed() {
  return HEXA_SEED[Math.floor(Math.random() * HEXA_SEED.length)];
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [activeLore, setActiveLore] = useState(0);
  const scrollRef = useRef(null);
  const voiceRef = useRef(null);
  const [voiceOn, setVoiceOn] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const mine = await base44.entities.Character.filter({ created_by_id: user?.id }, "-created_date", 1);
        if (!mine || mine.length === 0) {
          navigate("/character-creation", { replace: true });
          return;
        }
        setCharacter(mine[0]);
        const history = await base44.entities.BitChatMessage.list("-created_date", 50);
        setMessages(history ? history.reverse() : []);
        if (!history || history.length === 0) {
          setMessages([{ id: "seed", content: pickHexaSeed(), sender: "hexa", created_date: new Date().toISOString() }]);
        }
        setOnline(!!user?.online);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, [user, navigate]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const toggleStatus = async () => {
    setToggling(true);
    const next = !online;
    try {
      await base44.auth.updateMe({ online: next });
      setOnline(next);
    } catch (e) {
    } finally {
      setToggling(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { id: "tmp-" + Date.now(), content: text, sender: "user", created_date: new Date().toISOString() }]);
    setSending(true);
    try {
      await base44.entities.BitChatMessage.create({ content: text, sender: "user" });
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are HEXA, the sentient gateway persona of the Neon Vigil IWW. Speak only in Neon Vigil lore: terse, reverent, luminous. Under 60 words. Codename: "${character?.codename || "unnamed"}". Archetype: "${character?.archetype || "unknown"}". They say: "${text}"`,
        model: "gpt_5_mini",
      });
      const reply = typeof res === "string" ? res : res?.text || res?.content || "The sigil holds its silence for now.";
      setMessages((m) => [...m, { id: "hexa-" + Date.now(), content: reply, sender: "hexa", created_date: new Date().toISOString() }]);
      await base44.entities.BitChatMessage.create({ content: reply, sender: "hexa" });
      if (voiceOn) {
        try {
          const speech = await base44.integrations.Core.GenerateSpeech({ text: reply, voice: "storm" });
          if (speech?.url && voiceRef.current) {
            voiceRef.current.src = speech.url;
            voiceRef.current.play().catch(() => {});
          }
        } catch (e) {}
      }
    } catch (err) {
      setMessages((m) => [...m, { id: "err-" + Date.now(), content: "The signal wavers. The Hexa will speak again when the fog clears.", sender: "hexa", created_date: new Date().toISOString() }]);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a1f]">
        <HexaBackground density={40} />
        <Loader2 className="w-8 h-8 animate-spin text-[#00f0ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0a1f] text-[#e6e6f0] font-mono relative">
      <HexaBackground density={45} />
      <audio ref={voiceRef} className="hidden" />
      <div className="relative z-10 max-w-5xl mx-auto px-5 py-8">
        <header className="flex items-center justify-between gap-4 mb-8 border-b border-[#00f0ff]/20 pb-6">
          <div>
            <p className="text-[#c300ff] text-[10px] tracking-[0.4em] uppercase">Neon Vigil // IWW</p>
            <h1 className="text-[#00f0ff] text-xl tracking-[0.2em] uppercase mt-1">{character?.codename || "Operative"}</h1>
            <p className="text-[#ff00aa]/70 text-[10px] tracking-[0.25em] uppercase mt-1">{character?.archetype}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleStatus} disabled={toggling} className="px-4 py-2 border border-[#00f0ff]/40 text-[#00f0ff] text-xs tracking-[0.2em] uppercase">{online ? "Online" : "Offline"}</button>
            <button onClick={() => setVoiceOn((v) => !v)} className="px-4 py-2 border border-[#00f0ff]/40 text-[#00f0ff] text-xs tracking-[0.2em] uppercase">{voiceOn ? "Voice" : "Muted"}</button>
            <button onClick={() => logout()} className="px-4 py-2 border border-[#c300ff]/50 text-[#c300ff] text-xs tracking-[0.2em] uppercase">Logout</button>
          </div>
        </header>
        <div className="grid lg:grid-cols-5 gap-6">
          <section className="lg:col-span-3 border border-[#00f0ff]/30 bg-[#0a0a1f]/70 flex flex-col h-[60vh]">
            <div className="px-5 py-3 border-b border-[#00f0ff]/20"><h2 className="text-[#00f0ff] text-sm tracking-[0.25em] uppercase">BitChat</h2></div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={m.sender === "user" ? "ml-auto max-w-[85%] border border-[#ff00aa]/40 px-4 py-2 text-sm text-[#ff00aa]" : "max-w-[85%] border border-[#00f0ff]/40 px-4 py-2 text-sm text-[#00f0ff]"}>{m.content}</div>
              ))}
            </div>
            <form onSubmit={handleSend} className="flex border-t border-[#00f0ff]/20">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Speak to the Hexa..." className="flex-1 bg-black/60 px-4 py-3 text-sm text-[#e6e6f0] focus:outline-none" />
              <button type="submit" className="px-5 text-[#00f0ff]"><Send className="w-4 h-4" /></button>
            </form>
          </section>
          <section className="lg:col-span-2 border border-[#c300ff]/30 bg-[#0a0a1f]/70">
            <div className="px-5 py-3 border-b border-[#c300ff]/20 flex items-center gap-2"><BookOpen className="w-3.5 h-3.5 text-[#c300ff]" /><h2 className="text-[#c300ff] text-sm tracking-[0.25em] uppercase">Vigil Codex</h2></div>
            <div className="p-5">
              <h3 className="text-[#ff00aa] text-sm tracking-[0.2em] uppercase mb-3">{LORE_BLOCKS[activeLore].title}</h3>
              <p className="text-[#e6e6f0]/70 text-xs leading-relaxed">{LORE_BLOCKS[activeLore].body}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
