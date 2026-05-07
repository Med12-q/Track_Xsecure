import { useState, useEffect } from "react";

export function LiveClock() {
  const [now, setNow] = useState(new Date());
  const [uptime, setUptime] = useState(0);
  const start = useState(() => Date.now())[0];

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
      setUptime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [start]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const h = pad(now.getHours()), m = pad(now.getMinutes()), s = pad(now.getSeconds());
  const date = now.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  const ut = `${pad(Math.floor(uptime / 3600))}:${pad(Math.floor((uptime % 3600) / 60))}:${pad(uptime % 60)}`;

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-baseline gap-0.5" style={{ fontFamily: "'Orbitron', monospace", fontSize: "18px", fontWeight: 900, letterSpacing: "0.04em", color: "#00e5ff", textShadow: "0 0 12px rgba(0,229,255,0.5)" }}>
        {h}<span style={{ color: "rgba(0,229,255,0.4)", animation: "pulse-dot 1s ease-in-out infinite" }}>:</span>{m}<span style={{ color: "rgba(0,229,255,0.4)", animation: "pulse-dot 1s ease-in-out infinite" }}>:</span>
        <span style={{ color: "#fff", fontSize: "14px" }}>{s}</span>
      </div>
      <div style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", marginTop: "1px" }}>{date}</div>
      <div style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "rgba(0,229,255,0.3)", letterSpacing: "0.08em" }}>
        UP {ut}
      </div>
    </div>
  );
}
