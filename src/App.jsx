import { useState, useEffect, useMemo, useRef } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const REVENUE_DATA = [
  { date: '01 Apr', Pooja: 0,        Neha: 7397,      Aasavari: 4644.67,  Mohini: 0,        Likitha: 0,        Kaushal: 4215.45  },
  { date: '02 Apr', Pooja: 8147.60,  Neha: 10592.70,  Aasavari: 4868.88,  Mohini: 0,        Likitha: 3082.19,  Kaushal: 2100.36  },
  { date: '03 Apr', Pooja: 1216,     Neha: 9860.60,   Aasavari: 917,      Mohini: 2473.85,  Likitha: 0,        Kaushal: 4435.37  },
  { date: '04 Apr', Pooja: 3528.07,  Neha: 9511.40,   Aasavari: 724,      Mohini: 4124.43,  Likitha: 1598.95,  Kaushal: 2748.71  },
  { date: '05 Apr', Pooja: 0,        Neha: 2149,      Aasavari: 0,        Mohini: 0,        Likitha: 0,        Kaushal: 0        },
  { date: '06 Apr', Pooja: 7385.12,  Neha: 10171.71,  Aasavari: 6908.95,  Mohini: 0,        Likitha: 1647.48,  Kaushal: 4361.45  },
  { date: '07 Apr', Pooja: 7750.95,  Neha: 6583.11,   Aasavari: 1371,     Mohini: 0,        Likitha: 1224.55,  Kaushal: 3723.75  },
  { date: '08 Apr', Pooja: 5448.89,  Neha: 9080.31,   Aasavari: 1672,     Mohini: 0,        Likitha: 3069.74,  Kaushal: 2359     },
  { date: '09 Apr', Pooja: 8884.30,  Neha: 12809.87,  Aasavari: 0,        Mohini: 0,        Likitha: 3713.84,  Kaushal: 3980.74  },
  { date: '10 Apr', Pooja: 6429.80,  Neha: 11190.22,  Aasavari: 8402.43,  Mohini: 1254,     Likitha: 0,        Kaushal: 3895.48  },
  { date: '11 Apr', Pooja: 7639.36,  Neha: 8772.29,   Aasavari: 4425.78,  Mohini: 0,        Likitha: 0,        Kaushal: 5131.48  },
  { date: '12 Apr', Pooja: 0,        Neha: 0,         Aasavari: 0,        Mohini: 0,        Likitha: 0,        Kaushal: 0        },
  { date: '13 Apr', Pooja: 11455.42, Neha: 10350.71,  Aasavari: 1758.10,  Mohini: 3316.85,  Likitha: 0,        Kaushal: 5668.07  },
  { date: '14 Apr', Pooja: 2092.75,  Neha: 11114.46,  Aasavari: 5447.26,  Mohini: 5415.35,  Likitha: 0,        Kaushal: 2192.15  },
  { date: '15 Apr', Pooja: 4966.12,  Neha: 11079.84,  Aasavari: 4971.51,  Mohini: 1211.25,  Likitha: 3054.35,  Kaushal: 9044.26  },
  { date: '16 Apr', Pooja: 12989.21, Neha: 7545.22,   Aasavari: 1573.29,  Mohini: 0,        Likitha: 2713.20,  Kaushal: 2154.35  },
  { date: '17 Apr', Pooja: 10796.37, Neha: 10793.90,  Aasavari: 2673.37,  Mohini: 0,        Likitha: 3764.42,  Kaushal: 3773.41  },
  { date: '18 Apr', Pooja: 8703.72,  Neha: 8989.29,   Aasavari: 0,        Mohini: 2489.10,  Likitha: 0,        Kaushal: 9223.14  },
  { date: '20 Apr', Pooja: 4000.48,  Neha: 11482.52,  Aasavari: 4180.86,  Mohini: 3582.78,  Likitha: 0,        Kaushal: 6571.87  },
  { date: '21 Apr', Pooja: 7749.33,  Neha: 11887.40,  Aasavari: 5397.52,  Mohini: 3648.11,  Likitha: 312.32,   Kaushal: 0        },
  { date: '22 Apr', Pooja: 380,      Neha: 7200.04,   Aasavari: 7965.19,  Mohini: 380,      Likitha: 0,        Kaushal: 3165.40  },
  { date: '23 Apr', Pooja: 6972.40,  Neha: 8892.69,   Aasavari: 1968,     Mohini: 805.60,   Likitha: 380,      Kaushal: 11093.59 },
  { date: '24 Apr', Pooja: 11861.15, Neha: 10475.26,  Aasavari: 8816.94,  Mohini: 0,        Likitha: 3384.98,  Kaushal: 8837.28  },
  { date: '25 Apr', Pooja: 7800.41,  Neha: 9571.83,   Aasavari: 1500.02,  Mohini: 2502.03,  Likitha: 0,        Kaushal: 6873.92  },
  { date: '26 Apr', Pooja: 0,         Neha: 0,          Aasavari: 4819.45,  Mohini: 0,        Likitha: 0,        Kaushal: 0        },
];

