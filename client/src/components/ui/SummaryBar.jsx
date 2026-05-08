import { useQuery } from "@tanstack/react-query";
import api from "../../services/api.js";

const fetchTax = () => api.get("/taxValues").then(r => r.data.data);
const toNum = (v) => parseFloat(v) || 0;

const sBar = {
  summaryBar: { background:"#fff", borderRadius:"12px", border:"1px solid #f0f0ef", padding:"18px 24px", marginBottom:"16px", display:"flex", gap:"32px", alignItems:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", flexWrap:"wrap" },
  statItem:   { display:"flex", flexDirection:"column", gap:"3px" },
  statLabel:  { fontSize:"11px", color:"#a3a3a3", fontWeight:"500", letterSpacing:"0.04em", textTransform:"uppercase" },
  statValue:  { fontSize:"18px", fontWeight:"700", color:"#1a1a1a" },
  divider:    { width:"1px", background:"#f0f0ef", alignSelf:"stretch" },
};

export default function SummaryBar({ total, applyVat = true }) {
  const { data: taxArr = [] } = useQuery({ queryKey: ["taxValues"], queryFn: fetchTax });
  const maamValue = toNum(taxArr?.[0]?.maamValue) || 17;

  const subtotal  = toNum(total);
  const taxTotal  = applyVat ? parseFloat((subtotal * (maamValue / 100)).toFixed(2)) : 0;
  const grandTotal = parseFloat((subtotal + taxTotal).toFixed(2));

  return (
    <div style={sBar.summaryBar} className="summary-bar">
      <div style={sBar.statItem}>
        <span style={sBar.statLabel}>סה"כ לפני מע"מ</span>
        <span style={{ ...sBar.statValue, color:"#374151" }}>{subtotal.toFixed(2)} ₪</span>
      </div>
      <div style={sBar.divider}/>
      {applyVat && (
        <>
          <div style={sBar.statItem}>
            <span style={sBar.statLabel}>מע"מ ({maamValue}%)</span>
            <span style={{ ...sBar.statValue, color:"#d97706", fontSize:"16px" }}>{taxTotal.toFixed(2)} ₪</span>
          </div>
          <div style={sBar.divider}/>
        </>
      )}
      <div style={sBar.statItem}>
        <span style={sBar.statLabel}>סה"כ {applyVat ? "כולל מע\"מ" : ""}</span>
        <span style={{ ...sBar.statValue, color:"#16a34a" }}>{grandTotal.toFixed(2)} ₪</span>
      </div>
      {applyVat && (
        <div style={{ marginRight:"auto" }}>
          <div style={{ fontSize:"11px", color:"#a3a3a3" }}>שיעור מע"מ</div>
          <div style={{ fontSize:"13px", fontWeight:"600", color:"#374151" }}>{maamValue}%</div>
        </div>
      )}
    </div>
  );
}
