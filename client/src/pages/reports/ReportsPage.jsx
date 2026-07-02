import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api.js";

const fetchData = (ep) => () => api.get(ep).then(r => r.data.data);
const toNum = (v) => parseFloat(v) || 0;
const fmt = (n) => toNum(n).toFixed(2);

const MONTHS_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

const SECTIONS = [
  {
    key: "sales", label: "הכנסות", icon: "💰", endpoint: "/sales",
    columns: ["תאריך", "לקוח", "שם מטע", "מטרה", "דונמים", 'סה"כ'],
    row: (r) => [r.date, r.clientName, r.name, r.purpose || "—", r.quantity || "—", `${fmt(r.totalAmount)} ₪`],
    hasDetail: true, hasClient: true, applyVat: true,
  },
  {
    key: "expenses", label: "הוצאות", icon: "📦", endpoint: "/expenses",
    columns: ["תאריך", "שם החומר", "מחיר/יח׳", "כמות", 'סה"כ'],
    row: (r) => [r.date, r.name, `${fmt(r.number)} ₪`, r.quantity, `${fmt(r.totalAmount)} ₪`],
    applyVat: true,
  },
  {
    key: "clients", label: "לקוחות", icon: "👥", endpoint: "/clients",
    dateField: null,
    columns: ["שם לקוח", "טלפון", "כתובת", "דונמים"],
    row: (r) => [r.clientName, r.phone || "—", r.address || "—", r.totalDunam || "—"],
    applyVat: false,
  },
  {
    key: "bids", label: "הצעות מחיר", icon: "📋", endpoint: "/bids",
    columns: ["תאריך", "לקוח", "נושא", "סטטוס", 'סה"כ'],
    row: (r) => [r.date, r.clientName, r.target || "—", r.isApproved ? "מאושר" : "ממתין", `${fmt(r.totalAmount)} ₪`],
    hasClient: true, applyVat: true,
  },
  {
    key: "personalSales", label: "הכנסות אישיות", icon: "💵", endpoint: "/personalSales",
    columns: ["תאריך", "מטע", "זנים", "משקל", "כמות", 'סה"כ'],
    row: (r) => [r.date, r.name, r.strains || "—", r.weightKind || "—", r.quantity || "—", `${fmt(r.totalAmount)} ₪`],
    applyVat: true, hasStrain: true, hasWeightSum: true,
  },
  {
    key: "personalWorkers", label: "עובדים", icon: "👷", endpoint: "/personalWorkers",
    columns: ["תאריך", "עובד", "מטע", "יומית", 'סה"כ'],
    row: (r) => [r.date, r.clientName, r.name, `${fmt(r.number)} ₪`, `${fmt(r.totalAmount)} ₪`],
    hasClient: true, applyVat: true,
  },
  {
    key: "personalRkrExpenses", label: "ריסוס-קיסוח-ריסוק", icon: "🚜", endpoint: "/personalRkrExpenses",
    columns: ["תאריך", "מטע", "עבודה", "דונמים", "עלות עבודה", 'סה"כ'],
    row: (r) => [r.date, r.name, r.workKind || "—", r.quantity || "—", `${fmt(r.workPrice)} ₪`, `${fmt(r.totalAmount)} ₪`],
    applyVat: true,
  },
  {
    key: "personalProductExpenses", label: "הוצאות מוצרים", icon: "📦", endpoint: "/personalProductExpenses",
    columns: ["תאריך", "מוצר", "כמות", "מחיר", 'סה"כ'],
    row: (r) => [r.date, r.name, r.quantity || "—", `${fmt(r.number)} ₪`, `${fmt(r.totalAmount)} ₪`],
    applyVat: true,
  },
  {
    key: "personalInvestments", label: "השקעות", icon: "📈", endpoint: "/personalInvestments",
    columns: ["תאריך", "השקעה", "סכום", "הערות", 'סה"כ'],
    row: (r) => [r.date, r.name, `${fmt(r.number)} ₪`, r.other && r.other !== "-" ? r.other : "—", `${fmt(r.totalAmount)} ₪`],
    applyVat: true,
  },
];

