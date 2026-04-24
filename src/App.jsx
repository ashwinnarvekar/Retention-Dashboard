import { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const SHEET_ID = "1f27PdvxhDcJWYZjhqBD6UlFe9e5M4GuSiuZlvKXZgLg";
const SHEET_NAME = "Sheet1";
const API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

const COLORS = {
  "Delivery Concern": "#4F8EF7",
  "Usage Concern":    "#F59E0B",
  "Skin Concern":     "#A78BFA",
  "Other Concern":    "#34D399",
};

function parseSheetData(raw) {
  const json = JSON.parse(raw.replace(/^[^(]+\(/, '').replace(/\);?\s*$/, ''));
  const cols = json.table.cols.map(c => c.label);
  return json.table.rows.map(row => {
    const obj = {};
    row.c.forEach((cell, i) => {
      if (!cell) { obj[cols[i]] = null; return; }
      // For datetime, use the formatted string value (DD/MM/YYYY HH:MM:SS)
      obj[cols[i]] = (json.table.cols[i].type === 'datetime' && cell.f) ? cell.f : (cell.v !== undefined ? cell.v : null);
    });
    return obj;
  }).filter(r => r['Category']);
}

function parseDate(raw) {
  if (!raw) return null;
  const str = String(raw);
  // Google Sheets Date() format: Date(2026,3,6,12,41,51) month is 0-indexed
  const gMatch = str.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
  if (gMatch) return new Date(+gMatch[1], +gMatch[2], +gMatch[3], +gMatch[4], +gMatch[5], +gMatch[6]);
  // DD/MM/YYYY HH:MM:SS
  const dmyMatch = str.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (dmyMatch) return new Date(+dmyMatch[3], +dmyMatch[2]-1, +dmyMatch[1], +dmyMatch[4], +dmyMatch[5], +dmyMatch[6]);
  // ISO fallback
  const iso = new Date(str);
  return isNaN(iso) ? null : iso;
}

function fmtDay(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()} Apr`;
}

export default function App() {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");
  const [catFilter, setCatFilter] = useState("All");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const text = await res.text();
      const data = parseSheetData(text);
      const enriched = data.map(r => {
        const d = parseDate(r["Created At IST"]);
        return {
          ...r,
          parsedDate: d,
          dateStr: d ? d.toISOString().split("T")[0] : null,
          hour: d ? d.getHours() : null,
        };
      }).filter(r => r.dateStr);
      setRaw(enriched);
      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
      setError(null);
    } catch (e) {
      setError("Could not load data. Make sure the sheet is set to 'Anyone with link can view'.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const data = useMemo(() =>
    catFilter === "All" ? raw : raw.filter(r => r["Category"] === catFilter),
    [raw, catFilter]
  );

  const total = data.length;
  const solved = data.filter(r => r["Update"] === "Solved").length;
  const inProgress = data.filter(r => r["Update"] === "In-progress").length;
  const concernRaised = data.filter(r => r["Update"] === "Concern raised" || r["Update"] === "Concern Raised").length;
  const solveRate = total ? Math.round((solved / total) * 100) : 0;

  const dailyMap = {};
  data.forEach(r => {
    if (!r.dateStr) return;
    if (!dailyMap[r.dateStr]) dailyMap[r.dateStr] = { date: r.dateStr, Total: 0, Solved: 0, "In-progress": 0, "Concern Raised": 0 };
    dailyMap[r.dateStr].Total++;
    if (r["Update"] === "Solved") dailyMap[r.dateStr].Solved++;
    else if (r["Update"] === "In-progress") dailyMap[r.dateStr]["In-progress"]++;
    else if (r["Update"] === "Concern raised" || r["Update"] === "Concern Raised") dailyMap[r.dateStr]["Concern Raised"]++;
  });
  const dailyData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)).map(d => ({ ...d, label: fmtDay(d.date) }));

  const catMap = {};
  raw.forEach(r => { catMap[r["Category"]] = (catMap[r["Category"]] || 0) + 1; });
  const catData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  const catDayMap = {};
  data.forEach(r => {
    const label = fmtDay(r.dateStr);
    if (!catDayMap[label]) catDayMap[label] = { date: label };
    catDayMap[label][r["Category"]] = (catDayMap[label][r["Category"]] || 0) + 1;
  });
  const catDayData = Object.values(catDayMap);

  const hourMap = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
  data.forEach(r => { if (r.hour !== null) hourMap[r.hour].count++; });
  const maxHour = Math.max(...hourMap.map(h => h.count), 1);

  const phoneCount = {};
  raw.forEach(r => { if (r["Phone"]) phoneCount[r["Phone"]] = (phoneCount[r["Phone"]] || 0) + 1; });
  const repeats = Object.entries(phoneCount).filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]);


  // Unsolved aging
  const now = new Date();
  const unsolvedAging = raw
    .filter(r => r['Update'] === 'Concern raised' || r['Update'] === 'Concern Raised' || r['Update'] === 'In-progress')
    .map(r => {
      const created = parseDate(r['Created At IST'] || r['Created At']);
      const hoursAgo = created ? Math.floor((now - created) / (1000 * 60 * 60)) : null;
      const daysAgo = hoursAgo !== null ? Math.floor(hoursAgo / 24) : null;
      return { ...r, hoursAgo, daysAgo };
    })
    .filter(r => r.hoursAgo !== null)
    .sort((a, b) => b.hoursAgo - a.hoursAgo);

  // Weekly summary
  const startOfThisWeek = new Date(now); startOfThisWeek.setDate(now.getDate() - now.getDay());  startOfThisWeek.setHours(0,0,0,0);
  const startOfLastWeek = new Date(startOfThisWeek); startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
  const thisWeek = raw.filter(r => { const d = parseDate(r['Created At IST'] || r['Created At']); return d && d >= startOfThisWeek; });
  const lastWeek = raw.filter(r => { const d = parseDate(r['Created At IST'] || r['Created At']); return d && d >= startOfLastWeek && d < startOfThisWeek; });
  const weekStats = [
    { label: 'Total Conversations', tw: thisWeek.length, lw: lastWeek.length, color: '#4F8EF7' },
    { label: 'Solved', tw: thisWeek.filter(r => r['Update'] === 'Solved').length, lw: lastWeek.filter(r => r['Update'] === 'Solved').length, color: '#34D399' },
    { label: 'In-Progress', tw: thisWeek.filter(r => r['Update'] === 'In-progress').length, lw: lastWeek.filter(r => r['Update'] === 'In-progress').length, color: '#F59E0B' },
    { label: 'Concern Raised', tw: thisWeek.filter(r => r['Update'] === 'Concern raised' || r['Update'] === 'Concern Raised').length, lw: lastWeek.filter(r => r['Update'] === 'Concern raised' || r['Update'] === 'Concern Raised').length, color: '#F87171' },
    { label: 'Solve Rate', tw: thisWeek.length ? Math.round((thisWeek.filter(r => r['Update'] === 'Solved').length / thisWeek.length) * 100) : 0, lw: lastWeek.length ? Math.round((lastWeek.filter(r => r['Update'] === 'Solved').length / lastWeek.length) * 100) : 0, color: '#A78BFA', pct: true },
  ];

  const tabs = ["overview", "trends", "heatmap", "repeats", "aging", "weekly"];

  if (loading && raw.length === 0) return (
    <div style={{ background: "#080B14", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #1e2a4a", borderTop: "3px solid #4F8EF7", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ color: "#4F8EF7", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Loading live data...</div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#080B14", minHeight: "100vh", color: "#E2E8F0", padding: "20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card { background: #0F1420; border: 1px solid #1A2236; border-radius: 14px; padding: 20px; }
        .tab { cursor: pointer; padding: 7px 16px; border-radius: 8px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; transition: all 0.2s; border: none; background: transparent; color: #475569; }
        .tab.active { background: #4F8EF7; color: white; }
        .tab:hover:not(.active) { color: #94A3B8; background: #111827; }
        .kpi { background: #0F1420; border: 1px solid #1A2236; border-radius: 14px; padding: 20px 24px; position: relative; overflow: hidden; }
        .kpi::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--accent); }
        select { background: #0F1420; border: 1px solid #1A2236; color: #94A3B8; padding: 8px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; outline: none; font-family: 'DM Sans', sans-serif; }
        .heat-cell { border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 2px; transition: transform 0.15s; cursor: default; }
        .heat-cell:hover { transform: scale(1.12); z-index: 2; position: relative; }
        .rbtn { background: #111827; border: 1px solid #1A2236; color: #4F8EF7; padding: 7px 14px; border-radius: 8px; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 600; transition: all 0.2s; }
        .rbtn:hover { background: #4F8EF7; color: white; }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", color: "#F1F5F9" }}>Retention Dashboard</div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4, fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>
            ● LIVE · {raw.length} records{lastUpdated ? ` · synced ${lastUpdated}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option>All</option>
            <option>Delivery Concern</option>
            <option>Usage Concern</option>
            <option>Skin Concern</option>
            <option>Other Concern</option>
          </select>
          <button className="rbtn" onClick={fetchData}>↻ Refresh</button>
        </div>
      </div>

      {error && <div style={{ background: "#1a0a0a", border: "1px solid #7f1d1d", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#fca5a5", marginBottom: 16 }}>{error}</div>}

      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#0F1420", padding: 5, borderRadius: 10, width: "fit-content", border: "1px solid #1A2236" }}>
        {tabs.map(t => <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Conversations", val: total, accent: "#4F8EF7" },
          { label: "Solved", val: solved, accent: "#34D399" },
          { label: "In-Progress", val: inProgress, accent: "#F59E0B" },
          { label: "Concern Raised", val: concernRaised, accent: "#F87171" },
          { label: "Solve Rate", val: `${solveRate}%`, accent: "#A78BFA" },
        ].map(k => (
          <div key={k.label} className="kpi" style={{ "--accent": k.accent }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: k.accent, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{k.val}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#CBD5E1", marginTop: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>{k.label}</div>
          </div>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 800, color: "#CBD5E1", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Daily Volume</div>
            <ResponsiveContainer width="100%" height={185}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F8EF7" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4F8EF7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0F1420", border: "1px solid #1A2236", borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="Total" stroke="#4F8EF7" fill="url(#gT)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 800, color: "#CBD5E1", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Category Split</div>
            <ResponsiveContainer width="100%" height={185}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={48} outerRadius={74} dataKey="value" paddingAngle={3}>
                  {catData.map(e => <Cell key={e.name} fill={COLORS[e.name] || "#64748b"} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0F1420", border: "1px solid #1A2236", borderRadius: 8, fontSize: 11 }} />
                <Legend iconType="circle" iconSize={6} formatter={v => <span style={{ fontSize: 10, color: "#94A3B8" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#CBD5E1", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Solved vs In-Progress by Day</div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={dailyData} barSize={10}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0F1420", border: "1px solid #1A2236", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="Solved" fill="#34D399" radius={[3, 3, 0, 0]} />
                <Bar dataKey="In-progress" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Concern Raised" fill="#F87171" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "trends" && (
        <div style={{ display: "grid", gap: 14 }}>
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 800, color: "#CBD5E1", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Category Volume by Day</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catDayData} barSize={10}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0F1420", border: "1px solid #1A2236", borderRadius: 8, fontSize: 11 }} />
                <Legend iconType="circle" iconSize={6} formatter={v => <span style={{ fontSize: 10, color: "#94A3B8" }}>{v}</span>} />
                {Object.keys(COLORS).map(cat => <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[cat]} />)}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 800, color: "#CBD5E1", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Daily Solve Rate %</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={dailyData.map(d => ({ ...d, rate: d.Total ? Math.round((d.Solved / d.Total) * 100) : 0 }))}>
                <defs>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={v => [`${v}%`, "Solve Rate"]} contentStyle={{ background: "#0F1420", border: "1px solid #1A2236", borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="rate" stroke="#34D399" fill="url(#gR)" strokeWidth={2} dot={{ r: 3, fill: "#34D399" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "heatmap" && (
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 800, color: "#CBD5E1", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Contact Volume by Hour of Day</div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 20 }}>When do customers reach out most?</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 6 }}>
            {hourMap.map(h => {
              const intensity = h.count / maxHour;
              const bg = intensity === 0 ? "#111827" : `rgba(79,142,247,${0.1 + intensity * 0.9})`;
              return (
                <div key={h.hour} className="heat-cell" style={{ background: bg }} title={`${h.hour}:00 — ${h.count} contacts`}>
                  <div style={{ fontSize: 9, color: intensity > 0.4 ? "white" : "#334155" }}>{h.hour}h</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: intensity > 0.4 ? "white" : "#475569", fontFamily: "'DM Mono', monospace" }}>{h.count}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 20 }}>
            {[
              { label: "Peak Hour", val: `${hourMap.reduce((a, b) => a.count > b.count ? a : b).hour}:00` },
              { label: "After-hours contacts", val: hourMap.filter(h => h.hour >= 20 || h.hour < 6).reduce((s, h) => s + h.count, 0) },
              { label: "Total Hours Active", val: hourMap.filter(h => h.count > 0).length },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: "14px 18px" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#4F8EF7", fontFamily: "'DM Mono', monospace" }}>{s.val}</div>
                <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "repeats" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14 }}>
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 800, color: "#CBD5E1", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Repeat Contacts</div>
            <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 16 }}>Numbers that reached out more than once</div>
            {repeats.length === 0 && <div style={{ color: "#94A3B8", fontSize: 13 }}>No repeat contacts found.</div>}
            {repeats.slice(0, 12).map(([phone, count]) => (
              <div key={phone} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #111827" }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#94A3B8" }}>••••{phone.slice(-4)}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 80, height: 3, background: "#111827", borderRadius: 2 }}>
                    <div style={{ width: `${(count / (repeats[0]?.[1] || 1)) * 100}%`, height: "100%", background: "#4F8EF7", borderRadius: 2 }} />
                  </div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#4F8EF7", fontWeight: 700, width: 24, textAlign: "right" }}>{count}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 800, color: "#CBD5E1", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>Summary</div>
            {[
              { label: "Unique Callers", val: Object.keys(phoneCount).length, color: "#4F8EF7" },
              { label: "Repeat Callers", val: repeats.length, color: "#F59E0B" },
              { label: "Total Repeat Contacts", val: repeats.reduce((s, [, c]) => s + c, 0), color: "#A78BFA" },
              { label: "Max by 1 Person", val: repeats[0]?.[1] || 0, color: "#F87171" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #111827" }}>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: s.color, fontFamily: "'DM Mono', monospace" }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'aging' && (
        <div className='card'>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#CBD5E1', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Unsolved Aging Table</div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 20 }}>Oldest unresolved concerns at the top — nothing should fall through the cracks</div>
          {unsolvedAging.length === 0 && <div style={{ color: '#34D399', fontSize: 14, fontWeight: 600 }}>✓ All concerns resolved!</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 1.2fr 1fr 0.8fr', gap: 0 }}>
            {['Phone', 'Category', 'Date Raised', 'Status', 'Age'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 800, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 12px', borderBottom: '2px solid #1A2236' }}>{h}</div>
            ))}
            {unsolvedAging.map((r, i) => {
              const ageColor = r.hoursAgo > 48 ? '#F87171' : r.hoursAgo > 24 ? '#F59E0B' : '#34D399';
              const ageLabel = r.daysAgo >= 1 ? r.daysAgo + 'd ' + (r.hoursAgo % 24) + 'h' : r.hoursAgo + 'h';
              const statusColor = r['Update'] === 'In-progress' ? '#F59E0B' : '#F87171';
              const dateLabel = r['Created At IST'] ? String(r['Created At IST']).slice(0, 16) : '-';
              const phone = String(r['Phone'] || '').replace(/.0$/, '');
              return [
                <div key={'p'+i} style={{ padding: '12px 12px', borderBottom: '1px solid #111827', fontFamily: 'DM Mono, monospace', fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{phone}</div>,
                <div key={'c'+i} style={{ padding: '12px 12px', borderBottom: '1px solid #111827', fontSize: 13, fontWeight: 600, color: '#CBD5E1' }}>{r['Category']}</div>,
                <div key={'d'+i} style={{ padding: '12px 12px', borderBottom: '1px solid #111827', fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#94A3B8' }}>{dateLabel}</div>,
                <div key={'s'+i} style={{ padding: '12px 12px', borderBottom: '1px solid #111827' }}>
                  <span style={{ background: statusColor + '22', color: statusColor, padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{r['Update']}</span>
                </div>,
                <div key={'a'+i} style={{ padding: '12px 12px', borderBottom: '1px solid #111827', fontFamily: 'DM Mono, monospace', fontSize: 14, fontWeight: 800, color: ageColor }}>{ageLabel}</div>,
              ];
            })}
          </div>
        </div>
      )}

      {tab === 'weekly' && (
        <div style={{ display: 'grid', gap: 14 }}>
          <div className='card'>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#CBD5E1', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Weekly Summary</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 20 }}>This week vs last week</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 0 }}>
              {['Metric', 'This Week', 'Last Week', 'Change'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 800, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 12px', borderBottom: '2px solid #1A2236' }}>{h}</div>
              ))}
              {weekStats.map(s => {
                const diff = s.tw - s.lw;
                const pct = s.lw > 0 ? Math.round((diff / s.lw) * 100) : null;
                const isGood = s.label === 'Solve Rate' ? diff >= 0 : (s.label === 'Total Conversations' ? null : diff <= 0);
                const changeColor = isGood === null ? '#94A3B8' : isGood ? '#34D399' : '#F87171';
                const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';
                return [
                  <div key={'l'+s.label} style={{ padding: '14px 12px', borderBottom: '1px solid #0F1420', fontSize: 13, fontWeight: 600, color: s.color }}>{s.label}</div>,
                  <div key={'tw'+s.label} style={{ padding: '14px 12px', borderBottom: '1px solid #0F1420', fontFamily: 'DM Mono, monospace', fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>{s.tw}{s.pct ? '%' : ''}</div>,
                  <div key={'lw'+s.label} style={{ padding: '14px 12px', borderBottom: '1px solid #0F1420', fontFamily: 'DM Mono, monospace', fontSize: 18, fontWeight: 700, color: '#475569' }}>{s.lw}{s.pct ? '%' : ''}</div>,
                  <div key={'ch'+s.label} style={{ padding: '14px 12px', borderBottom: '1px solid #0F1420', fontFamily: 'DM Mono, monospace', fontSize: 14, fontWeight: 700, color: changeColor }}>{arrow} {Math.abs(diff)}{s.pct ? '%' : ''}{pct !== null ? ' (' + Math.abs(pct) + '%)' : ''}</div>,
                ];
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}