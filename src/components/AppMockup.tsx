import type { ReactNode } from "react";

// ─── Shared shell ─────────────────────────────────────────────────────────────

interface MockupWindowProps {
  title: string;
  children: ReactNode;
  dots?: boolean;
  accent?: string;
}

function MockupWindow({ title, children, dots = true, accent }: MockupWindowProps) {
  return (
    <div
      className="rounded-lg overflow-hidden select-none"
      style={{
        background: "#0d0e14",
        border: `1px solid ${accent ? `${accent}22` : "rgba(255,255,255,0.08)"}`,
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: "9px",
      }}
    >
      <div
        className="flex items-center gap-1.5 px-3 py-2 border-b"
        style={{
          background: "linear-gradient(180deg,#1a1b24 0%,#141520 100%)",
          borderColor: accent ? `${accent}18` : "rgba(255,255,255,0.05)",
        }}
      >
        {dots && (
          <>
            <div className="w-2 h-2 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="w-2 h-2 rounded-full" style={{ background: "#febc2e" }} />
            <div className="w-2 h-2 rounded-full" style={{ background: "#28c840" }} />
          </>
        )}
        <span
          className="ml-2 tracking-widest uppercase truncate"
          style={{ color: "rgba(255,255,255,0.22)", fontSize: "7.5px" }}
        >
          {title}
        </span>
      </div>
      <div style={{ height: "158px", overflow: "hidden" }}>{children}</div>
    </div>
  );
}

// ─── Arc gauge (SVG, 270° sweep) ─────────────────────────────────────────────

