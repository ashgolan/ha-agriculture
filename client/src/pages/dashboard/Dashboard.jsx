import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";
import api from "../../services/api.js";
import { useState } from "react";

const fetchAll = (ep) => () => api.get(ep).then(r => r.data.data);
const toNum    = (v) => parseFloat(v) || 0;

const MONTHS_HE = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

const s = {
  page:      { padding: "28px 32px", direction: "rtl" },
  welcome:   { marginBottom: "28px" },
  wTitle:    { fontSize: "22px", fontWeight: "600", color: "#1a1a1a" },
  wSub:      { fontSize: "13px", color: "#a3a3a3", marginTop: "4px" },
  grid4:     { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" },
  grid2:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" },
  grid3:     { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" },
  card:      { background: "#fff", borderRadius: "12px", border: "1px solid #f0f0ef", padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  statCard:  { background: "#fff", borderRadius: "12px", border: "1px solid #f0f0ef", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "14px", transition: "box-shadow 0.2s", cursor: "pointer" },
  iconBox:   { width: "44px", height: "44px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 },
  statNum:   { fontSize: "22px", fontWeight: "700", lineHeight: 1 },
  statLabel: { fontSize: "12px", color: "#a3a3a3", marginTop: "4px" },
  secTitle:  { fontSize: "14px", fontWeight: "600", color: "#1a1a1a", marginBottom: "14px" },
  row:       { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f9f9f8" },
  rowLabel:  { fontSize: "13px", color: "#374151" },
  rowVal:    { fontSize: "13px", fontWeight: "600", color: "#16a34a" },
  barWrap:   { marginBottom: "12px" },
  barLabel:  { display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "12px" },
  barTrack:  { height: "6px", background: "#f0f0ef", borderRadius: "10px", overflow: "hidden" },
  barFill:   { height: "100%", borderRadius: "10px", transition: "width 0.6s ease" },
  quickBtn:  { padding: "8px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fafaf9", fontSize: "13px", fontWeight: "500", color: "#374151", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" },
  noData:    { fontSize: "13px", color: "#a3a3a3", textAlign: "center", padding: "20px 0" },
  legendItem:{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#374151", marginBottom: "10px" },
  legendDot: { width: "12px", height: "12px", borderRadius: "50%", flexShrink: 0 },
};

// ─── Palette ──────────────────────────────────────────────────
const C = {
  teal:   { bg:"#E1F5EE", border:"#5DCAA5", icon:"#0F6E56", text:"#085041" },
  blue:   { bg:"#E6F1FB", border:"#85B7EB", icon:"#185FA5", text:"#0C447C" },
  amber:  { bg:"#FAEEDA", border:"#EF9F27", icon:"#854F0B", text:"#633806" },
  red:    { bg:"#FCEBEB", border:"#F09595", icon:"#A32D2D", text:"#791F1F" },
};

const SEGMENT_STYLES = [
  { color:"#0F6E56", bg:"#E1F5EE", border:"#5DCAA5", text:"#085041" }, // teal  — הכנסות כלליות
  { color:"#185FA5", bg:"#E6F1FB", border:"#85B7EB", text:"#0C447C" }, // blue  — הכנסות פרטיות
  { color:"#EF9F27", bg:"#FAEEDA", border:"#EF9F27", text:"#633806" }, // amber — הוצאות כלליות
  { color:"#A32D2D", bg:"#FCEBEB", border:"#F09595", text:"#791F1F" }, // red   — השקעות אישיות
];

function fmtILS(n) {
  return new Intl.NumberFormat("he-IL", { style:"currency", currency:"ILS", maximumFractionDigits:0 }).format(Number(n||0));
}

// ─── Donut Chart ──────────────────────────────────────────────
function DonutChart({ segments }) {
  const [hovered, setHovered] = useState(null);
  const total = segments.reduce((a, s) => a + s.value, 0);

  const cx = 90, cy = 90, r = 68, strokeW = 22;
  const circ = 2 * Math.PI * r;
  const GAP  = 4;

  let cumulative = 0;
  const slices = segments.map((seg, i) => {
    const pct    = total > 0 ? seg.value / total : 0;
    const len    = Math.max(0, pct * circ - GAP);
    const offset = circ - (cumulative * circ) + GAP / 2;
    cumulative += pct;
    return { ...seg, ...SEGMENT_STYLES[i], pct, len, offset };
  });

  const hov = hovered !== null ? slices[hovered] : null;

  if (!total) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"200px", color:"#bbb", fontSize:"13px" }}>
      אין נתונים עדיין
    </div>
  );

  return (
    <div style={{ display:"flex", alignItems:"center", gap:"24px", flexWrap:"wrap" }} className="donut-wrap">

      {/* SVG */}
      <div style={{ position:"relative", flexShrink:0 }}>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ overflow:"visible" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f0ef" strokeWidth={strokeW}/>
          {slices.map((sl, i) => (
            <circle key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={sl.color}
              strokeWidth={hovered===i ? strokeW+6 : strokeW}
              strokeDasharray={`${sl.len} ${circ - sl.len}`}
              strokeDashoffset={sl.offset}
              strokeLinecap="butt"
              style={{
                transformOrigin:`${cx}px ${cy}px`,
                transform:"rotate(-90deg)",
                transition:"stroke-width 0.18s ease",
                cursor:"pointer",
                filter: hovered===i ? `drop-shadow(0 0 6px ${sl.color}88)` : "none",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}

          {/* Center text */}
          {hov ? (
            <>
              <text x={cx} y={cy-16} textAnchor="middle" fontSize="10" fill="#a3a3a3" fontFamily="Heebo,sans-serif">
                {hov.label}
              </text>
              <text x={cx} y={cy+4} textAnchor="middle" fontSize="15" fontWeight="700" fill={hov.color} fontFamily="Heebo,sans-serif">
                {fmtILS(hov.value)}
              </text>
              <text x={cx} y={cy+20} textAnchor="middle" fontSize="12" fill={hov.color} fontFamily="Heebo,sans-serif">
                {(hov.pct*100).toFixed(1)}%
              </text>
            </>
          ) : (
            <>
              <text x={cx} y={cy-8} textAnchor="middle" fontSize="10" fill="#a3a3a3" fontFamily="Heebo,sans-serif">סה"כ</text>
              <text x={cx} y={cy+10} textAnchor="middle" fontSize="15" fontWeight="700" fill="#1a1a1a" fontFamily="Heebo,sans-serif">
                {fmtILS(total)}
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ flex:1, minWidth:"150px", display:"flex", flexDirection:"column", gap:"8px" }}>
        {slices.map((sl, i) => (
          <div key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display:"flex", alignItems:"center", gap:"10px",
              padding:"9px 12px", borderRadius:"10px",
              background: hovered===i ? sl.bg : "#fafaf9",
              border: `1px solid ${hovered===i ? sl.border : "#f0f0ef"}`,
              cursor:"default", transition:"all 0.15s",
              opacity: hovered===null || hovered===i ? 1 : 0.5,
            }}>
            <div style={{
              width:"10px", height:"10px", borderRadius:"50%",
              background: sl.color, flexShrink:0,
              boxShadow: hovered===i ? `0 0 0 3px ${sl.bg}` : "none",
              transition:"box-shadow 0.15s",
            }}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"11px", color:"#6b7280" }}>{sl.label}</div>
              <div style={{ fontSize:"13px", fontWeight:"700", color:sl.text }}>{fmtILS(sl.value)}</div>
            </div>
            <div style={{
              fontSize:"11px", fontWeight:"600",
              color: sl.text,
              background: sl.bg,
              border: `0.5px solid ${sl.border}`,
              borderRadius:"20px", padding:"2px 8px",
            }}>
              {(sl.pct*100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── Main ─────────────────────────────────────────────────────
export default function Dashboard() {
  const user     = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const now     = new Date();
  const year    = now.getFullYear();
  const month   = String(now.getMonth() + 1).padStart(2, "0");
  const monthHe = MONTHS_HE[now.getMonth()];
  const hour    = now.getHours();
  const greeting = hour < 12 ? "בוקר טוב" : hour < 18 ? "צהריים טובים" : "ערב טוב";

  const { data: sales         = [] } = useQuery({ queryKey: ["sales"],               queryFn: fetchAll("/sales") });
  const { data: expenses      = [] } = useQuery({ queryKey: ["expenses"],            queryFn: fetchAll("/expenses") });
  const { data: clients       = [] } = useQuery({ queryKey: ["clients"],             queryFn: fetchAll("/clients") });
  const { data: bids          = [] } = useQuery({ queryKey: ["bids"],                queryFn: fetchAll("/bids") });
  const { data: personalSales = [] } = useQuery({ queryKey: ["personalSales"],       queryFn: fetchAll("/personalSales") });
  const { data: personalRkr   = [] } = useQuery({ queryKey: ["personalRkrExpenses"],queryFn: fetchAll("/personalRkrExpenses") });
  const { data: personalInv   = [] } = useQuery({ queryKey: ["personalInvestments"],queryFn: fetchAll("/personalInvestments") });

  const thisMonth = (arr) => arr.filter(r => (r.date||"").startsWith(`${year}-${month}`));

  // ─── Totals ──────────────────────────────────────────────
  const totalSales         = sales.reduce((a,r) => a + toNum(r.totalAmount), 0);
  const totalPersonalSales = personalSales.reduce((a,r) => a + toNum(r.totalAmount), 0)
                           + personalRkr.reduce((a,r) => a + toNum(r.totalAmount), 0);

  const totalExpGeneral = expenses.reduce((a,r) => a + toNum(r.totalAmount), 0);

  const totalPersonalInvestments = personalInv.reduce((a,r) => a + toNum(r.totalAmount), 0);

  // Month
  const monthRevenue  = thisMonth(sales).reduce((a,r) => a + toNum(r.totalAmount), 0);
  const monthExpenses = thisMonth(expenses).reduce((a,r) => a + toNum(r.totalAmount), 0);
  const monthProfit  = monthRevenue - monthExpenses;
  const pendingBids  = bids.filter(b => !b.isApproved).length;
  const approvedBids = bids.filter(b => b.isApproved).length;

  // ─── Donut segments ───────────────────────────────────────
  const donutSegments = [
    { label:"הכנסות כלליות",  value: totalSales },
    { label:"הכנסות פרטיות",  value: totalPersonalSales },
    { label:"הוצאות כלליות",  value: totalExpGeneral },
    { label:"השקעות אישיות",  value: totalPersonalInvestments },
  ];

  // ─── Top clients ──────────────────────────────────────────
  const clientRevMap = {};
  sales.forEach(s => {
    if (!s.clientName) return;
    clientRevMap[s.clientName] = (clientRevMap[s.clientName]||0) + toNum(s.totalAmount);
  });
  const topClients   = Object.entries(clientRevMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxClientRev = topClients[0]?.[1] || 1;

  // ─── Last 6 months ────────────────────────────────────────
  const last6 = Array.from({ length:6 }, (_,i) => {
    const d = new Date(year, now.getMonth()-(5-i), 1);
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,"0");
    const rev = sales.filter(r=>(r.date||"").startsWith(`${y}-${m}`)).reduce((a,r)=>a+toNum(r.totalAmount),0);
    return { label: MONTHS_HE[d.getMonth()].slice(0,3), rev };
  });
  const maxRev = Math.max(...last6.map(m=>m.rev),1);

  // ─── Recent sales ─────────────────────────────────────────
  const recentSales = [...sales].sort((a,b)=>(b.date||"").localeCompare(a.date||"")).slice(0,5);

  return (
    <div style={s.page} className="page-pad">

      {/* Welcome */}
      <div style={s.welcome}>
        <div style={s.wTitle}>{greeting} 👋</div>
        <div style={s.wSub}>{monthHe} {year} — הנה סקירה עדכנית</div>
      </div>

      {/* Stat cards */}
      <div style={s.grid4} className="dash-grid4">
        {[
          { label:"לקוחות",            value: clients.length,                  icon:"👥", color:"#16a34a", bg:"#f0fdf4", to:"/clients" },
          { label:`הכנסות ${monthHe}`, value:`${monthRevenue.toFixed(0)} ₪`,   icon:"💰", color:"#0284c7", bg:"#f0f9ff", to:"/sales" },
          { label:`הוצאות ${monthHe}`, value:`${monthExpenses.toFixed(0)} ₪`,  icon:"📦", color:"#f97316", bg:"#fff7ed", to:"/expenses" },
          { label:"הצעות פתוחות",      value: pendingBids,                     icon:"📋", color:"#7c3aed", bg:"#faf5ff", to:"/bids" },
        ].map(card => (
          <div key={card.label} style={s.statCard}
            onClick={() => navigate(card.to)}
            onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"}
            onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"}>
            <div style={{ ...s.iconBox, background:card.bg }}>{card.icon}</div>
            <div>
              <div style={{ ...s.statNum, color:card.color }}>{card.value}</div>
              <div style={s.statLabel}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Donut + Summary */}
      <div style={s.grid2} className="dash-grid2">

        {/* Donut chart */}
        <div style={s.card}>
          <div style={s.secTitle}>🎯 התפלגות הכנסות והוצאות</div>
          <DonutChart segments={donutSegments}/>
        </div>

        {/* Month summary */}
        <div style={s.card}>
          <div style={s.secTitle}>📈 סיכום {monthHe}</div>
          {[
            { label:"הכנסות",               val:`${monthRevenue.toFixed(2)} ₪`,  color:"#16a34a" },
            { label:"הוצאות",                val:`${monthExpenses.toFixed(2)} ₪`, color:"#f97316" },
            { label:"רווח גולמי",            val:`${monthProfit.toFixed(2)} ₪`,   color: monthProfit>=0?"#16a34a":"#e11d48" },
            { label:"עסקאות החודש",          val:`${thisMonth(sales).length}`,    color:"#374151" },
            { label:"הצעות מאושרות",         val:`${approvedBids}`,               color:"#7c3aed" },
            { label:'סה"כ הכנסות (כל הזמן)', val:`${totalSales.toFixed(2)} ₪`,   color:"#0284c7" },
          ].map((row,i,arr) => (
            <div key={i} style={{ ...s.row, borderBottom: i===arr.length-1?"none":"1px solid #f9f9f8" }}>
              <span style={s.rowLabel}>{row.label}</span>
              <span style={{ ...s.rowVal, color:row.color }}>{row.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart + Top clients + Recent */}
      <div style={s.grid3} className="dash-grid3">

        {/* Bar chart */}
        <div style={s.card}>
          <div style={s.secTitle}>📊 הכנסות — 6 חודשים</div>
          {last6.map((m,i) => (
            <div key={i} style={s.barWrap}>
              <div style={s.barLabel}>
                <span style={{ color:"#6b7280" }}>{m.label}</span>
                <span style={{ fontWeight:"600", color:"#16a34a" }}>{m.rev>0?`${m.rev.toFixed(0)} ₪`:"—"}</span>
              </div>
              <div style={s.barTrack}>
                <div style={{ ...s.barFill, width:`${(m.rev/maxRev)*100}%`, background:i===5?"#16a34a":"#86efac" }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Top clients */}
        <div style={s.card}>
          <div style={s.secTitle}>🏆 לקוחות מובילים</div>
          {topClients.length===0 ? <div style={s.noData}>אין נתונים עדיין</div>
          : topClients.map(([name,rev],i) => (
            <div key={name} style={s.barWrap}>
              <div style={s.barLabel}>
                <span style={{ color:"#374151", fontWeight:i===0?"600":"400" }}>
                  {i===0?"🥇":i===1?"🥈":i===2?"🥉":"  "} {name}
                </span>
                <span style={{ fontWeight:"600", color:"#16a34a" }}>{rev.toFixed(0)} ₪</span>
              </div>
              <div style={s.barTrack}>
                <div style={{ ...s.barFill, width:`${(rev/maxClientRev)*100}%`, background:"#4ade80" }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Recent sales */}
        <div style={s.card}>
          <div style={s.secTitle}>🕐 עסקאות אחרונות</div>
          {recentSales.length===0 ? <div style={s.noData}>אין עסקאות עדיין</div>
          : recentSales.map((sale,i) => (
            <div key={sale._id} style={{ ...s.row, borderBottom:i===recentSales.length-1?"none":"1px solid #f9f9f8" }}>
              <div>
                <div style={{ fontSize:"13px", fontWeight:"500", color:"#1a1a1a" }}>{sale.clientName}</div>
                <div style={{ fontSize:"11px", color:"#a3a3a3" }}>{sale.date} · {sale.name}</div>
              </div>
              <span style={{ fontSize:"13px", fontWeight:"700", color:"#16a34a" }}>
                {toNum(sale.totalAmount).toFixed(0)} ₪
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ ...s.card, marginBottom:0 }}>
        <div style={s.secTitle}>⚡ קישורים מהירים</div>
        <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
          {[
            { label:"+ הוסף מכירה",  to:"/sales" },
            { label:"+ הוסף לקוח",   to:"/clients" },
            { label:"+ הוסף הוצאה",  to:"/expenses" },
            { label:"+ הצעת מחיר",   to:"/bids" },
            { label:"📊 דוחות",       to:"/reports" },
          ].map(link => (
            <button key={link.to} style={s.quickBtn} onClick={() => navigate(link.to)}
              onMouseEnter={e=>{ e.currentTarget.style.background="#f0fdf4"; e.currentTarget.style.borderColor="#86efac"; e.currentTarget.style.color="#16a34a"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="#fafaf9"; e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.color="#374151"; }}>
              {link.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
