import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api.js";

const fetchData = (ep) => () => api.get(ep).then(r => r.data.data);
const toNum = (v) => parseFloat(v) || 0;
const fmt   = (n) => toNum(n).toFixed(2);

const MONTHS_HE = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

const SECTIONS = [
  {
    key: "sales", label: "הכנסות", icon: "💰", endpoint: "/sales",
    columns: ["תאריך","לקוח","שם מטע","מטרה","דונמים",'סה"כ'],
    row: (r) => [r.date, r.clientName, r.name, r.purpose||"—", r.quantity||"—", `${fmt(r.totalAmount)} ₪`],
    hasDetail: true, hasClient: true,
  },
  {
    key: "expenses", label: "הוצאות", icon: "📦", endpoint: "/expenses",
    columns: ["תאריך","שם החומר","מחיר/יח׳","כמות",'סה"כ'],
    row: (r) => [r.date, r.name, `${fmt(r.number)} ₪`, r.quantity, `${fmt(r.totalAmount)} ₪`],
  },
  {
    key: "clients", label: "לקוחות", icon: "👥", endpoint: "/clients",
    dateField: null,
    columns: ["שם לקוח","טלפון","כתובת","דונמים"],
    row: (r) => [r.clientName, r.phone||"—", r.address||"—", r.totalDunam||"—"],
  },
  {
    key: "bids", label: "הצעות מחיר", icon: "📋", endpoint: "/bids",
    columns: ["תאריך","לקוח","נושא","סטטוס",'סה"כ'],
    row: (r) => [r.date, r.clientName, r.target||"—", r.isApproved?"מאושר":"ממתין", `${fmt(r.totalAmount)} ₪`],
    hasClient: true,
  },
  {
    key: "personalSales", label: "הכנסות אישיות", icon: "💵", endpoint: "/personalSales",
    columns: ["תאריך","מטע","זנים","משקל","כמות",'סה"כ'],
    row: (r) => [r.date, r.name, r.strains||"—", r.weightType||"—", r.quantity||"—", `${fmt(r.totalAmount)} ₪`],
  },
  {
    key: "personalWorkers", label: "עובדים", icon: "👷", endpoint: "/personalWorkers",
    columns: ["תאריך","עובד","מטע","יומית",'סה"כ'],
    row: (r) => [r.date, r.clientName, r.name, `${fmt(r.number)} ₪`, `${fmt(r.totalAmount)} ₪`],
    hasClient: true,
  },
  {
    key: "personalRkrExpenses", label: "ריסוס-קיסוח-ריסוק", icon: "🚜", endpoint: "/personalRkrExpenses",
    columns: ["תאריך","מטע","עבודה","דונמים","עלות עבודה",'סה"כ'],
    row: (r) => [r.date, r.name, r.workKind||"—", r.quantity||"—", `${fmt(r.workPrice)} ₪`, `${fmt(r.totalAmount)} ₪`],
  },
  {
    key: "personalProductExpenses", label: "הוצאות מוצרים", icon: "📦", endpoint: "/personalProductExpenses",
    columns: ["תאריך","מוצר","כמות","מחיר",'סה"כ'],
    row: (r) => [r.date, r.name, r.quantity||"—", `${fmt(r.number)} ₪`, `${fmt(r.totalAmount)} ₪`],
  },
  {
    key: "personalInvestments", label: "השקעות", icon: "📈", endpoint: "/personalInvestments",
    columns: ["תאריך","השקעה","כמות","סכום",'סה"כ'],
    row: (r) => [r.date, r.name, r.quantity||"—", `${fmt(r.number)} ₪`, `${fmt(r.totalAmount)} ₪`],
  },
];

