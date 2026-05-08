import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api.js";
import VatSummaryBar from "../../components/ui/VatSummaryBar.jsx";
import toast from "react-hot-toast";

const fetchExpenses  = () => api.get("/expenses").then(r => r.data.data);
const fetchTaxValues = () => api.get("/taxValues").then(r => r.data.data);
const createExpense  = (b) => api.post("/expenses", b).then(r => r.data.data);
const updateExpense  = ({ id, ...b }) => api.patch(`/expenses/${id}`, b).then(r => r.data.data);
const deleteExpense  = (id) => api.delete(`/expenses/${id}`).then(r => r.data);

const toNum = (v) => parseFloat(v) || 0;

const s = {
  page:       { padding: "28px 32px", direction: "rtl" },
  topRow:     { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" },
  title:      { fontSize: "20px", fontWeight: "600", color: "#1a1a1a" },
  sub:        { fontSize: "13px", color: "#a3a3a3", marginTop: "3px" },
  btnPrimary: { display:"flex", alignItems:"center", gap:"7px", background:"#16a34a", color:"#fff", border:"none", borderRadius:"8px", padding:"9px 18px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", boxShadow:"0 2px 8px rgba(22,163,74,0.25)", transition:"all 0.15s" },
  searchWrap: { position:"relative", marginBottom:"20px" },
  searchInput:{ width:"100%", padding:"10px 16px 10px 40px", border:"1px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", background:"#fff", outline:"none", fontFamily:"inherit", color:"#1a1a1a", boxSizing:"border-box" },
  searchIcon: { position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"#a3a3a3" },
  card:       { background:"#fff", borderRadius:"12px", border:"1px solid #f0f0ef", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" },
  table:      { width:"100%", borderCollapse:"collapse" },
  th:         { padding:"12px 16px", fontSize:"11px", fontWeight:"600", color:"#a3a3a3", textAlign:"right", letterSpacing:"0.06em", borderBottom:"1px solid #f0f0ef", background:"#fafaf9", textTransform:"uppercase" },
  td:         { padding:"12px 16px", fontSize:"14px", color:"#374151", borderBottom:"1px solid #f9f9f8", textAlign:"right" },
  iconBtn:    { background:"none", border:"none", cursor:"pointer", padding:"6px", borderRadius:"6px", display:"flex", alignItems:"center", color:"#a3a3a3", transition:"all 0.15s", fontFamily:"inherit" },
  overlay:    { position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"16px" },
  modal:      { background:"#fff", borderRadius:"16px", width:"100%", maxWidth:"480px", padding:"28px", boxShadow:"0 20px 60px rgba(0,0,0,0.15)", direction:"rtl" },
  modalTitle: { fontSize:"17px", fontWeight:"600", color:"#1a1a1a", marginBottom:"20px" },
  grid2:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" },
  formGroup:  { marginBottom:"14px" },
  label:      { display:"block", fontSize:"12px", fontWeight:"500", color:"#6b7280", marginBottom:"6px" },
  input:      { width:"100%", padding:"10px 13px", border:"1px solid #e5e7eb", borderRadius:"8px", fontSize:"14px", fontFamily:"inherit", color:"#1a1a1a", outline:"none", boxSizing:"border-box", transition:"border-color 0.15s" },
  totalPreview:{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:"8px", padding:"12px 16px", marginBottom:"14px", display:"flex", justifyContent:"space-between", alignItems:"center" },
  btnRow:     { display:"flex", gap:"10px", marginTop:"20px" },
  btnCancel:  { flex:1, padding:"10px", border:"1px solid #e5e7eb", borderRadius:"8px", background:"#fff", fontSize:"14px", fontWeight:"500", color:"#6b7280", cursor:"pointer", fontFamily:"inherit" },
  btnSave:    { flex:2, padding:"10px", border:"none", borderRadius:"8px", background:"#16a34a", fontSize:"14px", fontWeight:"600", color:"#fff", cursor:"pointer", fontFamily:"inherit" },
  summaryBar: { background:"#fff", borderRadius:"12px", border:"1px solid #f0f0ef", padding:"18px 24px", marginBottom:"16px", display:"flex", gap:"32px", alignItems:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", flexWrap:"wrap" },
  statItem:   { display:"flex", flexDirection:"column", gap:"3px" },
  statLabel:  { fontSize:"11px", color:"#a3a3a3", fontWeight:"500", letterSpacing:"0.04em", textTransform:"uppercase" },
  statValue:  { fontSize:"18px", fontWeight:"700", color:"#1a1a1a" },
};

const fo = (e) => { e.target.style.borderColor = "#86efac"; };
const bl = (e) => { e.target.style.borderColor = "#e5e7eb"; };

// ─── Modal ────────────────────────────────────────────────────
function ExpenseModal({ initial, onClose, onSave, loading, maamValue }) {
  const isEdit = !!initial?._id;
  const [form, setForm] = useState({
    date:        initial?.date        || new Date().toISOString().split("T")[0],
    name:        initial?.name        || "",
    number:      initial?.number      || "",   // מחיר יחידה
    quantity:    initial?.quantity    || "",   // נפח / כמות
    tax:         initial?.tax         ?? true,
  });

  const set  = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const setB = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.checked }));

  const subtotal   = parseFloat((toNum(form.number) * toNum(form.quantity)).toFixed(2));
  const taxAmount  = form.tax ? parseFloat((subtotal * (toNum(maamValue) / 100)).toFixed(2)) : 0;
  const grandTotal = parseFloat((subtotal + taxAmount).toFixed(2));

  const handleSave = () => {
    if (!form.name.trim())         return toast.error("נא להזין שם החומר");
    if (!toNum(form.number))       return toast.error("נא להזין מחיר");
    if (!toNum(form.quantity))     return toast.error("נא להזין נפח/כמות");
    onSave({ ...form, totalAmount: subtotal });
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal} className="modal-inner">
        <div style={s.modalTitle}>{isEdit ? "עריכת הוצאה" : "הוספת הוצאה חדשה"}</div>

        {/* תאריך + שם */}
        <div style={s.grid2} className="modal-grid2">
          <div style={s.formGroup}>
            <label style={s.label}>תאריך</label>
            <input style={s.input} type="date" value={form.date} onChange={set("date")} onFocus={fo} onBlur={bl}/>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>שם החומר *</label>
            <input style={s.input} placeholder="גלגלית, דשן..." value={form.name} onChange={set("name")} onFocus={fo} onBlur={bl}/>
          </div>
        </div>

        {/* מחיר + נפח */}
        <div style={s.grid2} className="modal-grid2">
          <div style={s.formGroup}>
            <label style={s.label}>מחיר ליחידה (₪)</label>
            <input style={s.input} type="number" placeholder="0.00" value={form.number} onChange={set("number")} onFocus={fo} onBlur={bl}/>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>נפח / כמות</label>
            <input style={s.input} type="number" placeholder="0" value={form.quantity} onChange={set("quantity")} onFocus={fo} onBlur={bl}/>
          </div>
        </div>

        {/* מע"מ toggle */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px", padding:"12px 14px", background:"#fafaf9", borderRadius:"8px", border:"1px solid #f0f0ef" }}>
          <label style={{ position:"relative", width:"36px", height:"20px", flexShrink:0 }}>
            <input type="checkbox" checked={form.tax} onChange={setB("tax")}
              style={{ opacity:0, width:0, height:0, position:"absolute" }}/>
            <span style={{
              position:"absolute", inset:0, borderRadius:"20px", cursor:"pointer", transition:"0.2s",
              background: form.tax ? "#16a34a" : "#d1d5db",
            }}/>
            <span style={{
              position:"absolute", top:"2px", right: form.tax ? "2px" : "18px",
              width:"16px", height:"16px", borderRadius:"50%", background:"#fff",
              transition:"0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)",
            }}/>
          </label>
          <div>
            <div style={{ fontSize:"13px", fontWeight:"500", color:"#374151" }}>
              כולל מע"מ ({maamValue}%)
            </div>
            <div style={{ fontSize:"11px", color:"#a3a3a3" }}>
              {form.tax ? `מע"מ: ${taxAmount.toFixed(2)} ₪` : "ללא מע\"מ"}
            </div>
          </div>
        </div>

        {/* תצוגת סה"כ */}
        {(toNum(form.number) > 0 && toNum(form.quantity) > 0) && (
          <div style={s.totalPreview}>
            <div style={{ fontSize:"12px", color:"#6b7280" }}>
              {toNum(form.quantity)} × {toNum(form.number).toFixed(2)} ₪
              {form.tax && <span> + {maamValue}% מע"מ</span>}
            </div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:"11px", color:"#16a34a" }}>סה"כ</div>
              <div style={{ fontSize:"18px", fontWeight:"700", color:"#16a34a" }}>{grandTotal.toFixed(2)} ₪</div>
            </div>
          </div>
        )}

        <div style={s.btnRow}>
          <button style={s.btnCancel} onClick={onClose}>ביטול</button>
          <button style={s.btnSave} disabled={loading} onClick={handleSave}>
            {loading ? "שומר..." : isEdit ? "עדכן" : "הוסף הוצאה"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function ExpensesPage() {
  const qc = useQueryClient();
  const [search, setSearch]         = useState("");
  const [modal, setModal]           = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);

  const { data: expenses  = [] } = useQuery({ queryKey: ["expenses"],  queryFn: fetchExpenses });
  const { data: taxArr    = [] } = useQuery({ queryKey: ["taxValues"], queryFn: fetchTaxValues });

  const maamValue = toNum(taxArr?.[0]?.maamValue) || 17;

  const addMut  = useMutation({ mutationFn: createExpense,
    onSuccess: () => { qc.invalidateQueries(["expenses"]); toast.success("הוצאה נוספה"); setModal(null); },
    onError: e => toast.error(e.response?.data?.message || "שגיאה") });
  const editMut = useMutation({ mutationFn: updateExpense,
    onSuccess: () => { qc.invalidateQueries(["expenses"]); toast.success("הוצאה עודכנה"); setModal(null); },
    onError: e => toast.error(e.response?.data?.message || "שגיאה") });
  const delMut  = useMutation({ mutationFn: deleteExpense,
    onSuccess: () => { qc.invalidateQueries(["expenses"]); toast.success("הוצאה נמחקה"); setDelConfirm(null); },
    onError: e => toast.error(e.response?.data?.message || "שגיאה") });

  const handleSave = (form) => {
    if (modal?._id) editMut.mutate({ id: modal._id, ...form });
    else addMut.mutate(form);
  };

  const filtered = expenses.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Summary calculations ──────────────────────────────────
  const subtotal   = expenses.reduce((a, e) => a + toNum(e.totalAmount), 0);
  const taxTotal   = expenses.reduce((a, e) =>
    a + (e.tax ? toNum(e.totalAmount) * (maamValue / 100) : 0), 0);
  const grandTotal = subtotal + taxTotal;

  return (
    <div style={s.page} className="page-pad">

      {/* Top */}
      <div style={s.topRow} className="top-row">
        <div>
          <div style={s.title}>הוצאות</div>
          <div style={s.sub}>{expenses.length} פריטים</div>
        </div>
        <button style={s.btnPrimary} onClick={() => setModal("add")}
          onMouseEnter={e => e.currentTarget.style.background = "#15803d"}
          onMouseLeave={e => e.currentTarget.style.background = "#16a34a"}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          הוסף הוצאה
        </button>
      </div>

      {/* VAT Summary */}
      <VatSummaryBar total={subtotal} applyVat={true} label='סה"כ הוצאות' />

      {/* Summary bar */}
      <div style={s.summaryBar} className="summary-bar">
        <div style={s.statItem}>
          <span style={s.statLabel}>סה"כ לפני מע"מ</span>
          <span style={{ ...s.statValue, color:"#374151" }}>{subtotal.toFixed(2)} ₪</span>
        </div>
        <div style={{ width:"1px", background:"#f0f0ef", alignSelf:"stretch" }}/>
        <div style={s.statItem}>
          <span style={s.statLabel}>מע"מ ({maamValue}%)</span>
          <span style={{ ...s.statValue, color:"#d97706", fontSize:"16px" }}>{taxTotal.toFixed(2)} ₪</span>
        </div>
        <div style={{ width:"1px", background:"#f0f0ef", alignSelf:"stretch" }}/>
        <div style={s.statItem}>
          <span style={s.statLabel}>סה"כ כולל מע"מ</span>
          <span style={{ ...s.statValue, color:"#16a34a" }}>{grandTotal.toFixed(2)} ₪</span>
        </div>
        <div style={{ marginRight:"auto" }}>
          <div style={{ fontSize:"11px", color:"#a3a3a3" }}>שיעור מע"מ</div>
          <div style={{ fontSize:"13px", fontWeight:"600", color:"#374151" }}>{maamValue}%</div>
        </div>
      </div>

      {/* Search */}
      <div style={s.searchWrap}>
        <span style={s.searchIcon}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input style={s.searchInput} placeholder="חיפוש לפי שם החומר..."
          value={search} onChange={e => setSearch(e.target.value)}
          onFocus={fo} onBlur={bl}/>
      </div>

      {/* Table */}
      <div style={s.card}>
        {filtered.length === 0 ? (
          <div style={{ padding:"56px", textAlign:"center" }}>
            <div style={{ fontSize:"32px", marginBottom:"12px" }}>📦</div>
            <div style={{ fontSize:"15px", fontWeight:"500", color:"#525252" }}>
              {search ? "לא נמצאו תוצאות" : "אין הוצאות עדיין"}
            </div>
            {!search && <div style={{ fontSize:"13px", color:"#a3a3a3", marginTop:"6px" }}>לחץ על 'הוסף הוצאה' להתחלה</div>}
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {["תאריך","שם החומר","מחיר ליחידה","נפח/כמות","מע\"מ","סה\"כ",""].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp, i) => {
                const sub     = toNum(exp.totalAmount);
                const tax     = exp.tax ? sub * (maamValue / 100) : 0;
                const total   = sub + tax;
                return (
                  <tr key={exp._id}
                    style={{ background: i % 2 === 0 ? "#fff" : "#fefefe" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f9fdf9"}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fefefe"}>
                    <td style={{ ...s.td, fontSize:"13px", color:"#6b7280" }}>{exp.date}</td>
                    <td style={{ ...s.td, fontWeight:"500", color:"#1a1a1a" }}>{exp.name}</td>
                    <td style={s.td}>{toNum(exp.number).toFixed(2)} ₪</td>
                    <td style={s.td}>{toNum(exp.quantity)}</td>
                    <td style={s.td}>
                      {exp.tax
                        ? <span style={{ background:"#fffbeb", color:"#d97706", borderRadius:"6px", padding:"2px 8px", fontSize:"12px", fontWeight:"500" }}>+{tax.toFixed(2)} ₪</span>
                        : <span style={{ color:"#a3a3a3", fontSize:"12px" }}>פטור</span>}
                    </td>
                    <td style={{ ...s.td, fontWeight:"700", color:"#1a1a1a" }}>
                      {total.toFixed(2)} ₪
                    </td>
                    <td style={{ ...s.td, width:"80px" }}>
                      <div style={{ display:"flex", gap:"4px", justifyContent:"flex-end" }}>
                        <button style={s.iconBtn} onClick={() => setModal(exp)}
                          onMouseEnter={e => { e.currentTarget.style.background="#f0fdf4"; e.currentTarget.style.color="#16a34a"; }}
                          onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color="#a3a3a3"; }}>
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button style={s.iconBtn} onClick={() => setDelConfirm(exp)}
                          onMouseEnter={e => { e.currentTarget.style.background="#fff1f2"; e.currentTarget.style.color="#e11d48"; }}
                          onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color="#a3a3a3"; }}>
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <ExpenseModal
          initial={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          loading={addMut.isPending || editMut.isPending}
          maamValue={maamValue}
        />
      )}

      {delConfirm && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setDelConfirm(null)}>
          <div style={{ ...s.modal, maxWidth:"360px", textAlign:"center" }}>
            <div style={{ fontSize:"32px", marginBottom:"12px" }}>🗑️</div>
            <div style={{ fontSize:"16px", fontWeight:"600", color:"#1a1a1a", marginBottom:"8px" }}>מחיקת הוצאה</div>
            <div style={{ fontSize:"13px", color:"#6b7280", marginBottom:"24px" }}>
              האם למחוק את <strong>{delConfirm.name}</strong>?
            </div>
            <div style={s.btnRow}>
              <button style={s.btnCancel} onClick={() => setDelConfirm(null)}>ביטול</button>
              <button style={{ ...s.btnSave, background:"#e11d48" }} disabled={delMut.isPending}
                onClick={() => delMut.mutate(delConfirm._id)}>
                {delMut.isPending ? "מוחק..." : "מחק"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