const COACHES = ['Pooja', 'Neha', 'Aasavari', 'Mohini', 'Likitha', 'Kaushal'];
const COACH_COLORS = { Pooja: '#4F8EF7', Neha: '#34D399', Aasavari: '#F59E0B', Mohini: '#A78BFA', Likitha: '#F87171', Kaushal: '#38BDF8' };
const DAILY_TEAM_TARGET = 44200;
const MONTHLY_TARGET = 1193400;
const SHEET_ID = "1f27PdvxhDcJWYZjhqBD6UlFe9e5M4GuSiuZlvKXZgLg";
const SHEET_NAME = "Sheet1";
const API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
const COLORS = { "Delivery Concern": "#4F8EF7", "Usage Concern": "#F59E0B", "Skin Concern": "#A78BFA", "Other Concern": "#34D399" };

const NAV = [
  { id: "overview", icon: "⊞", label: "Overview" },
  { id: "trends",   icon: "↗", label: "Trends" },
  { id: "heatmap",  icon: "▦", label: "Heatmap" },
  { id: "repeats",  icon: "↺", label: "Repeats" },
  { id: "aging",    icon: "⏳", label: "Aging" },
  { id: "weekly",   icon: "📅", label: "Weekly" },
  { id: "tat",      icon: "⏱", label: "TAT" },
  { id: "revenue",  icon: "₹", label: "Revenue" },
];

