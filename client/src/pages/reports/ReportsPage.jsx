import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api.js";

// ─── API ──────────────────────────────────────────────────────
const fetch = (ep) => () => api.get(ep).then(r => r.data.data);
const toNum = (v) => parseFloat(v) || 0;

const MONTHS_HE = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

// ─── Sections config ──────────────────────────────────────────
const SECTIONS = [
  {
    key: "sales", label: "מכירות", icon: "💰", endpoint: "/sales",
    columns: ["תאריך","לקוח","שם מטע","מטרה","דונמים","סה\"כ"],
    row: (r) => [r.date, r.clientName, r.name, r.purpose||"—", r.quantity||"—", `${toNum(r.totalAmount).toFixed(2)} ₪`],
  },
  {
    key: "expenses", label: "הוצאות", icon: "📦", endpoint: "/expenses",
    columns: ["תאריך","שם החומר","מחיר/יח׳","כמות","מע\"מ","סה\"כ"],
    row: (r, tax=17) => {
      const sub = toNum(r.totalAmount);
      const taxAmt = r.tax ? sub*(tax/100) : 0;
      return [r.date, r.name, `${toNum(r.number).toFixed(2)} ₪`, r.quantity, r.tax?`+${taxAmt.toFixed(2)} ₪`:"פטור", `${(sub+taxAmt).toFixed(2)} ₪`];
    },
  },
  {
    key: "clients", label: "לקוחות", icon: "👥", endpoint: "/clients",
    dateField: null,
    columns: ["שם לקוח","טלפון","כתובת","דונמים"],
    row: (r) => [r.clientName, r.phone||"—", r.address||"—", r.totalDunam||"—"],
  },
  {
    key: "bids", label: "הצעות מחיר", icon: "📋", endpoint: "/bids",
    columns: ["תאריך","לקוח","נושא","סטטוס","סה\"כ"],
    row: (r) => [r.date, r.clientName, r.target||"—", r.isApproved?"מאושר":"ממתין", `${toNum(r.totalAmount).toFixed(2)} ₪`],
  },
  {
    key: "personalSales", label: "הכנסות אישיות", icon: "💵", endpoint: "/personalSales",
    columns: ["תאריך","מטע","זנים","משקל","כמות","סה\"כ"],
    row: (r) => [r.date, r.name, r.strains||"—", r.weightType||"—", r.quantity||"—", `${toNum(r.totalAmount).toFixed(2)} ₪`],
  },
  {
    key: "personalWorkers", label: "עובדים", icon: "👷", endpoint: "/personalWorkers",
    columns: ["תאריך","עובד","מטע","יומית","סה\"כ"],
    row: (r) => [r.date, r.clientName, r.name, `${toNum(r.number).toFixed(2)} ₪`, `${toNum(r.totalAmount).toFixed(2)} ₪`],
  },
  {
    key: "personalRkrExpenses", label: "הוצאות רכר", icon: "🚜", endpoint: "/personalRkrExpenses",
    columns: ["תאריך","לקוח","מטע","עבודה","דונמים","עלות עבודה","סה\"כ"],
    row: (r) => [r.date, r.clientName, r.name, r.workKind||"—", r.quantity||"—", `${toNum(r.workPrice).toFixed(2)} ₪`, `${toNum(r.totalAmount).toFixed(2)} ₪`],
  },
  {
    key: "personalProductExpenses", label: "הוצאות מוצרים", icon: "📦", endpoint: "/personalProductExpenses",
    columns: ["תאריך","מוצר","כמות","מחיר","סה\"כ"],
    row: (r) => [r.date, r.name, r.quantity||"—", `${toNum(r.number).toFixed(2)} ₪`, `${toNum(r.totalAmount).toFixed(2)} ₪`],
  },
  {
    key: "personalInvestments", label: "השקעות", icon: "📈", endpoint: "/personalInvestments",
    columns: ["תאריך","השקעה","כמות","סכום","סה\"כ"],
    row: (r) => [r.date, r.name, r.quantity||"—", `${toNum(r.number).toFixed(2)} ₪`, `${toNum(r.totalAmount).toFixed(2)} ₪`],
  },
];