// ─── Sale Detail Row (compact) ───────────────────────────────
function SaleDetailRow({ sale, colCount, tractorPriceFromSettings }) {
  const products   = sale.product || [];
  const quantities = sale.quantitiesOfProduct || {};
  const prices     = sale.pricesOfProducts || {};
  const dunam      = toNum(sale.quantity);

  // סעיר טרקטור — מהגדרות × דונמים
  const tractorPrice = toNum(tractorPriceFromSettings);
  const tractorTotal = parseFloat((dunam * tractorPrice).toFixed(2));
  const materialsTotal = Object.values(prices).reduce((a,v) => a + toNum(v), 0);

  if (products.length === 0 && tractorTotal === 0) return null;

  // Build compact string
  const parts = [];

  if (products.length > 0) {
    const matStr = products.map(prod => {
      const qty   = toNum(quantities[prod]);
      const price = toNum(prices[prod]);
      return `${prod} ${qty}ל׳ (${fmt(price)}₪)`;
    }).join(" | ");
    parts.push(`🧪 ${matStr}`);
  }

  if (tractorTotal > 0) {
    parts.push(`🚜 ${dunam}ד׳ × ${fmt(tractorPrice)}₪ = ${fmt(tractorTotal)}₪`);
  }

  return (
    <tr className="detail-row">
      <td colSpan={colCount} style={{
        padding: "0 14px 10px 14px",
        background: "#fff9f0",
        borderBottom: "1px solid #fde8c8",
        borderRight: "3px solid #f97316",
      }}>
        <div style={{
          fontSize: "11px",
          color: "#92400e",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          padding: "6px 10px",
          direction: "rtl",
        }}>
          <span style={{ fontSize:"10px", fontWeight:"600", color:"#f97316", letterSpacing:"0.05em" }}>
            חישוב מפורט:
          </span>
          {parts.map((p, i) => (
            <span key={i} style={{ color:"#78350f" }}>{p}</span>
          ))}
          <span style={{ marginRight:"auto", fontWeight:"700", color:"#ea580c" }}>
            = {fmt(sale.totalAmount)} ₪
          </span>
        </div>
      </td>
    </tr>
  );
}

