import { useQuery } from "@tanstack/react-query";
import api from "../../services/api.js";

const fetchTax = () => api.get("/taxValues").then(r => r.data.data);
const toNum = (v) => parseFloat(v) || 0;

const fmt = (n) =>
  new Intl.NumberFormat("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export default function VatSummaryBar({ total, applyVat = true, label = 'סה"כ' }) {
  const { data: taxArr = [] } = useQuery({ queryKey: ["taxValues"], queryFn: fetchTax });
  const maam = toNum(taxArr?.[0]?.maamValue) || 17;

  const beforeVat = toNum(total);
  const vatAmount = applyVat ? parseFloat((beforeVat * (maam / 100)).toFixed(2)) : 0;
  const afterVat  = parseFloat((beforeVat + vatAmount).toFixed(2));

  return (
    <div style={{
      background: "#fff",
      borderRadius: "12px",
      border: "1px solid #f0f0ef",
      padding: "14px 20px",
      marginBottom: "20px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "12px",
      direction: "rtl",
    }}>
      {/* Label */}
      <div style={{ fontSize:"13px", fontWeight:"600", color:"#374151" }}>
        {label}
      </div>

      {/* Formula */}
      <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap", fontSize:"14px" }}>
        {/* Before VAT */}
        <span style={{ color:"#374151", fontWeight:"500" }}>
          {fmt(beforeVat)} ₪ <span style={{ fontSize:"11px", color:"#a3a3a3", fontWeight:"400" }}>לפני מע"מ</span>
        </span>

        {applyVat && (
          <>
            <span style={{ color:"#a3a3a3", fontSize:"12px" }}>+</span>

            {/* VAT */}
            <span style={{ color:"#d97706", fontWeight:"500" }}>
              {maam}% מע"מ
              <span style={{ fontSize:"12px", color:"#d97706", fontWeight:"400" }}>
                {" "}({fmt(vatAmount)} ₪)
              </span>
            </span>

            <span style={{ color:"#a3a3a3", fontSize:"12px" }}>=</span>
          </>
        )}

        {/* Total */}
        <div style={{
          background: "#f0fdf4",
          border: "1px solid #86efac",
          borderRadius: "8px",
          padding: "4px 14px",
          fontSize: "16px",
          fontWeight: "700",
          color: "#16a34a",
        }}>
          {fmt(afterVat)} ₪
        </div>
      </div>
    </div>
  );
}