// ─── Styles ───────────────────────────────────────────────────
const s = {
  page:      { padding: "28px 32px", direction: "rtl" },
  title:     { fontSize: "20px", fontWeight: "600", color: "#1a1a1a", marginBottom: "4px" },
  sub:       { fontSize: "13px", color: "#a3a3a3", marginBottom: "24px" },
  controls:  { background: "#fff", borderRadius: "12px", border: "1px solid #f0f0ef", padding: "20px 24px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" },
  fg:        { display: "flex", flexDirection: "column", gap: "6px", minWidth: "160px" },
  label:     { fontSize: "12px", fontWeight: "500", color: "#6b7280" },
  select:    { padding: "9px 13px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", color: "#1a1a1a", outline: "none", background: "#fff", cursor: "pointer" },
  btnPrint:  { display: "flex", alignItems: "center", gap: "7px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", marginRight: "auto" },
  btnSecond: { display: "flex", alignItems: "center", gap: "7px", background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" },
  tabs:      { display: "flex", gap: "4px", marginBottom: "20px", flexWrap: "wrap" },
  tab:       { padding: "8px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#fff", fontSize: "12px", fontWeight: "500", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", color: "#6b7280" },
  tabActive: { background: "#f0fdf4", borderColor: "#86efac", color: "#16a34a", fontWeight: "600" },
  report:    { background: "#fff", borderRadius: "12px", border: "1px solid #f0f0ef", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  repHeader: { padding: "20px 24px", borderBottom: "1px solid #f0f0ef", display: "flex", justifyContent: "space-between", alignItems: "center" },
  repTitle:  { fontSize: "16px", fontWeight: "600", color: "#1a1a1a" },
  repMeta:   { fontSize: "12px", color: "#a3a3a3" },
  table:     { width: "100%", borderCollapse: "collapse" },
  th:        { padding: "11px 14px", fontSize: "11px", fontWeight: "600", color: "#a3a3a3", textAlign: "right", letterSpacing: "0.06em", borderBottom: "1px solid #f0f0ef", background: "#fafaf9", textTransform: "uppercase" },
  td:        { padding: "11px 14px", fontSize: "13px", color: "#374151", borderBottom: "1px solid #f9f9f8", textAlign: "right" },
  footer:    { padding: "14px 24px", background: "#f0fdf4", borderTop: "1px solid #86efac", display: "flex", justifyContent: "space-between", alignItems: "center" },
  footerTxt: { fontSize: "13px", color: "#15803d", fontWeight: "600" },
  empty:     { padding: "48px", textAlign: "center", color: "#a3a3a3", fontSize: "14px" },
};

// ─── Print styles (injected) ──────────────────────────────────
const PRINT_STYLE = `
  @media print {
    body * { visibility: hidden !important; }
    #print-area, #print-area * { visibility: visible !important; }
    #print-area { position: absolute; top: 0; right: 0; left: 0; direction: rtl; font-family: 'Heebo', sans-serif; }
    .no-print { display: none !important; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 12px; }
    th { background: #f5f5f5; font-weight: 600; }
    .print-header { margin-bottom: 20px; }
    .print-header h2 { font-size: 18px; margin: 0 0 4px; }
    .print-header p { font-size: 13px; color: #666; margin: 0; }
    .print-total { margin-top: 12px; font-weight: 600; font-size: 14px; text-align: left; }
  }
`;

// ─── Main ─────────────────────────────────────────────────────
export default function ReportsPage() {
  const now   = new Date();
  const [year,  setYear]    = useState(String(now.getFullYear()));
  const [month, setMonth]   = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [mode,  setMode]    = useState("month"); // month | year
  const [activeSection, setActiveSection] = useState("sales");
  const printRef = useRef(null);

  const { data: taxArr = [] } = useQuery({ queryKey: ["taxValues"], queryFn: fetch("/taxValues") });
  const maamValue = toNum(taxArr?.[0]?.maamValue) || 17;

  const section = SECTIONS.find(s => s.key === activeSection);

  const { data: rawData = [], isLoading } = useQuery({
    queryKey: [activeSection],
    queryFn: fetch(section.endpoint),
  });

  // Filter by date
  const filtered = useMemo(() => {
    if (section.dateField === null) return rawData; // clients — no date filter
    return rawData.filter(r => {
      const d = r.date || "";
      if (mode === "month") return d.startsWith(`${year}-${month}`);
      return d.startsWith(year);
    });
  }, [rawData, year, month, mode, section]);

  // Total
  const total = useMemo(() => filtered.reduce((a, r) => a + toNum(r.totalAmount), 0), [filtered]);

  // Years for dropdown
  const years = ["2023","2024","2025","2026","2027"];

  const periodLabel = mode === "month"
    ? `${MONTHS_HE[parseInt(month)-1]} ${year}`
    : `שנת ${year}`;

  const handlePrint = () => {
    const style = document.createElement("style");
    style.innerHTML = PRINT_STYLE;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.head.removeChild(style), 1000);
  };

  return (
    <div style={s.page} className="page-pad">
      <div style={s.title}>דוחות</div>
      <div style={s.sub}>סינון ויצוא נתונים לפי תקופה</div>

      {/* Controls */}
      <div style={s.controls} className="no-print">
        {/* Mode toggle */}
        <div style={s.fg}>
          <label style={s.label}>תקופה</label>
          <div style={{ display:"flex", background:"#f5f5f4", borderRadius:"8px", padding:"3px" }}>
            {[["month","חודשי"],["year","שנתי"]].map(([k,l]) => (
              <button key={k} onClick={() => setMode(k)} style={{
                flex:1, padding:"7px 12px", borderRadius:"6px", border:"none",
                fontSize:"13px", fontWeight: mode===k?"600":"400",
                background: mode===k?"#fff":"transparent",
                color: mode===k?"#16a34a":"#6b7280",
                cursor:"pointer", fontFamily:"inherit",
                boxShadow: mode===k?"0 1px 4px rgba(0,0,0,0.08)":"none",
                transition:"all 0.15s",
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Year */}
        <div style={s.fg}>
          <label style={s.label}>שנה</label>
          <select style={s.select} value={year} onChange={e => setYear(e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Month */}
        {mode === "month" && (
          <div style={s.fg}>
            <label style={s.label}>חודש</label>
            <select style={s.select} value={month} onChange={e => setMonth(e.target.value)}>
              {MONTHS_HE.map((m, i) => (
                <option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>
              ))}
            </select>
          </div>
        )}

        {/* Print button */}
        <button style={s.btnPrint} onClick={handlePrint}
          onMouseEnter={e=>e.currentTarget.style.background="#15803d"}
          onMouseLeave={e=>e.currentTarget.style.background="#16a34a"}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          הדפס / PDF
        </button>
      </div>

      {/* Section tabs */}
      <div style={s.tabs} className="no-print">
        {SECTIONS.map(sec => (
          <button key={sec.key}
            style={{ ...s.tab, ...(activeSection === sec.key ? s.tabActive : {}) }}
            onClick={() => setActiveSection(sec.key)}>
            {sec.icon} {sec.label}
          </button>
        ))}
      </div>

      {/* Report area */}
      <div id="print-area" ref={printRef}>
        {/* Print header */}
        <div className="print-header" style={{ display:"none" }}>
          <h2>ח.א חקלאות — {section?.label}</h2>
          <p>דוח {periodLabel} | {filtered.length} רשומות</p>
        </div>

        <div style={s.report}>
          <div style={s.repHeader}>
            <div>
              <div style={s.repTitle}>{section?.icon} {section?.label}</div>
              <div style={s.repMeta}>
                {periodLabel} &nbsp;·&nbsp; {filtered.length} רשומות
              </div>
            </div>
            <div style={{ fontSize:"22px", fontWeight:"700", color:"#16a34a" }}>
              {total > 0 ? `${total.toFixed(2)} ₪` : ""}
            </div>
          </div>

          {isLoading ? (
            <div style={s.empty}>טוען נתונים...</div>
          ) : filtered.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize:"28px", marginBottom:"10px" }}>📭</div>
              אין נתונים עבור {periodLabel}
            </div>
          ) : (
            <>
              <table style={s.table}>
                <thead>
                  <tr>
                    {section.columns.map(c => <th key={c} style={s.th}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r._id || i}
                      style={{ background: i%2===0?"#fff":"#fefefe" }}>
                      {section.row(r, maamValue).map((cell, j) => (
                        <td key={j} style={{
                          ...s.td,
                          fontWeight: j === section.columns.length-1 ? "600" : "400",
                          color: j === section.columns.length-1 ? "#16a34a" : "#374151",
                        }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {total > 0 && (
                <div style={s.footer}>
                  <div style={s.footerTxt}>
                    סה"כ {periodLabel}: {total.toFixed(2)} ₪
                  </div>
                  <div style={{ fontSize:"12px", color:"#a3a3a3" }}>
                    {filtered.length} רשומות
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