const s = {
  page:      { padding: "28px 32px", direction: "rtl" },
  title:     { fontSize: "20px", fontWeight: "600", color: "#1a1a1a", marginBottom: "4px" },
  sub:       { fontSize: "13px", color: "#a3a3a3", marginBottom: "24px" },
  controls:  { background: "#fff", borderRadius: "12px", border: "1px solid #f0f0ef", padding: "20px 24px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" },
  fg:        { display: "flex", flexDirection: "column", gap: "6px", minWidth: "160px" },
  label:     { fontSize: "12px", fontWeight: "500", color: "#6b7280" },
  select:    { padding: "9px 13px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", color: "#1a1a1a", outline: "none", background: "#fff", cursor: "pointer" },
  btnPrint:  { display: "flex", alignItems: "center", gap: "7px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", marginRight: "auto" },
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

const PRINT_STYLE = `
  @media print {
    @page {
      size: A4 portrait;
      margin: 10mm 8mm;
    }

    body * { visibility: hidden !important; }
    #print-area, #print-area * { visibility: visible !important; }
    .no-print { display: none !important; }
    .print-doc-header { display: none !important; }
    .print-footer      { display: none !important; }

    #print-area {
      position: fixed;
      top: 0; right: 0; left: 0;
      direction: rtl;
      font-family: 'Heebo', 'Arial Hebrew', Arial, sans-serif;
      color: #1a1a1a;
    }

    /* ── Table ── */
    table {
      width: 100% !important;
      min-width: 100% !important;
      border-collapse: collapse !important;
      font-size: 11px;
      table-layout: fixed !important;
    }

    thead th:nth-child(1) { width: 13% !important; }
    thead th:nth-child(2) { width: 20% !important; }
    thead th:nth-child(3) { width: 20% !important; }
    thead th:nth-child(4) { width: 20% !important; }
    thead th:nth-child(5) { width: 10% !important; }
    thead th:nth-child(6) { width: 17% !important; }

    thead th {
      background: #f0fdf4 !important;
      color: #15803d !important;
      font-weight: 600;
      padding: 9px 8px;
      text-align: right;
      border-top: 2px solid #86efac;
      border-bottom: 2px solid #86efac;
      overflow: hidden;
      word-break: break-word;
    }
    tbody td {
      padding: 9px 8px;
      text-align: right;
      border-bottom: 1px solid #ebebeb;
      vertical-align: middle;
      font-size: 11px;
      overflow: hidden;
      word-break: break-word;
    }
    tbody tr:nth-child(even) td { background: #f9fdf9; }
    tbody td:last-child { font-weight: 700; color: #16a34a; }

    /* ── Detail row ── */
    .detail-row td {
      background: #fff9f0 !important;
      padding: 4px 8px 8px !important;
      font-size: 10px !important;
      color: #78350f !important;
      border-bottom: 1px solid #fde8c8 !important;
      border-right: 3px solid #f97316 !important;
      word-break: break-word !important;
      white-space: normal !important;
    }
  }
`;

export default function ReportsPage() {
  const now   = new Date();
  const [year,  setYear]  = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [mode,  setMode]  = useState("month");
  const [activeSection, setActiveSection] = useState("sales");
  const [clientFilter, setClientFilter]   = useState("");

  const { data: taxArr = [] } = useQuery({ queryKey: ["taxValues"], queryFn: fetchData("/taxValues") });
  const { data: tractorArr = [] } = useQuery({ queryKey: ["tractorPrice"], queryFn: fetchData("/tractorPrice") });
  const maamValue = toNum(taxArr?.[0]?.maamValue) || 17;
  const tractorPriceFromSettings = toNum(tractorArr?.[0]?.price) || 0;

  const section = SECTIONS.find(s => s.key === activeSection);

  const { data: rawData = [], isLoading } = useQuery({
    queryKey: [activeSection],
    queryFn: fetchData(section.endpoint),
  });

  const filtered = useMemo(() => {
    let data = rawData;
    if (section.dateField === null) return data;
    data = data.filter(r => {
      const d = r.date || "";
      if (mode === "month") return d.startsWith(`${year}-${month}`);
      return d.startsWith(year);
    });
    if (clientFilter && section.hasClient) {
      data = data.filter(r => (r.clientName||"").includes(clientFilter));
    }
    return data;
  }, [rawData, year, month, mode, section, clientFilter]);

  const total = useMemo(() => filtered.reduce((a, r) => a + toNum(r.totalAmount), 0), [filtered]);

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
      <div style={s.controls} className="no-print reports-controls">
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

        <div style={s.fg}>
          <label style={s.label}>שנה</label>
          <select style={s.select} value={year} onChange={e => setYear(e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

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

        {/* Client filter — only for sections with clients */}
        {section?.hasClient && (
          <div style={s.fg}>
            <label style={s.label}>{activeSection === "personalWorkers" ? "סינון לפי עובד" : "סינון לפי לקוח"}</label>
            <select style={s.select} value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
              <option value="">{activeSection === "personalWorkers" ? "כל העובדים" : "כל הלקוחות"}</option>
              {[...new Set(rawData.map(r => r.clientName).filter(Boolean))].sort().map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        <button style={s.btnPrint} onClick={handlePrint}
          onMouseEnter={e=>e.currentTarget.style.background="#15803d"}
          onMouseLeave={e=>e.currentTarget.style.background="#16a34a"}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
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
            onClick={() => { setActiveSection(sec.key); setClientFilter(""); }}>
            {sec.icon} {sec.label}
          </button>
        ))}
      </div>

      {/* Report */}
      <div id="print-area">

        {/* ── Print-only header ── */}
        <div className="print-doc-header" style={{ display:"none" }}>
          <div>
            <div className="company">ח.א חקלאות 🌾</div>
            <div className="meta">
              {section?.label} &nbsp;|&nbsp; {periodLabel} &nbsp;|&nbsp;
              {new Date().toLocaleDateString("he-IL", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" })}
            </div>
          </div>
          {total > 0 && (
            <div className="total-box">
              <div className="label">סה"כ</div>
              <div className="amount">{total.toFixed(2)} ₪</div>
            </div>
          )}
        </div>

        <div style={s.report}>
          <div style={s.repHeader}>
            <div>
              <div style={s.repTitle}>{section?.icon} {section?.label}</div>
              <div style={s.repMeta}>{periodLabel} &nbsp;·&nbsp; {filtered.length} רשומות</div>
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
                  <tr>{section.columns.map(c => <th key={c} style={s.th}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <>
                      {/* Main row */}
                      <tr key={r._id || i}
                        style={{ background: i%2===0?"#fff":"#fefefe" }}>
                        {section.row(r, maamValue).map((cell, j) => (
                          <td key={j} style={{
                            ...s.td,
                            borderBottom: section.hasDetail ? "none" : "1px solid #f9f9f8",
                            fontWeight: j === section.columns.length-1 ? "600" : "400",
                            color: j === section.columns.length-1 ? "#16a34a" : "#374151",
                          }}>{cell}</td>
                        ))}
                      </tr>

                      {/* Detail row — only for sales */}
                      {section.hasDetail && (
                        <SaleDetailRow
                          key={`detail-${r._id}`}
                          sale={r}
                          colCount={section.columns.length}
                          tractorPriceFromSettings={tractorPriceFromSettings}
                        />
                      )}
                    </>
                  ))}
                </tbody>
              </table>

              {total > 0 && (
                <div style={s.footer}>
                  <div style={s.footerTxt}>סה"כ {periodLabel}: {total.toFixed(2)} ₪</div>
                  <div style={{ fontSize:"12px", color:"#a3a3a3" }}>{filtered.length} רשומות</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Print-only footer ── */}
        <div className="print-footer" style={{ display:"none" }}>
          <div>סה"כ {periodLabel}: {total.toFixed(2)} ₪</div>
          <div className="records">{filtered.length} רשומות</div>
        </div>

      </div>
    </div>
  );
}