function ArcGauge({
  value,
  color,
  label,
  sub,
}: {
  value: number;
  color: string;
  label: string;
  sub: string;
}) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const arcLen = c * 0.75;
  const fillLen = (value / 100) * arcLen;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: 38, height: 38, margin: "0 auto" }}>
        <svg width="38" height="38" style={{ transform: "rotate(-225deg)" }}>
          <circle
            cx="19" cy="19" r={r}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="3"
            strokeDasharray={`${arcLen} ${c - arcLen}`}
            strokeLinecap="round"
          />
          <circle
            cx="19" cy="19" r={r}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${fillLen} ${c - fillLen}`}
            strokeLinecap="round"
          />
        </svg>
        <div
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            color, fontSize: 10, fontWeight: 800,
          }}
        >
          {value}
        </div>
      </div>
      <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 8, fontWeight: 700 }}>{label}</div>
      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 7 }}>{sub}</div>
    </div>
  );
}

// ─── Scan frame (replaces camera emoji) ──────────────────────────────────────

function ScanFrame({ color, label, sublabel }: { color: string; label: string; sublabel: string }) {
  type CornerStyle = {
    top?: number; bottom?: number; left?: number; right?: number;
    borderTop?: string; borderBottom?: string; borderLeft?: string; borderRight?: string;
  };
  const corners: CornerStyle[] = [
    { top: 4, left: 4, borderTop: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}` },
    { top: 4, right: 4, borderTop: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` },
    { bottom: 4, left: 4, borderBottom: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}` },
    { bottom: 4, right: 4, borderBottom: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` },
  ];
  return (
    <div
      style={{
        height: 62, position: "relative",
        background: `${color}06`, border: `1px dashed ${color}28`, borderRadius: 6,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 3,
      }}
    >
      {corners.map((s, i) => (
        <div key={i} style={{ position: "absolute", width: 9, height: 9, ...s }} />
      ))}
      <div style={{ width: 22, height: 15, background: `${color}12`, borderRadius: 3, border: `1px solid ${color}20` }} />
      <div style={{ width: "50%", height: 1, background: `${color}55` }} />
      <span style={{ color, fontSize: 7, fontWeight: 700, letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 6 }}>{sublabel}</span>
    </div>
  );
}

// ─── Individual mockups ───────────────────────────────────────────────────────

function FacilityBookingMockup() {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const times = ["0800", "1000", "1200", "1400"];
  const grid = [
    [1, 0, 1, 2, 0, 0],
    [0, 1, 0, 1, 1, 0],
    [1, 1, 0, 0, 2, 0],
    [0, 0, 1, 1, 0, 0],
  ];
  const bg = (v: number) => v === 1 ? "#4ea8de" : v === 2 ? "#f59e0b" : "rgba(255,255,255,0.05)";

  return (
    <MockupWindow title="Facility Booking · RSAF" accent="#4ea8de">
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#4ea8de", fontSize: 9, fontWeight: 700 }}>JUN 2026</span>
          <div style={{ display: "flex", gap: 4 }}>
            {[["HALL A", true], ["CONF B", false]].map(([r, active]) => (
              <span key={r as string} style={{ padding: "2px 6px", borderRadius: 3, background: active ? "rgba(78,168,222,0.2)" : "rgba(255,255,255,0.05)", color: active ? "#4ea8de" : "rgba(255,255,255,0.28)", fontSize: 7, fontWeight: 700 }}>{r as string}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 11 }}>
            {times.map((t) => (
              <div key={t} style={{ color: "rgba(255,255,255,0.2)", fontSize: 6, width: 26, textAlign: "right", height: 16, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{t}</div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${days.length},1fr)`, gap: 2, marginBottom: 2 }}>
              {days.map((d) => (
                <div key={d} style={{ textAlign: "center", color: "rgba(255,255,255,0.22)", fontSize: 6.5 }}>{d}</div>
              ))}
            </div>
            {grid.map((row, ri) => (
              <div key={ri} style={{ display: "grid", gridTemplateColumns: `repeat(${days.length},1fr)`, gap: 2, marginBottom: 2 }}>
                {row.map((v, ci) => (
                  <div key={ci} style={{ height: 16, background: bg(v), borderRadius: 2, opacity: v === 0 ? 0.4 : 1 }} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[["BOOKED", "#4ea8de"], ["PENDING", "#f59e0b"], ["FREE", "rgba(255,255,255,0.12)"]].map(([l, c]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 7, height: 7, background: c as string, borderRadius: 1 }} />
              <span style={{ color: "rgba(255,255,255,0.32)", fontSize: 6.5 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </MockupWindow>
  );
}

function NSRMockup() {
  const demands = [
    { id: "D-001", item: "Hydraulic Pump", status: "PENDING", color: "#f59e0b" },
    { id: "D-002", item: "Fuel Filter Unit", status: "APPROVED", color: "#22c55e" },
    { id: "D-003", item: "Engine Seal Kit", status: "DISPATCHED", color: "#4ea8de" },
    { id: "D-004", item: "Brake Assembly", status: "PENDING", color: "#f59e0b" },
  ];
  return (
    <MockupWindow title="NSR Command Center" accent="#4ea8de">
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
          {[["TOTAL", "8", "#4ea8de"], ["PENDING", "3", "#f59e0b"], ["DONE", "5", "#22c55e"]].map(([l, v, c]) => (
            <div key={l} style={{ textAlign: "center", padding: "5px 4px", background: `${c}0c`, borderRadius: 4 }}>
              <div style={{ color: c as string, fontSize: 14, fontWeight: 800, lineHeight: 1 }}>{v}</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 6.5, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
        {demands.map((d) => (
          <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px", background: "rgba(255,255,255,0.04)", borderRadius: 4 }}>
            <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 8, minWidth: 32 }}>{d.id}</span>
            <span style={{ color: "rgba(255,255,255,0.72)", fontSize: 8, flex: 1, marginLeft: 6 }}>{d.item}</span>
            <span style={{ background: `${d.color}1a`, color: d.color, fontSize: 7, fontWeight: 700, padding: "2px 6px", borderRadius: 3 }}>{d.status}</span>
          </div>
        ))}
      </div>
    </MockupWindow>
  );
}

function FuelUpMockup() {
  return (
    <MockupWindow title="Fuel Up! · Receipt Reader" accent="#f59e0b">
      <div style={{ padding: "10px 12px", display: "flex", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
          <ScanFrame color="#f59e0b" label="GEMINI AI OCR" sublabel="AUTO-EXTRACT" />
          <div style={{ display: "flex", gap: 4 }}>
            {["AVIATION", "VEHICLE"].map((t, i) => (
              <span key={t} style={{ flex: 1, textAlign: "center", padding: "3px 0", borderRadius: 3, background: i === 0 ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.05)", color: i === 0 ? "#f59e0b" : "rgba(255,255,255,0.28)", fontSize: 6.5, fontWeight: 700 }}>{t}</span>
            ))}
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 3, height: 4, overflow: "hidden" }}>
            <div style={{ width: "75%", height: "100%", background: "#f59e0b", borderRadius: 3 }} />
          </div>
          <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 7 }}>4 / 6 fields complete</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 86 }}>
          {[["INVOICE #", "INV-3001"], ["DATE", "14 Jun 2026"], ["QTY", "400 L"], ["CARD #", "···· 4821"]].map(([l, v]) => (
            <div key={l}>
              <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 6.5 }}>{l}</div>
              <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 8, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </MockupWindow>
  );
}

function InvoiceScannerMockup() {
  return (
    <MockupWindow title="Invoice Scanner · Power Apps" accent="#8b5cf6">
      <div style={{ padding: "10px 12px", display: "flex", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 80, background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.18)", borderRadius: 6, padding: "8px" }}>
          <span style={{ color: "#8b5cf6", fontSize: 7, fontWeight: 700, letterSpacing: "0.06em" }}>INVOICE</span>
          <div style={{ height: 1, background: "rgba(139,92,246,0.2)" }} />
          {["ABC CORP", "INV-20260601", "3 Line Items", "SGD 4,320.00"].map((l) => (
            <div key={l} style={{ height: 12, background: "rgba(255,255,255,0.05)", borderRadius: 2, display: "flex", alignItems: "center", paddingLeft: 4 }}>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 6 }}>{l}</span>
            </div>
          ))}
          <div style={{ marginTop: "auto", background: "rgba(139,92,246,0.22)", color: "#a78bfa", fontSize: 7, fontWeight: 700, padding: "3px 0", textAlign: "center", borderRadius: 3 }}>SCANNED</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          {[["SUPPLIER", "ABC Corp Pte Ltd", "rgba(255,255,255,0.82)"], ["TOTAL", "$4,320.00", "rgba(255,255,255,0.82)"], ["STATUS", "PENDING ACO", "#f59e0b"]].map(([l, v, c]) => (
            <div key={l}>
              <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 6.5 }}>{l}</div>
              <div style={{ color: c as string, fontSize: 8, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 4, marginTop: "auto" }}>
            <button style={{ flex: 1, padding: "4px 0", background: "rgba(34,197,94,0.18)", color: "#22c55e", fontSize: 7, fontWeight: 700, borderRadius: 3, border: "none", cursor: "pointer" }}>APPROVE</button>
            <button style={{ flex: 1, padding: "4px 0", background: "rgba(239,68,68,0.18)", color: "#ef4444", fontSize: 7, fontWeight: 700, borderRadius: 3, border: "none", cursor: "pointer" }}>REJECT</button>
          </div>
        </div>
      </div>
    </MockupWindow>
  );
}

function VehicleLogbookMockup() {
  const odoStart = 45144, odoCurr = 45231, odoService = 45500;
  const pct = ((odoCurr - odoStart) / (odoService - odoStart)) * 100;
  return (
    <MockupWindow title="RSAF Vehicle Logbook" accent="#22c55e">
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#22c55e", fontSize: 9, fontWeight: 700 }}>SFA 1234 A</div>
            <div style={{ color: "rgba(255,255,255,0.32)", fontSize: 7 }}>AIR SPECIALIST VEHICLE</div>
          </div>
          <span style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", fontSize: 7, fontWeight: 700, padding: "3px 8px", borderRadius: 3, display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />ACTIVE
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: "6px 0", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {[["DRIVER", "CPL TAN WEI"], ["UNIT", "11X SQN"], ["PREV ODO", `${odoStart.toLocaleString()} km`], ["CURR ODO", `${odoCurr.toLocaleString()} km`]].map(([l, v]) => (
            <div key={l}>
              <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 6.5 }}>{l}</div>
              <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 8, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 6.5 }}>NEXT SERVICE</span>
            <span style={{ color: "#22c55e", fontSize: 6.5 }}>{odoService.toLocaleString()} km</span>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#22c55e,#4ea8de)", borderRadius: 2 }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {[["START TRIP", "#22c55e"], ["INSPECTION", "#4ea8de"], ["MAINT.", "#f59e0b"]].map(([l, c]) => (
            <div key={l} style={{ flex: 1, textAlign: "center", padding: "4px 0", background: `${c}14`, color: c as string, fontSize: 6.5, fontWeight: 700, borderRadius: 3 }}>{l}</div>
          ))}
        </div>
      </div>
    </MockupWindow>
  );
}

function MAVISMockup() {
  const severities = [
    { label: "LOW", count: 2, max: 12, color: "#22c55e" },
    { label: "MED", count: 4, max: 12, color: "#f59e0b" },
    { label: "HIGH", count: 3, max: 12, color: "#f97316" },
    { label: "CRIT", count: 1, max: 12, color: "#ef4444" },
  ];
  return (
    <MockupWindow title="MAVIS · Maintenance System" accent="#ef4444">
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
          {[["ACTIVE", "4", "#ef4444"], ["PENDING", "2", "#f59e0b"], ["RESOLVED", "12", "#22c55e"]].map(([l, n, c]) => (
            <div key={l} style={{ textAlign: "center", padding: "5px 4px", background: `${c}10`, borderRadius: 4 }}>
              <div style={{ color: c as string, fontSize: 14, fontWeight: 800, lineHeight: 1 }}>{n}</div>
              <div style={{ color: "rgba(255,255,255,0.32)", fontSize: 6.5, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8 }}>
          <div style={{ color: "rgba(255,255,255,0.32)", fontSize: 7, marginBottom: 6 }}>SEVERITY BREAKDOWN</div>
          {severities.map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
              <span style={{ color: s.color, fontSize: 7, fontWeight: 700, width: 24 }}>{s.label}</span>
              <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(s.count / s.max) * 100}%`, background: s.color, borderRadius: 2 }} />
              </div>
              <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 7, width: 8 }}>{s.count}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {[["PREVENTIVE", "#6366f1"], ["WORKSHOP", "#4ea8de"]].map(([l, c]) => (
            <div key={l} style={{ flex: 1, textAlign: "center", padding: "4px 0", background: `${c}14`, color: c as string, fontSize: 7, fontWeight: 700, borderRadius: 3 }}>{l}</div>
          ))}
        </div>
      </div>
    </MockupWindow>
  );
}

function BootcampMockup() {
  return (
    <MockupWindow title="Power Platform Bootcamp" accent="#6366f1">
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ width: 78, borderRight: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.15)", padding: "10px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ color: "#6366f1", fontSize: 7, fontWeight: 700, marginBottom: 4, letterSpacing: "0.08em" }}>CONTENTS</div>
          {["1. Intro", "2. Canvas Apps", "3. Controls", "4. Data Sources", "5. Quiz"].map((item, i) => (
            <div key={item} style={{ padding: "2px 6px", borderRadius: 3, background: i === 2 ? "rgba(99,102,241,0.18)" : "transparent", color: i === 2 ? "#818cf8" : "rgba(255,255,255,0.28)", fontSize: 7.5, borderLeft: i === 2 ? "2px solid #6366f1" : "2px solid transparent" }}>{item}</div>
          ))}
        </div>
        <div style={{ flex: 1, padding: "10px 10px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 7 }}>SLIDE 3 / 24</div>
            <div style={{ color: "rgba(255,255,255,0.88)", fontSize: 9.5, fontWeight: 700, marginTop: 4, lineHeight: 1.3 }}>Understanding<br />Controls & Properties</div>
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
              {[70, 45, 58].map((w, i) => <div key={i} style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, width: `${w}%` }} />)}
            </div>
            <div style={{ color: "#818cf8", fontSize: 7, marginTop: 6 }}>Interactive exercise ↓</div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 6.5 }}>PROGRESS</span>
              <span style={{ color: "#6366f1", fontSize: 6.5 }}>34%</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: "34%", height: "100%", background: "#6366f1", borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </div>
    </MockupWindow>
  );
}

function SimplyClikMockup() {
  const steps = [
    { label: "Launch Edge browser", status: "done" },
    { label: "Navigate to portal", status: "done" },
    { label: "Fill submission form", status: "running" },
    { label: "Upload attachment", status: "waiting" },
    { label: "Submit & confirm", status: "waiting" },
  ];
  const clr = (s: string) => s === "done" ? "#22c55e" : s === "running" ? "#f59e0b" : "rgba(255,255,255,0.14)";

  return (
    <MockupWindow title="Simply Clik · RPA Console" accent="#a78bfa">
      <div style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {["BROWSER", "DESKTOP", "AI AGENT"].map((m) => (
              <span key={m} style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa", fontSize: 6.5, fontWeight: 700, padding: "2px 6px", borderRadius: 3 }}>{m}</span>
            ))}
          </div>
          <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#22c55e", fontSize: 7 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />LIVE
          </span>
        </div>
        {steps.map((step, i) => (
          <div key={step.label} style={{ display: "flex", alignItems: "stretch", gap: 6 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 14, flexShrink: 0 }}>
              <div style={{ width: 13, height: 13, borderRadius: "50%", flexShrink: 0, background: step.status === "waiting" ? "transparent" : clr(step.status), border: `1.5px solid ${clr(step.status)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#0d0e14", fontSize: 7, fontWeight: 800, lineHeight: 1 }}>
                  {step.status === "done" ? "✓" : step.status === "running" ? "▶" : ""}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: 1, flex: 1, minHeight: 5, background: i < 2 ? "rgba(34,197,94,0.28)" : "rgba(255,255,255,0.07)", margin: "1px 0" }} />
              )}
            </div>
            <div style={{ flex: 1, padding: "1px 6px", color: step.status === "done" ? "rgba(255,255,255,0.28)" : step.status === "running" ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.22)", fontSize: 7.5, lineHeight: 1.65, background: step.status === "running" ? "rgba(245,158,11,0.06)" : "transparent", borderRadius: 3, marginBottom: 2 }}>
              {step.label}
            </div>
          </div>
        ))}
      </div>
    </MockupWindow>
  );
}

