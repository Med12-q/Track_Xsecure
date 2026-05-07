import { useEffect, useState } from "react";

export type ThreatLevel = "FAIBLE" | "MOYEN" | "ÉLEVÉ" | "CRITIQUE";

export function getThreatLevel(proxy: boolean, hosting: boolean, mobile: boolean, vpnDetected?: boolean): ThreatLevel {
  if (vpnDetected || (proxy && hosting)) return "CRITIQUE";
  if (proxy) return "ÉLEVÉ";
  if (hosting) return "MOYEN";
  return "FAIBLE";
}

const LEVELS: Record<ThreatLevel, { pct: number; color: string; bg: string }> = {
  "FAIBLE":    { pct: 15,  color: "#00ff88", bg: "rgba(0,255,136,0.1)" },
  "MOYEN":     { pct: 45,  color: "#ffcc00", bg: "rgba(255,204,0,0.1)" },
  "ÉLEVÉ":     { pct: 72,  color: "#ff6600", bg: "rgba(255,102,0,0.1)" },
  "CRITIQUE":  { pct: 100, color: "#ff0033", bg: "rgba(255,0,51,0.12)" },
};

interface Props { level: ThreatLevel; animated?: boolean; compact?: boolean; }

export function ThreatMeter({ level, animated = true, compact }: Props) {
  const [displayPct, setDisplayPct] = useState(0);
  const target = LEVELS[level].pct;
  const { color, bg } = LEVELS[level];

  useEffect(() => {
    if (!animated) { setDisplayPct(target); return; }
    setDisplayPct(0);
    let cur = 0;
    const step = target / 40;
    const id = setInterval(() => {
      cur = Math.min(cur + step, target);
      setDisplayPct(Math.round(cur));
      if (cur >= target) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [level, target, animated]);

  if (compact) return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}`, animation: "pulse-dot 1.5s ease-in-out infinite" }} />
      <span style={{ fontFamily: "'Orbitron'", fontSize: "10px", fontWeight: 700, color, letterSpacing: "0.1em" }}>
        MENACE {level}
      </span>
    </div>
  );

  return (
    <div style={{ padding: "12px 14px" }}>
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontFamily: "'Orbitron'", fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          NIVEAU DE MENACE
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, animation: level === "CRITIQUE" ? "pulse-dot 0.8s ease-in-out infinite" : "pulse-dot 2s ease-in-out infinite" }} />
          <span style={{ fontFamily: "'Orbitron'", fontSize: "10px", fontWeight: 800, color, letterSpacing: "0.1em" }}>{level}</span>
        </div>
      </div>

      <div className="relative h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{ width: `${displayPct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, boxShadow: `0 0 8px ${color}66` }} />
      </div>

      <div className="flex justify-between mt-1.5">
        {["FAIBLE", "MOYEN", "ÉLEVÉ", "CRITIQUE"].map((l, i) => (
          <span key={l} style={{ fontFamily: "'Orbitron'", fontSize: "7px", color: l === level ? color : "rgba(255,255,255,0.1)", fontWeight: 700, letterSpacing: "0.05em" }}>{l}</span>
        ))}
      </div>
    </div>
  );
}
