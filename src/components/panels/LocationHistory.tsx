import { useState, useEffect } from "react";
import { Clock, Trash2, Download, MapPin } from "lucide-react";

export interface HistoryEntry {
  id: string; timestamp: string; ip: string;
  city: string; country: string; countryCode: string;
  isp: string; threat: string; threatColor: string;
  lat: number; lon: number;
}

const STORAGE_KEY = "trackx_history";
const MAX_ENTRIES = 30;

export function saveToHistory(entry: Omit<HistoryEntry, "id" | "timestamp">) {
  try {
    const existing: HistoryEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
    const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch { return []; }
}

export function getHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

interface Props { refreshKey?: number; onSelect?: (e: HistoryEntry) => void; }

export function LocationHistory({ refreshKey, onSelect }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => { setEntries(getHistory()); }, [refreshKey]);

  const clearAll = () => { localStorage.removeItem(STORAGE_KEY); setEntries([]); };

  const exportCSV = () => {
    if (!entries.length) return;
    const header = "Timestamp,IP,Ville,Pays,ISP,Menace\n";
    const rows = entries.map(e => `"${e.timestamp}","${e.ip}","${e.city}","${e.country}","${e.isp}","${e.threat}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "trackx_history.csv"; a.click();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>
          {entries.length} / {MAX_ENTRIES} entrées
        </span>
        <div className="ml-auto flex gap-1.5">
          <button onClick={exportCSV} disabled={!entries.length} className="btn-outline-cyan" style={{ padding: "4px 8px", fontSize: "8px" }}>
            <Download className="w-2.5 h-2.5" /> CSV
          </button>
          <button onClick={clearAll} disabled={!entries.length}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all"
            style={{ border: "1px solid rgba(255,0,51,0.2)", color: "rgba(255,0,51,0.5)", background: "transparent", cursor: entries.length ? "pointer" : "not-allowed", fontFamily: "'Orbitron'", fontSize: "8px", fontWeight: 700, letterSpacing: "0.1em" }}>
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Header row */}
      {entries.length > 0 && (
        <div className="history-row" style={{ background: "rgba(255,255,255,0.02)" }}>
          {["Heure", "IP / Ville", "ISP", "Menace"].map(h => (
            <span key={h} style={{ fontFamily: "'Orbitron'", fontSize: "8px", fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>
      )}

      {/* Entries */}
      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
            <Clock className="w-6 h-6" style={{ color: "rgba(255,255,255,0.1)" }} />
            <p style={{ fontFamily: "'JetBrains Mono'", fontSize: "11px", color: "rgba(255,255,255,0.15)" }}>Aucune localisation effectuée</p>
          </div>
        ) : entries.map((e, i) => (
          <div key={e.id} className="history-row" onClick={() => onSelect?.(e)}
            style={{ animationDelay: `${i * 30}ms`, cursor: onSelect ? "pointer" : "default" }}>
            <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "rgba(255,255,255,0.25)" }}>{e.timestamp}</span>
            <div className="min-w-0">
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: "10px", color: "#00e5ff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.ip}</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "rgba(255,255,255,0.25)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {e.city}, {e.countryCode}
              </div>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "9px", color: "rgba(255,255,255,0.2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.isp.slice(0, 18)}</span>
            <span style={{ fontFamily: "'Orbitron'", fontSize: "8px", fontWeight: 700, color: e.threatColor, letterSpacing: "0.05em", flexShrink: 0 }}>{e.threat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