function parseSheetData(raw) {
  const json = JSON.parse(raw.replace(/^[^(]+\(/, '').replace(/\);?\s*$/, ''));
  const cols = json.table.cols.map(c => c.label);
  return json.table.rows.map(row => {
    const obj = {};
    row.c.forEach((cell, i) => {
      if (!cell) { obj[cols[i]] = null; return; }
      obj[cols[i]] = (json.table.cols[i].type === 'datetime' && cell.f) ? cell.f : (cell.v !== undefined ? cell.v : null);
    });
    return obj;
  }).filter(r => r['Category']);
}

function parseDate(raw) {
  if (!raw) return null;
  const str = String(raw);
  const gMatch = str.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
  if (gMatch) return new Date(+gMatch[1], +gMatch[2], +gMatch[3], +gMatch[4], +gMatch[5], +gMatch[6]);
  const dmyMatch = str.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (dmyMatch) return new Date(+dmyMatch[3], +dmyMatch[2]-1, +dmyMatch[1], +dmyMatch[4], +dmyMatch[5], +dmyMatch[6]);
  const iso = new Date(str);
  return isNaN(iso) ? null : iso;
}

function fmtDay(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()} Apr`;
}

function fmtMins(mins) {
  if (mins === null) return '-';
  if (mins < 60) return mins + 'm';
  if (mins < 1440) return Math.floor(mins/60) + 'h ' + (mins%60) + 'm';
  return Math.floor(mins/1440) + 'd ' + Math.floor((mins%1440)/60) + 'h';
}

const inr = (v) => '₹' + Math.round(v).toLocaleString('en-IN');

function AnimatedNumber({ value, duration = 1000 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const frameRef = useRef(null);
  const target = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const isPercent = String(value).includes('%');
  const prefix = String(value).includes('₹') ? '₹' : '';

  useEffect(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    startRef.current = null;
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * ease));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, duration]);

  const formatted = prefix
    ? prefix + Math.round(display).toLocaleString('en-IN')
    : display + (isPercent ? '%' : '');
  return <span>{formatted}</span>;
}

export default function App() {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");
  const [catFilter, setCatFilter] = useState("All");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dateRange, setDateRange] = useState("all");
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const bg = darkMode ? "#07090F" : "#F0F4FF";
  const cardBg = darkMode ? "#0D1117" : "#FFFFFF";
  const border = darkMode ? "#1C2333" : "#E2E8F0";
  const text = darkMode ? "#F1F5F9" : "#0F172A";
  const subtext = darkMode ? "#94A3B8" : "#64748B";
  const subtle = darkMode ? "#1C2333" : "#EEF2FF";

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const t = await res.text();
      const data = parseSheetData(t);
      const enriched = data.map(r => {
        const d = parseDate(r['Created At IST'] || r['Created At']);
        return { ...r, parsedDate: d, dateStr: d ? d.toISOString().split('T')[0] : null, hour: d ? d.getHours() : null };
      }).filter(r => r.dateStr);
      setRaw(enriched);
      setLastUpdated(new Date().toLocaleTimeString('en-IN'));
      setError(null);
    } catch (e) {
      setError("Could not load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getDateRangeFilter = (records) => {
    if (dateRange === 'all') return records;
    const now = new Date();
    const cutoff = new Date();
    if (dateRange === '7d') cutoff.setDate(now.getDate() - 7);
    else if (dateRange === '14d') cutoff.setDate(now.getDate() - 14);
    else if (dateRange === '30d') cutoff.setDate(now.getDate() - 30);
    else if (dateRange === 'thisweek') { cutoff.setDate(now.getDate() - now.getDay()); cutoff.setHours(0,0,0,0); }
    else if (dateRange === 'lastweek') {
      const s = new Date(now); s.setDate(now.getDate() - now.getDay() - 7); s.setHours(0,0,0,0);
      const e = new Date(s); e.setDate(s.getDate() + 7);
      return records.filter(r => r.parsedDate && r.parsedDate >= s && r.parsedDate < e);
    }
    return records.filter(r => r.parsedDate && r.parsedDate >= cutoff);
  };

  const data = useMemo(() =>
    getDateRangeFilter(catFilter === "All" ? raw : raw.filter(r => r["Category"] === catFilter)),
    [raw, catFilter, dateRange]
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

  const startOfThisWeek = new Date(now); startOfThisWeek.setDate(now.getDate() - now.getDay()); startOfThisWeek.setHours(0,0,0,0);
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

  const responseData = raw
    .filter(r => r['Responded At IST'] || r['Resolved At IST'])
    .map(r => {
      const created = parseDate(r['Created At IST'] || r['Created At']);
      const responded = parseDate(r['Responded At IST']);
      const resolved = parseDate(r['Resolved At IST']);
      const responseMinutes = created && responded ? Math.floor((responded - created) / 60000) : null;
      const resolutionMinutes = created && resolved ? Math.floor((resolved - created) / 60000) : null;
      return { ...r, responseMinutes, resolutionMinutes, responseFormatted: fmtMins(responseMinutes), resolutionFormatted: fmtMins(resolutionMinutes) };
    })
    .sort((a, b) => (b.parsedDate || 0) - (a.parsedDate || 0));

  const respondedRows = responseData.filter(r => r.responseMinutes !== null);
  const resolvedRows = responseData.filter(r => r.resolutionMinutes !== null);
  const avgResponseMins = respondedRows.length > 0 ? Math.round(respondedRows.reduce((s, r) => s + r.responseMinutes, 0) / respondedRows.length) : null;
  const avgResolutionMins = resolvedRows.length > 0 ? Math.round(resolvedRows.reduce((s, r) => s + r.resolutionMinutes, 0) / resolvedRows.length) : null;
  const slaBreaches = responseData.filter(r => (r.responseMinutes !== null && r.responseMinutes > 1440) || (r.resolutionMinutes !== null && r.resolutionMinutes > 1440));

  const tooltipStyle = { background: cardBg, border: `1px solid ${border}`, borderRadius: 8, fontSize: 11, color: text };

  if (loading && raw.length === 0) return (
    <div style={{ background: bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Raleway', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, border: `3px solid ${border}`, borderTop: "3px solid #4F8EF7", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ color: subtext, fontSize: 13, letterSpacing: "0.08em" }}>LOADING LIVE DATA</div>
      </div>
    </div>
  );

  const sidebarW = sidebarCollapsed ? 64 : 220;

  return (
    <div style={{ fontFamily: "'Raleway', sans-serif", background: bg, minHeight: "100vh", color: text, display: "flex", width: "100%", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes countUp { from { opacity:0; } to { opacity:1; } }
        .card { background: ${cardBg}; border: 1px solid ${border}; border-radius: 16px; padding: 20px; animation: fadeUp 0.4s ease both; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; cursor: pointer; transition: all 0.2s; border: none; background: transparent; color: ${subtext}; font-family: 'Raleway', sans-serif; font-size: 13px; font-weight: 600; width: 100%; text-align: left; white-space: nowrap; overflow: hidden; }
        .nav-item:hover { background: ${subtle}; color: ${text}; }
        .nav-item.active { background: #4F8EF7; color: white; }
        .nav-item .icon { font-size: 16px; min-width: 20px; text-align: center; }
        select { background: ${cardBg}; border: 1px solid ${border}; color: ${text}; padding: 7px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; outline: none; font-family: 'Raleway', sans-serif; }
        .rbtn { background: ${subtle}; border: 1px solid ${border}; color: #4F8EF7; padding: 7px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; font-family: 'Raleway', sans-serif; font-weight: 600; transition: all 0.2s; }
        .rbtn:hover { background: #4F8EF7; color: white; }
        .kpi { background: ${cardBg}; border: 1px solid ${border}; border-radius: 16px; padding: 20px 22px; position: relative; overflow: hidden; animation: fadeUp 0.4s ease both; transition: transform 0.2s, box-shadow 0.2s; }
        .kpi:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
        .kpi::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--accent); }
        .kpi::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; top: 0; background: radial-gradient(ellipse at top left, var(--accent-glow) 0%, transparent 60%); pointer-events: none; }
        .heat-cell { border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 2px; transition: transform 0.15s, box-shadow 0.15s; cursor: default; }
        .heat-cell:hover { transform: scale(1.15); z-index: 2; position: relative; box-shadow: 0 4px 12px rgba(79,142,247,0.3); }
        .toggle { width: 44px; height: 24px; border-radius: 12px; border: none; cursor: pointer; position: relative; transition: background 0.3s; padding: 0; }
        .toggle-knob { width: 18px; height: 18px; border-radius: 50%; background: white; position: absolute; top: 3px; transition: left 0.3s; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${border}; border-radius: 2px; }
        @media (max-width: 768px) { .sidebar { position: fixed !important; z-index: 100; height: 100vh; } .main-content { margin-left: 0 !important; } .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } .chart-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* SIDEBAR */}
      <div className="sidebar" style={{ width: sidebarW, minHeight: "100vh", background: cardBg, borderRight: `1px solid ${border}`, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4, position: "sticky", top: 0, height: "100vh", transition: "width 0.3s", overflow: "hidden", flexShrink: 0, overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingLeft: 4 }}>
          {!sidebarCollapsed && <div style={{ fontSize: 14, fontWeight: 800, color: text, letterSpacing: "0.12em", whiteSpace: "nowrap", textTransform: "uppercase" }}>CLINDERMA</div>}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: "none", border: "none", cursor: "pointer", color: subtext, fontSize: 18, padding: 4, marginLeft: sidebarCollapsed ? "auto" : 0 }}>
            {sidebarCollapsed ? "›" : "‹"}
          </button>
        </div>
        {NAV.map((n, i) => (
          <button key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)} style={{ animationDelay: `${i * 0.05}s` }}>
            <span className="icon">{n.icon}</span>
            {!sidebarCollapsed && <span>{n.label}</span>}
          </button>
        ))}
        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${border}` }}>
          {!sidebarCollapsed && <div style={{ fontSize: 10, color: subtext, marginBottom: 8, letterSpacing: "0.08em" }}>APPEARANCE</div>}
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 4 }}>
            <button className="toggle" style={{ background: darkMode ? "#4F8EF7" : "#CBD5E1" }} onClick={() => setDarkMode(!darkMode)}>
              <div className="toggle-knob" style={{ left: darkMode ? 23 : 3 }} />
            </button>
            {!sidebarCollapsed && <span style={{ fontSize: 11, color: subtext }}>{darkMode ? "Dark" : "Light"}</span>}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="main-content" style={{ flex: 1, padding: "20px 28px", overflowX: "hidden", minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.05em", color: text, fontFamily: "'Raleway', sans-serif" }}>
              {NAV.find(n => n.id === tab)?.label} {tab !== "revenue" && tab !== "tat" ? "Dashboard" : ""}
            </div>
            <div style={{ fontSize: 11, color: subtext, marginTop: 4, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" }}>
              ● LIVE · {raw.length} records{lastUpdated ? ` · synced ${lastUpdated}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {tab !== "revenue" && tab !== "tat" && (
              <select value={dateRange} onChange={e => setDateRange(e.target.value)}>
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="14d">Last 14 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="thisweek">This Week</option>
                <option value="lastweek">Last Week</option>
              </select>
            )}
            {tab !== "revenue" && tab !== "tat" && (
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                <option>All</option>
                <option>Delivery Concern</option>
                <option>Usage Concern</option>
                <option>Skin Concern</option>
                <option>Other Concern</option>
              </select>
            )}
            <button className="rbtn" onClick={fetchData}>↻ Refresh</button>
          </div>
        </div>

        {error && <div style={{ background: "#1a0a0a", border: "1px solid #7f1d1d", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#fca5a5", marginBottom: 16 }}>{error}</div>}

        {/* KPI Cards */}
        {tab !== "revenue" && tab !== "tat" && (
          <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Total", val: total, accent: "#4F8EF7", glow: "rgba(79,142,247,0.08)" },
              { label: "Solved", val: solved, accent: "#34D399", glow: "rgba(52,211,153,0.08)" },
              { label: "In-Progress", val: inProgress, accent: "#F59E0B", glow: "rgba(245,158,11,0.08)" },
              { label: "Concern Raised", val: concernRaised, accent: "#F87171", glow: "rgba(248,113,113,0.08)" },
              { label: "Solve Rate", val: `${solveRate}%`, accent: solveRate >= 90 ? "#34D399" : solveRate >= 80 ? "#F59E0B" : "#F87171", glow: "rgba(52,211,153,0.08)" },
            ].map((k, i) => (
              <div key={k.label} className="kpi" style={{ "--accent": k.accent, "--accent-glow": k.glow, animationDelay: `${i * 0.08}s` }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: k.accent, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                  <AnimatedNumber value={k.val} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: subtext, marginTop: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>{k.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div className="chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="card">
                <div style={{ fontSize: 11, fontWeight: 700, color: subtext, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Daily Volume</div>
                <ResponsiveContainer width="100%" height={190}>
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4F8EF7" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#4F8EF7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: subtext }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: subtext }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="Total" stroke="#4F8EF7" fill="url(#gT)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div style={{ fontSize: 11, fontWeight: 700, color: subtext, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Category Split</div>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                      {catData.map(e => <Cell key={e.name} fill={COLORS[e.name] || "#64748b"} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend iconType="circle" iconSize={6} formatter={v => <span style={{ fontSize: 10, color: subtext }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: subtext, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Solved vs In-Progress vs Concern Raised (Pending) by Day</div>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={dailyData} barSize={10}>
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: subtext }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: subtext }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="Solved" fill="#34D399" radius={[3,3,0,0]} />
                  <Bar dataKey="In-progress" fill="#F59E0B" radius={[3,3,0,0]} />
                  <Bar dataKey="Concern Raised" name="Concern Raised (Pending)" fill="#F87171" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TRENDS */}
        {tab === "trends" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: subtext, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Category Volume by Day</div>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={catDayData} barSize={10}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: subtext }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: subtext }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" iconSize={6} formatter={v => <span style={{ fontSize: 10, color: subtext }}>{v}</span>} />
                  {Object.keys(COLORS).map(cat => <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[cat]} />)}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: subtext, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Daily Solve Rate %</div>
              <ResponsiveContainer width="100%" height={170}>
                <AreaChart data={dailyData.map(d => ({ ...d, rate: d.Total ? Math.round((d.Solved / d.Total) * 100) : 0 }))}>
                  <defs>
                    <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34D399" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: subtext }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: subtext }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip formatter={v => [`${v}%`, "Solve Rate"]} contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="rate" stroke="#34D399" fill="url(#gR)" strokeWidth={2} dot={{ r: 3, fill: "#34D399" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* HEATMAP */}
        {tab === "heatmap" && (
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 700, color: subtext, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Contact Volume by Hour of Day</div>
            <div style={{ fontSize: 12, color: subtext, marginBottom: 20 }}>When do customers reach out most?</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 6 }}>
              {hourMap.map(h => {
                const intensity = h.count / maxHour;
                const bg2 = intensity === 0 ? subtle : `rgba(79,142,247,${0.1 + intensity * 0.9})`;
                return (
                  <div key={h.hour} className="heat-cell" style={{ background: bg2 }} title={`${h.hour}:00 — ${h.count} contacts`}>
                    <div style={{ fontSize: 9, color: intensity > 0.4 ? "white" : subtext }}>{h.hour}h</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: intensity > 0.4 ? "white" : text, fontFamily: "'JetBrains Mono', monospace" }}>{h.count}</div>
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
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#4F8EF7", fontFamily: "'JetBrains Mono', monospace" }}>{s.val}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: subtext, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPEATS */}
        {tab === "repeats" && (
          <div className="chart-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: subtext, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Repeat Contacts</div>
              <div style={{ fontSize: 12, color: subtext, marginBottom: 16 }}>Numbers that reached out more than once</div>
              {repeats.length === 0 && <div style={{ color: subtext, fontSize: 13 }}>No repeat contacts found.</div>}
              {repeats.slice(0, 12).map(([phone, count]) => (
                <div key={phone} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${border}` }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: text, fontWeight: 600 }}>{String(phone).replace(/\.0$/, '')}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 80, height: 3, background: subtle, borderRadius: 2 }}>
                      <div style={{ width: `${(count / (repeats[0]?.[1] || 1)) * 100}%`, height: "100%", background: "#4F8EF7", borderRadius: 2 }} />
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#4F8EF7", fontWeight: 700, width: 24, textAlign: "right" }}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: subtext, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>Summary</div>
              {[
                { label: "Unique Callers", val: Object.keys(phoneCount).length, color: "#4F8EF7" },
                { label: "Repeat Callers", val: repeats.length, color: "#F59E0B" },
                { label: "Total Repeat Contacts", val: repeats.reduce((s, [, c]) => s + c, 0), color: "#A78BFA" },
                { label: "Max by 1 Person", val: repeats[0]?.[1] || 0, color: "#F87171" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: subtext }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AGING */}
        {tab === "aging" && (
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 700, color: subtext, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Unsolved Aging Table</div>
            <div style={{ fontSize: 12, color: subtext, marginBottom: 20 }}>Oldest unresolved concerns at the top</div>
            {unsolvedAging.length === 0 && <div style={{ color: "#34D399", fontSize: 14, fontWeight: 600 }}>All concerns resolved!</div>}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 1.2fr 1fr 0.8fr", gap: 0 }}>
              {["Phone", "Category", "Date Raised", "Status", "Age"].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: subtext, textTransform: "uppercase", letterSpacing: "0.08em", padding: "10px 12px", borderBottom: `2px solid ${border}` }}>{h}</div>
              ))}
              {unsolvedAging.map((r, i) => {
                const ageColor = r.hoursAgo > 48 ? "#F87171" : r.hoursAgo > 24 ? "#F59E0B" : "#34D399";
                const ageLabel = r.daysAgo >= 1 ? `${r.daysAgo}d ${r.hoursAgo % 24}h` : `${r.hoursAgo}h`;
                const statusColor = r["Update"] === "In-progress" ? "#F59E0B" : "#F87171";
                const dateLabel = r["Created At IST"] ? String(r["Created At IST"]).slice(0, 16) : "-";
                const phone = String(r["Phone"] || "").replace(/\.0$/, "");
                return [
                  <div key={"p"+i} style={{ padding: "12px", borderBottom: `1px solid ${border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: text }}>{phone}</div>,
                  <div key={"c"+i} style={{ padding: "12px", borderBottom: `1px solid ${border}`, fontSize: 13, fontWeight: 600, color: text }}>{r["Category"]}</div>,
                  <div key={"d"+i} style={{ padding: "12px", borderBottom: `1px solid ${border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: subtext }}>{dateLabel}</div>,
                  <div key={"s"+i} style={{ padding: "12px", borderBottom: `1px solid ${border}` }}>
                    <span style={{ background: statusColor + "22", color: statusColor, padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{r["Update"]}</span>
                  </div>,
                  <div key={"a"+i} style={{ padding: "12px", borderBottom: `1px solid ${border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 800, color: ageColor }}>{ageLabel}</div>,
                ];
              })}
            </div>
          </div>
        )}

        {/* WEEKLY */}
        {tab === "weekly" && (
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 700, color: subtext, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Weekly Summary</div>
            <div style={{ fontSize: 12, color: subtext, marginBottom: 20 }}>This week vs last week</div>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 0 }}>
              {["Metric", "This Week", "Last Week", "Change"].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: subtext, textTransform: "uppercase", letterSpacing: "0.08em", padding: "10px 12px", borderBottom: `2px solid ${border}` }}>{h}</div>
              ))}
              {weekStats.map(s => {
                const diff = s.tw - s.lw;
                const pct = s.lw > 0 ? Math.round((diff / s.lw) * 100) : null;
                const isGood = s.label === "Solve Rate" ? diff >= 0 : s.label === "Total Conversations" ? null : diff <= 0;
                const changeColor = isGood === null ? subtext : isGood ? "#34D399" : "#F87171";
                const arrow = diff > 0 ? "↑" : diff < 0 ? "↓" : "→";
                return [
                  <div key={"l"+s.label} style={{ padding: "14px 12px", borderBottom: `1px solid ${border}`, fontSize: 13, fontWeight: 700, color: s.color }}>{s.label}</div>,
                  <div key={"tw"+s.label} style={{ padding: "14px 12px", borderBottom: `1px solid ${border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: text }}>{s.tw}{s.pct ? "%" : ""}</div>,
                  <div key={"lw"+s.label} style={{ padding: "14px 12px", borderBottom: `1px solid ${border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: subtext }}>{s.lw}{s.pct ? "%" : ""}</div>,
                  <div key={"ch"+s.label} style={{ padding: "14px 12px", borderBottom: `1px solid ${border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: changeColor }}>{arrow} {Math.abs(diff)}{s.pct ? "%" : ""}{pct !== null ? ` (${Math.abs(pct)}%)` : ""}</div>,
                ];
              })}
            </div>
          </div>
        )}

        {/* TAT */}
        {tab === "tat" && (
          <div style={{ display: "grid", gap: 16 }}>
            {responseData.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: 60 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>⏱️</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 8 }}>No TAT Data Yet</div>
                <div style={{ fontSize: 13, color: subtext, maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>Once the Apps Script is set up in your Google Sheet, response and resolution times will appear here automatically.</div>
              </div>
            ) : (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "Avg Response Time (In-progress)", val: fmtMins(avgResponseMins), color: "#4F8EF7", glow: "rgba(79,142,247,0.08)" },
                    { label: "Avg Resolution Time (Solved)", val: fmtMins(avgResolutionMins), color: "#34D399", glow: "rgba(52,211,153,0.08)" },
                    { label: "SLA Breaches (over 24h)", val: slaBreaches.length, color: slaBreaches.length > 0 ? "#F87171" : "#34D399", glow: "rgba(248,113,113,0.08)" },
                  ].map(k => (
                    <div key={k.label} className="kpi" style={{ "--accent": k.color, "--accent-glow": k.glow }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: k.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{k.val}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: subtext, marginTop: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>{k.label}</div>
                    </div>
                  ))}
                </div>
                <div className="chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div className="card">
                    <div style={{ fontSize: 11, fontWeight: 700, color: subtext, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Avg Response Time by Category</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={Object.entries(responseData.filter(r => r.responseMinutes !== null).reduce((acc, r) => { const cat = r["Category"].replace(" Concern",""); if (!acc[cat]) acc[cat] = {total:0,count:0}; acc[cat].total += r.responseMinutes; acc[cat].count++; return acc; }, {})).map(([cat,v]) => ({ cat, avg: Math.round(v.total/v.count) }))} barSize={32}>
                        <XAxis dataKey="cat" tick={{ fontSize: 10, fill: subtext }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: subtext }} axisLine={false} tickLine={false} tickFormatter={v => v < 60 ? v+"m" : Math.floor(v/60)+"h"} />
                        <Tooltip formatter={v => [v < 60 ? v+"m" : Math.floor(v/60)+"h "+(v%60)+"m", "Avg Response"]} contentStyle={tooltipStyle} />
                        <Bar dataKey="avg" fill="#4F8EF7" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="card">
                    <div style={{ fontSize: 11, fontWeight: 700, color: subtext, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Avg Resolution Time by Category</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={Object.entries(responseData.filter(r => r.resolutionMinutes !== null).reduce((acc, r) => { const cat = r["Category"].replace(" Concern",""); if (!acc[cat]) acc[cat] = {total:0,count:0}; acc[cat].total += r.resolutionMinutes; acc[cat].count++; return acc; }, {})).map(([cat,v]) => ({ cat, avg: Math.round(v.total/v.count) }))} barSize={32}>
                        <XAxis dataKey="cat" tick={{ fontSize: 10, fill: subtext }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: subtext }} axisLine={false} tickLine={false} tickFormatter={v => v < 60 ? v+"m" : Math.floor(v/60)+"h"} />
                        <Tooltip formatter={v => [v < 60 ? v+"m" : Math.floor(v/60)+"h "+(v%60)+"m", "Avg Resolution"]} contentStyle={tooltipStyle} />
                        <Bar dataKey="avg" fill="#34D399" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: 11, fontWeight: 700, color: subtext, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>Response and Resolution Timeline</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1.4fr 1fr 1fr", gap: 0 }}>
                    {["Phone", "Category", "Concern Raised At", "Response Time (In-progress)", "Resolved Time (Solved)"].map(h => (
                      <div key={h} style={{ fontSize: 10, fontWeight: 700, color: subtext, textTransform: "uppercase", letterSpacing: "0.06em", padding: "10px 12px", borderBottom: `2px solid ${border}` }}>{h}</div>
                    ))}
                    {responseData.slice(0, 50).map((r, i) => {
                      const rtColor = r.responseMinutes === null ? subtext : r.responseMinutes > 1440 ? "#F87171" : r.responseMinutes > 480 ? "#F59E0B" : "#34D399";
                      const rstColor = r.resolutionMinutes === null ? subtext : r.resolutionMinutes > 2880 ? "#F87171" : r.resolutionMinutes > 1440 ? "#F59E0B" : "#34D399";
                      return [
                        <div key={"p"+i} style={{ padding: "11px 12px", borderBottom: `1px solid ${border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: text }}>{String(r["Phone"] || "").replace(/\.0$/, "")}</div>,
                        <div key={"c"+i} style={{ padding: "11px 12px", borderBottom: `1px solid ${border}`, fontSize: 12, fontWeight: 600, color: text }}>{r["Category"]}</div>,
                        <div key={"d"+i} style={{ padding: "11px 12px", borderBottom: `1px solid ${border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: subtext }}>{String(r["Created At IST"] || "").slice(0, 16)}</div>,
                        <div key={"rt"+i} style={{ padding: "11px 12px", borderBottom: `1px solid ${border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: rtColor }}>{r.responseFormatted}</div>,
                        <div key={"rs"+i} style={{ padding: "11px 12px", borderBottom: `1px solid ${border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: rstColor }}>{r.resolutionFormatted}</div>,
                      ];
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REVENUE */}
        {tab === "revenue" && (() => {
          const revenueWithTotal = REVENUE_DATA.map(d => ({ ...d, total: COACHES.reduce((s, c) => s + (d[c] || 0), 0) }));
          const totalAchieved = revenueWithTotal.reduce((s, d) => s + d.total, 0);
          const monthlyPct = Math.round((totalAchieved / MONTHLY_TARGET) * 100);
          const today2 = new Date();
          const lastDay = new Date(today2.getFullYear(), today2.getMonth() + 1, 0);
          const daysLeft = lastDay.getDate() - today2.getDate();
          const neededPerDay = daysLeft > 0 ? (MONTHLY_TARGET - totalAchieved) / daysLeft : 0;
          const coachTotals = COACHES.map(coach => ({ name: coach, total: REVENUE_DATA.reduce((s, d) => s + (d[coach] || 0), 0), color: COACH_COLORS[coach] })).sort((a, b) => b.total - a.total);
          return (
            <div style={{ display: "grid", gap: 16 }}>
              <div className="card">
                <div style={{ fontSize: 11, fontWeight: 700, color: subtext, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>Monthly Progress — April 2026</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Monthly Target", val: inr(MONTHLY_TARGET), color: "#4F8EF7", glow: "rgba(79,142,247,0.08)" },
                    { label: "Achieved So Far", val: inr(totalAchieved), color: "#34D399", glow: "rgba(52,211,153,0.08)" },
                    { label: "Delta", val: inr(MONTHLY_TARGET - totalAchieved), color: "#F87171", glow: "rgba(248,113,113,0.08)" },
                    { label: "% Achieved", val: monthlyPct + "%", color: monthlyPct >= 80 ? "#34D399" : "#F59E0B", glow: "rgba(52,211,153,0.08)" },
                    { label: "Days Remaining", val: daysLeft, color: "#4F8EF7", glow: "rgba(79,142,247,0.08)" },
                    { label: "Needed Per Day", val: inr(neededPerDay), color: "#F59E0B", glow: "rgba(245,158,11,0.08)" },
                  ].map((k, i) => (
                    <div key={k.label} className="kpi" style={{ "--accent": k.color, "--accent-glow": k.glow, animationDelay: `${i * 0.06}s`, padding: "16px" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: k.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{k.val}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: subtext, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{k.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: subtext, marginBottom: 8, letterSpacing: "0.08em" }}>MONTHLY ACHIEVEMENT PROGRESS</div>
                <div style={{ background: subtle, borderRadius: 8, height: 20, overflow: "hidden", border: `1px solid ${border}` }}>
                  <div style={{ width: monthlyPct + "%", height: "100%", background: "linear-gradient(90deg, #4F8EF7, #34D399)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8, transition: "width 1s ease" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "white" }}>{monthlyPct}%</span>
                  </div>
                </div>
              </div>
              <div className="card">
                <div style={{ fontSize: 11, fontWeight: 700, color: subtext, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>Daily Team Revenue — Achieved vs Target ({inr(DAILY_TEAM_TARGET)})</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueWithTotal} barSize={14}>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: subtext }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: subtext }} axisLine={false} tickLine={false} tickFormatter={v => inr(v)} />
                    <Tooltip formatter={(v, n) => [inr(v), n]} contentStyle={tooltipStyle} />
                    <Bar dataKey="total" name="Achieved" fill="#4F8EF7" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div style={{ fontSize: 11, fontWeight: 700, color: subtext, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>Daily Revenue by Skin Coach</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={REVENUE_DATA} barSize={14}>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: subtext }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: subtext }} axisLine={false} tickLine={false} tickFormatter={v => inr(v)} />
                    <Tooltip formatter={(v, n) => [inr(v), n]} contentStyle={tooltipStyle} />
                    <Legend iconType="circle" iconSize={7} formatter={v => <span style={{ fontSize: 10, color: subtext }}>{v}</span>} />
                    {COACHES.map(coach => <Bar key={coach} dataKey={coach} stackId="a" fill={COACH_COLORS[coach]} />)}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div style={{ fontSize: 11, fontWeight: 700, color: subtext, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}>Coach Leaderboard — April Total</div>
                {coachTotals.map((coach, i) => (
                  <div key={coach.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${border}` }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: subtext, width: 20, fontFamily: "'JetBrains Mono', monospace" }}>#{i+1}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: text, width: 80 }}>{coach.name}</div>
                    <div style={{ flex: 1, background: subtle, borderRadius: 4, height: 8, overflow: "hidden" }}>
                      <div style={{ width: `${(coach.total / coachTotals[0].total * 100)}%`, height: "100%", background: coach.color, borderRadius: 4, transition: "width 1s ease" }} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: coach.color, fontFamily: "'JetBrains Mono', monospace", width: 120, textAlign: "right" }}>{inr(coach.total)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}