function PowerCodexMockup() {
  const codeLines = [
    { ln: 1, text: "import React from 'react';", color: "#a78bfa" },
    { ln: 2, text: "import { PCFHost } from", color: "#4ea8de" },
    { ln: 3, text: "  '@microsoft/pcf-react';", color: "rgba(255,255,255,0.5)" },
    { ln: 4, text: "", color: "" },
    { ln: 5, text: "export const App = () => {", color: "#22d3ee" },
    { ln: 6, text: "  return <PCFHost />;", color: "rgba(255,255,255,0.6)" },
    { ln: 7, text: "};", color: "#22d3ee" },
  ];
  return (
    <MockupWindow title="PowerCodex · PCF Scaffold" accent="#10b981">
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ width: 70, borderRight: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.18)", padding: "10px 8px", display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ color: "#10b981", fontSize: 7, fontWeight: 700, marginBottom: 4 }}>SRC /</div>
          {[{ name: "App.tsx", active: true }, { name: "spec/", active: false }, { name: "openspec/", active: false }, { name: "hooks/", active: false }, { name: "components/", active: false }].map((f) => (
            <div key={f.name} style={{ color: f.active ? "#e2e8f0" : "rgba(255,255,255,0.28)", fontSize: 7, padding: "1.5px 4px", background: f.active ? "rgba(16,185,129,0.12)" : "transparent", borderRadius: 2 }}>{f.name}</div>
          ))}
        </div>
        <div style={{ flex: 1, padding: "10px 10px", display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 7, marginBottom: 5 }}>APP.TSX</div>
          {codeLines.map((l) => (
            <div key={l.ln} style={{ display: "flex", gap: 6, alignItems: "baseline", lineHeight: 1.6 }}>
              <span style={{ color: "rgba(255,255,255,0.1)", fontSize: 6.5, userSelect: "none", width: 10, textAlign: "right", flexShrink: 0 }}>{l.text ? l.ln : ""}</span>
              <span style={{ color: l.color, fontSize: 7.5 }}>{l.text}</span>
            </div>
          ))}
          <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 6, display: "flex", gap: 4 }}>
            {[["✓ SPEC", "#10b981"], ["✓ TYPES", "#10b981"], ["✓ TESTS", "#10b981"]].map(([l, c]) => (
              <span key={l} style={{ background: `${c}14`, color: c as string, fontSize: 6.5, fontWeight: 700, padding: "2px 6px", borderRadius: 3 }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </MockupWindow>
  );
}

function PCMonitorMockup() {
  const metrics = [
    { label: "CPU", value: 62, sub: "72°C", color: "#f59e0b" },
    { label: "RAM", value: 47, sub: "8.2 GB", color: "#4ea8de" },
    { label: "GPU", value: 83, sub: "68°C", color: "#ef4444" },
  ];
  return (
    <MockupWindow title="VitalsDash · PC Monitor" accent="#4ea8de">
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.32)", fontSize: 7 }}>SYSTEM VITALS</span>
          <span style={{ background: "rgba(78,168,222,0.12)", color: "#4ea8de", fontSize: 6.5, padding: "2px 6px", borderRadius: 3 }}>■ OVERLAY MODE</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {metrics.map((m) => <ArcGauge key={m.label} value={m.value} color={m.color} label={m.label} sub={m.sub} />)}
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg,#22c55e 0%,#f59e0b 55%,#ef4444 100%)", borderRadius: 2 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 6.5 }}>UPTIME: 14:22:01</span>
          <span style={{ color: "#22c55e", fontSize: 6.5 }}>NPU: 12%</span>
        </div>
      </div>
    </MockupWindow>
  );
}

function SBOMMockup() {
  const deps = [
    { name: "lodash", version: "4.17.20", risk: "LOW", score: 15, color: "#22c55e" },
    { name: "axios", version: "0.21.1", risk: "HIGH", score: 85, color: "#ef4444" },
    { name: "react", version: "18.2.0", risk: "LOW", score: 8, color: "#22c55e" },
    { name: "moment", version: "2.29.4", risk: "MED", score: 42, color: "#f59e0b" },
  ];
  return (
    <MockupWindow title="Software Bill of Materials" accent="#f59e0b">
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#f59e0b", fontSize: 8, fontWeight: 700 }}>SBOM REPORT</span>
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 7 }}>v1.0 · CycloneDX</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[["1 HIGH", "#ef4444"], ["1 MED", "#f59e0b"], ["2 LOW", "#22c55e"]].map(([l, c]) => (
            <span key={l} style={{ background: `${c}14`, color: c as string, fontSize: 7, fontWeight: 700, padding: "2px 7px", borderRadius: 3 }}>{l}</span>
          ))}
        </div>
        {deps.map((dep) => (
          <div key={dep.name} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 4, padding: "5px 8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 8 }}>{dep.name}</span>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 7 }}>{dep.version}</span>
                <span style={{ background: `${dep.color}1a`, color: dep.color, fontSize: 7, fontWeight: 700, padding: "1px 5px", borderRadius: 3 }}>{dep.risk}</span>
              </div>
            </div>
            <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${dep.score}%`, background: dep.color, borderRadius: 1 }} />
            </div>
          </div>
        ))}
      </div>
    </MockupWindow>
  );
}

function PawPantryMockup() {
  return (
    <MockupWindow title="Local Paw Pantry · Android" accent="#ec4899">
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(236,72,153,0.18)", border: "1px solid rgba(236,72,153,0.28)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#ec4899", fontSize: 9, fontWeight: 800 }}>P</span>
          </div>
          <div>
            <div style={{ color: "#ec4899", fontSize: 9, fontWeight: 700 }}>LOCAL PAW PANTRY</div>
            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 6.5 }}>FULLY OFFLINE · LOCAL ONLY</div>
          </div>
        </div>
        {[
          { name: "Whiskas Cat Food", date: "14 Jun", qty: "80g" },
          { name: "Pedigree Dog Treats", date: "12 Jun", qty: "50g" },
          { name: "RC Indoor Kibble", date: "10 Jun", qty: "120g" },
          { name: "Fancy Feast Wet", date: "08 Jun", qty: "85g" },
        ].map((item) => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", background: "rgba(236,72,153,0.05)", border: "1px solid rgba(236,72,153,0.1)", borderRadius: 4 }}>
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 7.5 }}>{item.name}</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ color: "#ec4899", fontSize: 7, fontWeight: 600 }}>{item.qty}</span>
              <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 7 }}>{item.date}</span>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 5 }}>
          {[["+ ADD ENTRY", "#ec4899"], ["↓ EXPORT CSV", "#4ea8de"]].map(([l, c]) => (
            <div key={l} style={{ flex: 1, textAlign: "center", padding: "4px 0", background: `${c}14`, color: c as string, fontSize: 7, fontWeight: 700, borderRadius: 3 }}>{l}</div>
          ))}
        </div>
      </div>
    </MockupWindow>
  );
}

function AutoCommitMockup() {
  const lines = [
    { prompt: "$", text: " npx auto-github-commit", color: "#4ea8de" },
    { prompt: ">", text: " Watching: ./my-project", color: "rgba(255,255,255,0.42)" },
    { prompt: ">", text: " Change detected: App.tsx", color: "#f59e0b" },
    { prompt: ">", text: " git add . && git commit", color: "rgba(255,255,255,0.42)" },
    { prompt: " ", text: " 'auto: save 14:32:01'", color: "rgba(255,255,255,0.28)" },
    { prompt: ">", text: " git push origin main", color: "rgba(255,255,255,0.42)" },
    { prompt: "✓", text: " Pushed 2s ago — watching...", color: "#22c55e" },
  ];
  return (
    <MockupWindow title="Auto GitHub Commit · Terminal" accent="#22c55e">
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 3, background: "#0a0b10", height: "100%" }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 2, fontSize: 7.5, lineHeight: 1.5, fontFamily: '"JetBrains Mono", monospace' }}>
            <span style={{ color: i === 0 ? "#4ea8de" : i === lines.length - 1 ? "#22c55e" : "rgba(255,255,255,0.16)", fontWeight: 700, width: 10, flexShrink: 0 }}>{line.prompt}</span>
            <span style={{ color: line.color }}>{line.text}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 3 }}>
          <span style={{ color: "rgba(255,255,255,0.16)", fontSize: 7.5 }}>$</span>
          <span style={{ display: "inline-block", width: 5, height: 10, background: "#4ea8de", borderRadius: 1, opacity: 0.8 }} />
        </div>
      </div>
    </MockupWindow>
  );
}

function PowerPlatformMockup() {
  return (
    <MockupWindow title="Power Platform App" accent="#4ea8de">
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
          {[
            { label: "Records", value: "1,240", color: "#4ea8de", change: "+12%" },
            { label: "Active Users", value: "36", color: "#22c55e", change: "+4" },
            { label: "Automations", value: "8", color: "#a78bfa", change: "LIVE" },
            { label: "Uptime", value: "99.9%", color: "#f59e0b", change: "30d" },
          ].map((stat) => (
            <div key={stat.label} style={{ padding: "6px 8px", background: `${stat.color}0c`, border: `1px solid ${stat.color}18`, borderRadius: 5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ color: stat.color, fontSize: 14, fontWeight: 800, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ color: stat.color, fontSize: 6.5, background: `${stat.color}1a`, padding: "1px 4px", borderRadius: 2 }}>{stat.change}</div>
              </div>
              <div style={{ color: "rgba(255,255,255,0.32)", fontSize: 7, marginTop: 3 }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["POWER APPS", "DATAVERSE", "AUTOMATE"].map((t) => (
            <div key={t} style={{ flex: 1, textAlign: "center", padding: "4px 0", background: "rgba(78,168,222,0.08)", color: "#4ea8de", fontSize: 6, fontWeight: 700, borderRadius: 3 }}>{t}</div>
          ))}
        </div>
      </div>
    </MockupWindow>
  );
}

function CompetitionMockup() {
  return (
    <MockupWindow title="Achievements · Singapore" accent="#f59e0b">
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 6, padding: "8px 10px" }}>
          <div style={{ color: "rgba(255,255,255,0.32)", fontSize: 7, letterSpacing: "0.1em" }}>NATIONAL ACHIEVEMENT</div>
          <div style={{ color: "#f59e0b", fontSize: 15, fontWeight: 800, marginTop: 1, lineHeight: 1 }}>1ST PLACE</div>
          <div style={{ color: "rgba(255,255,255,0.52)", fontSize: 7.5, marginTop: 3 }}>Innovation & Technology Category</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
          {[["RANK", "#1", "#f59e0b"], ["SCORE", "98.4", "#22c55e"], ["TEAMS", "47+", "#4ea8de"]].map(([l, v, c]) => (
            <div key={l} style={{ textAlign: "center", padding: "5px 4px", background: "rgba(255,255,255,0.03)", borderRadius: 4 }}>
              <div style={{ color: c as string, fontSize: 13, fontWeight: 800, lineHeight: 1 }}>{v}</div>
              <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 6.5, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {[["CYBERSEC", "#ef4444"], ["AI / ML", "#6366f1"], ["INNOVATION", "#f59e0b"]].map(([l, c]) => (
            <span key={l} style={{ background: `${c}14`, border: `1px solid ${c}28`, color: c as string, fontSize: 6.5, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>{l}</span>
          ))}
        </div>
      </div>
    </MockupWindow>
  );
}

function AerospaceMockup() {
  const modules = [
    { name: "Aircraft Structures", done: true },
    { name: "Riveting & Fasteners", done: true },
    { name: "Composite Materials", done: true },
    { name: "Soldering Techniques", done: false },
    { name: "Final Assessment", done: false },
  ];
  return (
    <MockupWindow title="Aerospace Training · Lufthansa" accent="#4ea8de">
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#4ea8de", fontSize: 8, fontWeight: 700 }}>LTT CERTIFICATION</span>
          <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 7 }}>3 / 5 COMPLETE</span>
        </div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg,#4ea8de,#22c55e)", borderRadius: 2 }} />
        </div>
        {modules.map((m) => (
          <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 6px", background: m.done ? "rgba(34,197,94,0.05)" : "rgba(255,255,255,0.02)", borderRadius: 4 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0, background: m.done ? "#22c55e" : "rgba(255,255,255,0.08)", border: `1.5px solid ${m.done ? "#22c55e" : "rgba(255,255,255,0.14)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {m.done && <span style={{ color: "#0d0e14", fontSize: 7, fontWeight: 800 }}>✓</span>}
            </div>
            <span style={{ color: m.done ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.82)", fontSize: 7.5 }}>{m.name}</span>
          </div>
        ))}
      </div>
    </MockupWindow>
  );
}