// ─── Sale Detail Row (compact) ───────────────────────────────
function SaleDetailRow({ sale, colCount, tractorPriceFromSettings }) {
  const products = sale.product || [];
  const quantities = sale.quantitiesOfProduct || {};
  const prices = sale.pricesOfProducts || {};
  const dunam = toNum(sale.quantity);

  const tractorPrice = toNum(tractorPriceFromSettings);
  const tractorTotal = parseFloat((dunam * tractorPrice).toFixed(2));

  if (products.length === 0 && tractorTotal === 0) return null;

  const parts = [];

  if (products.length > 0) {
    const matStr = products.map(prod => {
      const qty = toNum(quantities[prod]);
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
          <span style={{ fontSize: "10px", fontWeight: "600", color: "#f97316", letterSpacing: "0.05em" }}>
            חישוב מפורט:
          </span>
          {parts.map((p, i) => (
            <span key={i} style={{ color: "#78350f" }}>{p}</span>
          ))}
          <span style={{ marginRight: "auto", fontWeight: "700", color: "#ea580c" }}>
            = {fmt(sale.totalAmount)} ₪
          </span>
        </div>
      </td>
    </tr>
  );
}

const s = {
  page: { padding: "28px 32px", direction: "rtl" },
  title: { fontSize: "20px", fontWeight: "600", color: "#1a1a1a", marginBottom: "4px" },
  sub: { fontSize: "13px", color: "#a3a3a3", marginBottom: "24px" },
  controls: { background: "#fff", borderRadius: "12px", border: "1px solid #f0f0ef", padding: "20px 24px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" },
  fg: { display: "flex", flexDirection: "column", gap: "6px", minWidth: "160px" },
  label: { fontSize: "12px", fontWeight: "500", color: "#6b7280" },
  select: { padding: "9px 13px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", color: "#1a1a1a", outline: "none", background: "#fff", cursor: "pointer" },
  btnPrint: { display: "flex", alignItems: "center", gap: "7px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", marginRight: "auto" },
  tabs: { display: "flex", gap: "4px", marginBottom: "20px", flexWrap: "wrap" },
  tab: { padding: "8px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#fff", fontSize: "12px", fontWeight: "500", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", color: "#6b7280" },
  tabActive: { background: "#f0fdf4", borderColor: "#86efac", color: "#16a34a", fontWeight: "600" },
  report: { background: "#fff", borderRadius: "12px", border: "1px solid #f0f0ef", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  repHeader: { padding: "20px 24px", borderBottom: "1px solid #f0f0ef", display: "flex", justifyContent: "space-between", alignItems: "center" },
  repTitle: { fontSize: "16px", fontWeight: "600", color: "#1a1a1a" },
  repMeta: { fontSize: "12px", color: "#a3a3a3" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "11px 14px", fontSize: "11px", fontWeight: "600", color: "#a3a3a3", textAlign: "right", letterSpacing: "0.06em", borderBottom: "1px solid #f0f0ef", background: "#fafaf9", textTransform: "uppercase" },
  td: { padding: "11px 14px", fontSize: "13px", color: "#374151", borderBottom: "1px solid #f9f9f8", textAlign: "right" },
  footer: { padding: "14px 24px", background: "#f0fdf4", borderTop: "1px solid #86efac", display: "flex", justifyContent: "space-between", alignItems: "center" },
  footerTxt: { fontSize: "13px", color: "#15803d", fontWeight: "600" },
  empty: { padding: "48px", textAlign: "center", color: "#a3a3a3", fontSize: "14px" },
};

// ─── الحل الصحيح: فتح نافذة طباعة منفصلة بـ HTML نظيف ───────
const PRINT_STYLE = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    direction: rtl;
    font-family: 'Heebo', 'Arial Hebrew', Arial, sans-serif;
    font-size: 12px;
    color: #1a1a1a;
    background: #fff;
  }

  .print-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 10px;
    border-bottom: 2px solid #16a34a;
    margin-bottom: 16px;
  }

  .print-header-right {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .print-header .company {
    font-size: 18px;
    font-weight: 700;
  }

  .print-header .meta {
    font-size: 11px;
    color: #6b7280;
    margin-top: 2px;
  }

  .records-badge {
    font-size: 11px;
    color: #6b7280;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 3px 10px;
    align-self: flex-start;
  }

  .vat-summary {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 12px;
    flex-wrap: wrap;
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid #e5e7eb;
  }

  .vat-before {
    font-weight: 700;
    font-size: 13px;
    color: #374151;
  }

  .vat-label {
    font-size: 10px;
    color: #9ca3af;
  }

  .vat-op {
    color: #9ca3af;
    font-size: 11px;
    margin: 0 1px;
  }

  .vat-tax {
    color: #d97706;
    font-weight: 600;
    font-size: 11px;
  }

  .vat-total {
    font-weight: 700;
    font-size: 15px;
    color: #16a34a;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    page-break-inside: auto;
  }

  thead {
    display: table-header-group;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  th {
    background: #f0fdf4;
    color: #374151;
    font-size: 11px;
    font-weight: 600;
    padding: 8px 10px;
    border-bottom: 2px solid #16a34a;
    text-align: right;
  }

  td {
    font-size: 11px;
    padding: 7px 10px;
    border-bottom: 1px solid #e5e7eb;
    text-align: right;
  }

  tr:nth-child(even) td { background: #fafafa; }

  td.amount {
    font-weight: 600;
    color: #16a34a;
  }

  .detail-td {
    font-size: 10px;
    color: #92400e;
    background: #fff9f0 !important;
    border-right: 3px solid #f97316;
    padding: 4px 14px 8px 10px;
  }

  .print-footer {
    display: flex;
    justify-content: space-between;
    padding-top: 10px;
    border-top: 2px solid #16a34a;
    margin-top: 14px;
    font-size: 12px;
    font-weight: 600;
    color: #15803d;
  }

  @media print {
    @page {
      size: A4 portrait;
      margin: 15mm 10mm;
    }
    body { margin: 0; }
  }
`;

export default function ReportsPage() {
  const now = new Date();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [mode, setMode] = useState("month");
  const [activeSection, setActiveSection] = useState("sales");
  const [clientFilter, setClientFilter] = useState("");
  const [strainFilter, setStrainFilter] = useState("");

  const { data: taxArr = [] } = useQuery({ queryKey: ["taxValues"], queryFn: fetchData("/taxValues") });
  const { data: tractorArr = [] } = useQuery({ queryKey: ["tractorPrice"], queryFn: fetchData("/tractorPrice") });
  const maamValue = toNum(taxArr?.[0]?.maamValue) || 17;
  const tractorPriceFromSettings = toNum(tractorArr?.[0]?.price) || 0;

  const section = SECTIONS.find(s => s.key === activeSection);

  const { data: rawData = [], isLoading } = useQuery({
    queryKey: [activeSection],
    queryFn: fetchData(section.endpoint),
  });

  const strainOptions = useMemo(() => {
    if (!section?.hasStrain) return [];
    const all = rawData.flatMap(r =>
      (r.strains || "").split(",").map(v => v.trim()).filter(Boolean)
    );
    return [...new Set(all)].sort();
  }, [rawData, section]);

  const filtered = useMemo(() => {
    let data = rawData;
    if (section.dateField === null) return data;
    data = data.filter(r => {
      const d = r.date || "";
      if (mode === "month") return d.startsWith(`${year}-${month}`);
      return d.startsWith(year);
    });
    if (clientFilter && section.hasClient) {
      data = data.filter(r => (r.clientName || "").includes(clientFilter));
    }
    if (strainFilter && section.hasStrain) {
      data = data.filter(r => (r.strains || "").includes(strainFilter));
    }
    return data;
  }, [rawData, year, month, mode, section, clientFilter, strainFilter]);

  const total = useMemo(() => filtered.reduce((a, r) => a + toNum(r.totalAmount), 0), [filtered]);
  const taxTotal   = section?.applyVat ? parseFloat((total * (maamValue / 100)).toFixed(2)) : 0;
  const grandTotal = parseFloat((total + taxTotal).toFixed(2));

  const totalWeight = useMemo(() => {
    if (!section?.hasWeightSum) return 0;
    return filtered.reduce((sum, r) => {
      const qty = toNum(r.quantity);
      const isTon = (r.weightKind || "").includes("טון");
      return sum + (isTon ? qty * 1000 : qty);
    }, 0);
  }, [filtered, section]);

  const years = ["2023", "2024", "2025", "2026", "2027"];

  const periodLabel = mode === "month"
    ? `${MONTHS_HE[parseInt(month) - 1]} ${year}`
    : `שנת ${year}`;

  // ─── فتح نافذة طباعة منفصلة بـ HTML نظيف ───
  const handlePrint = () => {
    // بناء صفوف الجدول
    let rowsHtml = "";
    filtered.forEach((r, i) => {
      const cells = section.row(r, maamValue);
      const isLast = (j) => j === cells.length - 1;
      rowsHtml += `<tr>`;
      cells.forEach((cell, j) => {
        rowsHtml += `<td class="${isLast(j) ? "amount" : ""}">${cell ?? "—"}</td>`;
      });
      rowsHtml += `</tr>`;

      // تفاصيل المبيعات
      if (section.hasDetail) {
        const products = r.product || [];
        const quantities = r.quantitiesOfProduct || {};
        const prices = r.pricesOfProducts || {};
        const dunam = toNum(r.quantity);
        const tractorPrice = toNum(tractorPriceFromSettings);
        const tractorTotal = parseFloat((dunam * tractorPrice).toFixed(2));

        if (products.length > 0 || tractorTotal > 0) {
          const parts = [];
          if (products.length > 0) {
            const matStr = products.map(prod => {
              const qty = toNum(quantities[prod]);
              const price = toNum(prices[prod]);
              return `${prod} ${qty}ל׳ (${fmt(price)}₪)`;
            }).join(" | ");
            parts.push(`🧪 ${matStr}`);
          }
          if (tractorTotal > 0) {
            parts.push(`🚜 ${dunam}ד׳ × ${fmt(tractorPrice)}₪ = ${fmt(tractorTotal)}₪`);
          }
          rowsHtml += `<tr><td colspan="${cells.length}" class="detail-td">חישוב מפורט: ${parts.join("  |  ")}  =  ${fmt(r.totalAmount)} ₪</td></tr>`;
        }
      }
    });

    const colsHtml = section.columns.map(c => `<th>${c}</th>`).join("");

    const dateStr = new Date().toLocaleDateString("he-IL", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

    const applyVat = section?.applyVat ?? true;
    const taxAmt   = applyVat ? parseFloat((total * (maamValue / 100)).toFixed(2)) : 0;
    const grandTot = parseFloat((total + taxAmt).toFixed(2));

    const totalHtml = total > 0 ? `
      <div class="vat-summary">
        <span class="vat-before">${total.toFixed(2)} ₪</span>
        <span class="vat-label">לפני מע"מ</span>
        ${applyVat ? `
          <span class="vat-op">+</span>
          <span class="vat-tax">מע"מ ${maamValue}% (${taxAmt.toFixed(2)} ₪)</span>
          <span class="vat-op">=</span>
          <span class="vat-total">${grandTot.toFixed(2)} ₪</span>
        ` : ''}
        ${section?.hasWeightSum && totalWeight > 0 ? `
          <span class="vat-op">|</span>
          <span class="vat-label">סה"כ ${totalWeight.toLocaleString("he-IL")} ק"ג</span>
        ` : ''}
      </div>` : "";

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8"/>
  <title>${section.label} - ${periodLabel}</title>
  <style>${PRINT_STYLE}</style>
</head>
<body>
  <div class="print-header">
    <div class="print-header-right">
      <div class="company">ח.א חקלאות 🌾</div>
      <div class="meta">${section.label} &nbsp;|&nbsp; ${periodLabel} &nbsp;|&nbsp; ${dateStr}</div>
      ${totalHtml}
    </div>
    <div class="records-badge">${filtered.length} רשומות</div>
  </div>

  <table>
    <thead><tr>${colsHtml}</tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>

  <div class="print-footer">
    <div>סה"כ לפני מע"מ ${periodLabel}: ${total.toFixed(2)} ₪${applyVat ? ` | כולל מע"מ: ${grandTot.toFixed(2)} ₪` : ""}${section?.hasWeightSum && totalWeight > 0 ? ` | סה"כ ${totalWeight.toLocaleString("he-IL")} ק"ג` : ""}</div>
    <div>${filtered.length} רשומות</div>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      // win.close(); // uncomment إذا أردت إغلاق النافذة تلقائياً بعد الطباعة
    }, 500);
  };

  return (
    <div style={s.page} className="page-pad">
      <div style={s.title}>דוחות</div>
      <div style={s.sub}>סינון ויצוא נתונים לפי תקופה</div>

      {/* Controls */}
      <div style={s.controls} className="no-print reports-controls">
        <div style={s.fg}>
          <label style={s.label}>תקופה</label>
          <div style={{ display: "flex", background: "#f5f5f4", borderRadius: "8px", padding: "3px" }}>
            {[["month", "חודשי"], ["year", "שנתי"]].map(([k, l]) => (
              <button key={k} onClick={() => setMode(k)} style={{
                flex: 1, padding: "7px 12px", borderRadius: "6px", border: "none",
                fontSize: "13px", fontWeight: mode === k ? "600" : "400",
                background: mode === k ? "#fff" : "transparent",
                color: mode === k ? "#16a34a" : "#6b7280",
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: mode === k ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
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
                <option key={i} value={String(i + 1).padStart(2, "0")}>{m}</option>
              ))}
            </select>
          </div>
        )}

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

        {section?.hasStrain && (
          <div style={s.fg}>
            <label style={s.label}>סינון לפי זן</label>
            <select style={s.select} value={strainFilter} onChange={e => setStrainFilter(e.target.value)}>
              <option value="">כל הזנים</option>
              {strainOptions.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        )}

        <button style={s.btnPrint} onClick={handlePrint}
          onMouseEnter={e => e.currentTarget.style.background = "#15803d"}
          onMouseLeave={e => e.currentTarget.style.background = "#16a34a"}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          הדפס / PDF
        </button>
      </div>

      {/* Section tabs */}
      <div style={s.tabs} className="no-print">
        {SECTIONS.map(sec => (
          <button key={sec.key}
            style={{ ...s.tab, ...(activeSection === sec.key ? s.tabActive : {}) }}
            onClick={() => { setActiveSection(sec.key); setClientFilter(""); setStrainFilter(""); }}>
            {sec.icon} {sec.label}
          </button>
        ))}
      </div>

      {/* Report */}
      {/* Summary Bar - מע"מ + משקל */}
      {section?.applyVat && total > 0 && (
        <div style={{ background:"#fff", borderRadius:"12px", border:"1px solid #f0f0ef", padding:"16px 24px", marginBottom:"16px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", direction:"rtl" }} className="no-print">
          <div style={{ display:"flex", gap:"24px", alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:"3px" }}>
              <span style={{ fontSize:"11px", color:"#a3a3a3", fontWeight:"500", letterSpacing:"0.04em", textTransform:"uppercase" }}>סה"כ לפני מע"מ</span>
              <span style={{ fontSize:"18px", fontWeight:"700", color:"#374151" }}>{total.toFixed(2)} ₪</span>
            </div>
            <div style={{ width:"1px", background:"#f0f0ef", alignSelf:"stretch" }}/>
            <div style={{ display:"flex", flexDirection:"column", gap:"3px" }}>
              <span style={{ fontSize:"11px", color:"#a3a3a3", fontWeight:"500", letterSpacing:"0.04em", textTransform:"uppercase" }}>מע"מ ({maamValue}%)</span>
              <span style={{ fontSize:"16px", fontWeight:"700", color:"#d97706" }}>{taxTotal.toFixed(2)} ₪</span>
            </div>
            <div style={{ width:"1px", background:"#f0f0ef", alignSelf:"stretch" }}/>
            <div style={{ display:"flex", flexDirection:"column", gap:"3px" }}>
              <span style={{ fontSize:"11px", color:"#a3a3a3", fontWeight:"500", letterSpacing:"0.04em", textTransform:"uppercase" }}>סה"כ כולל מע"מ</span>
              <span style={{ fontSize:"18px", fontWeight:"700", color:"#16a34a" }}>{grandTotal.toFixed(2)} ₪</span>
            </div>
            <div style={{ marginRight:"auto" }}>
              <div style={{ fontSize:"11px", color:"#a3a3a3" }}>שיעור מע"מ</div>
              <div style={{ fontSize:"13px", fontWeight:"600", color:"#374151" }}>{maamValue}%</div>
            </div>
          </div>

          {section?.hasWeightSum && totalWeight > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              marginTop: "12px", paddingTop: "12px",
              borderTop: "1px dashed #e5e7eb",
            }}>
              <span style={{ fontSize: "15px" }}>⚖️</span>
              <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>סה"כ משקל:</span>
              <span style={{ fontSize: "15px", fontWeight: "700", color: "#374151" }}>
                {totalWeight.toLocaleString("he-IL")} ק"ג
              </span>
            </div>
          )}
        </div>
      )}
      <div id="print-area">
        <div style={s.report}>
          <div style={s.repHeader}>
            <div>
              <div style={s.repTitle}>{section?.icon} {section?.label}</div>
              <div style={s.repMeta}>{periodLabel} &nbsp;·&nbsp; {filtered.length} רשומות</div>
            </div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: "#16a34a" }}>
              {total > 0 ? `${total.toFixed(2)} ₪` : ""}
            </div>
          </div>

          {isLoading ? (
            <div style={s.empty}>טוען נתונים...</div>
          ) : filtered.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>📭</div>
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
                      <tr key={r._id || i}
                        style={{ background: i % 2 === 0 ? "#fff" : "#fefefe" }}>
                        {section.row(r, maamValue).map((cell, j) => (
                          <td key={j} style={{
                            ...s.td,
                            borderBottom: section.hasDetail ? "none" : "1px solid #f9f9f8",
                            fontWeight: j === section.columns.length - 1 ? "600" : "400",
                            color: j === section.columns.length - 1 ? "#16a34a" : "#374151",
                          }}>{cell}</td>
                        ))}
                      </tr>
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
                  <div style={{ fontSize: "12px", color: "#a3a3a3" }}>{filtered.length} רשומות</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