function DefaultMockup() {
  return (
    <MockupWindow title="Project Preview">
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
        {[80, 60, 90, 45, 70].map((w, i) => (
          <div key={i} style={{ height: 7, borderRadius: 3, width: `${w}%`, background: `rgba(78,168,222,${0.1 + i * 0.05})` }} />
        ))}
      </div>
    </MockupWindow>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

interface AppMockupProps {
  mockupType?: string;
}

export function AppMockup({ mockupType }: AppMockupProps) {
  switch (mockupType) {
    case "facility-booking": return <FacilityBookingMockup />;
    case "nsr": return <NSRMockup />;
    case "fuel-up": return <FuelUpMockup />;
    case "invoice-scanner": return <InvoiceScannerMockup />;
    case "vehicle-logbook": return <VehicleLogbookMockup />;
    case "mavis": return <MAVISMockup />;
    case "bootcamp": return <BootcampMockup />;
    case "simply-clik": return <SimplyClikMockup />;
    case "powercodex": return <PowerCodexMockup />;
    case "pc-monitor": return <PCMonitorMockup />;
    case "sbom": return <SBOMMockup />;
    case "paw-pantry": return <PawPantryMockup />;
    case "auto-commit": return <AutoCommitMockup />;
    case "power-platform": return <PowerPlatformMockup />;
    case "competition": return <CompetitionMockup />;
    case "aerospace": return <AerospaceMockup />;
    default: return <DefaultMockup />;
  }
}
