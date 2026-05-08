import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api.js";
import VatSummaryBar from "../../components/ui/VatSummaryBar.jsx";
import toast from "react-hot-toast";

const fetchSales    = () => api.get("/sales").then(r => r.data.data);
const fetchExpenses = () => api.get("/expenses").then(r => r.data.data);
const fetchClients  = () => api.get("/clients").then(r => r.data.data);
const fetchTractor  = () => api.get("/tractorPrice").then(r => r.data.data);
const createSale    = (b) => api.post("/sales", b).then(r => r.data.data);
const updateSale    = ({ id, ...b }) => api.patch(`/sales/${id}`, b).then(r => r.data.data);
const deleteSale    = (id) => api.delete(`/sales/${id}`).then(r => r.data);

const toNum = (v) => parseFloat(v) || 0;

const s = {
  page:       { padding: "28px 32px", direction: "rtl" },
  topRow:     { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" },
  title:      { fontSize: "20px", fontWeight: "600", color: "#1a1a1a" },
  sub:        { fontSize: "13px", color: "#a3a3a3", marginTop: "3px" },
  btnPrimary: { display:"flex", alignItems:"center", gap:"7px", background:"#16a34a", color:"#fff", border:"none", borderRadius:"8px", padding:"9px 18px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", boxShadow:"0 2px 8px rgba(22,163,74,0.25)", transition:"all 0.15s" },
  searchWrap: { position:"relative", marginBottom:"20px" },
  searchInput:{ width:"100%", padding:"10px 16px 10px 40px", border:"1px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", background:"#fff", outline:"none", fontFamily:"inherit", color:"#1a1a1a", boxSizing:"border-box", transition:"border-color 0.15s" },
  searchIcon: { position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"#a3a3a3" },
  card:       { background:"#fff", borderRadius:"12px", border:"1px solid #f0f0ef", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" },
  table:      { width:"100%", borderCollapse:"collapse" },
  th:         { padding:"12px 16px", fontSize:"11px", fontWeight:"600", color:"#a3a3a3", textAlign:"right", letterSpacing:"0.06em", borderBottom:"1px solid #f0f0ef", background:"#fafaf9", textTransform:"uppercase" },
  td:         { padding:"13px 16px", fontSize:"14px", color:"#374151", borderBottom:"1px solid #f9f9f8", textAlign:"right" },
  iconBtn:    { background:"none", border:"none", cursor:"pointer", padding:"6px", borderRadius:"6px", display:"flex", alignItems:"center", color:"#a3a3a3", transition:"all 0.15s", fontFamily:"inherit" },
  overlay:    { position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"16px" },
  modal:      { background:"#fff", borderRadius:"16px", width:"100%", maxWidth:"580px", maxHeight:"90vh", overflowY:"auto", padding:"28px", boxShadow:"0 20px 60px rgba(0,0,0,0.15)", direction:"rtl" },
  modalTitle: { fontSize:"17px", fontWeight:"600", color:"#1a1a1a", marginBottom:"20px" },
  grid2:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" },
  formGroup:  { marginBottom:"14px" },
  label:      { display:"block", fontSize:"12px", fontWeight:"500", color:"#6b7280", marginBottom:"6px" },
  input:      { width:"100%", padding:"10px 13px", border:"1px solid #e5e7eb", borderRadius:"8px", fontSize:"14px", fontFamily:"inherit", color:"#1a1a1a", outline:"none", boxSizing:"border-box", transition:"border-color 0.15s" },
  select:     { width:"100%", padding:"10px 13px", border:"1px solid #e5e7eb", borderRadius:"8px", fontSize:"14px", fontFamily:"inherit", color:"#1a1a1a", outline:"none", background:"#fff", boxSizing:"border-box" },
  divider:    { borderTop:"1px solid #f0f0ef", margin:"18px 0" },
  totalBox:   { background:"#f0fdf4", border:"1px solid #86efac", borderRadius:"10px", padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"16px" },
  btnRow:     { display:"flex", gap:"10px", marginTop:"20px" },
  btnCancel:  { flex:1, padding:"10px", border:"1px solid #e5e7eb", borderRadius:"8px", background:"#fff", fontSize:"14px", fontWeight:"500", color:"#6b7280", cursor:"pointer", fontFamily:"inherit" },
  btnSave:    { flex:2, padding:"10px", border:"none", borderRadius:"8px", background:"#16a34a", fontSize:"14px", fontWeight:"600", color:"#fff", cursor:"pointer", fontFamily:"inherit" },
  badge:      { display:"inline-block", background:"#f0fdf4", color:"#16a34a", borderRadius:"6px", padding:"3px 10px", fontSize:"12px", fontWeight:"500" },
  productRow: { display:"flex", alignItems:"center", gap:"10px", padding:"10px 14px", background:"#fafaf9", borderRadius:"8px", marginBottom:"8px", border:"1px solid #f0f0ef" },
};

// ─── Autocomplete input ───────────────────────────────────────
function AutocompleteInput({ value, onChange, suggestions, placeholder, style }) {
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() =>
    suggestions.filter(s => s && s !== value && s.toLowerCase().includes(value.toLowerCase())),
    [suggestions, value]
  );

  return (
    <div style={{ position: "relative" }}>
      <input
        style={{ ...s.input, ...style }}
        value={value}
        placeholder={placeholder}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus2={e => e.target.style.borderColor = "#86efac"}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", right: 0, left: 0, zIndex: 99,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)", overflow: "hidden", marginTop: "4px",
        }}>
          {filtered.slice(0, 6).map((s, i) => (
            <div key={i}
              style={{ padding: "10px 14px", fontSize: "13px", cursor: "pointer", color: "#374151", borderBottom: i < filtered.length - 1 ? "1px solid #f5f5f4" : "none" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              onMouseDown={() => { onChange(s); setOpen(false); }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────
function SaleModal({ initial, onClose, onSave, loading, expenses, clients, tractorPriceDefault, pastPurposes }) {
  const isEdit = !!initial?._id;

  const [form, setForm] = useState({
    date:                initial?.date        || new Date().toISOString().split("T")[0],
    clientName:          initial?.clientName  || "",
    purpose:             initial?.purpose     || "",
    name:                initial?.name        || "",   // שם המטע
    strains:             initial?.strains     || "",
    quantity:            initial?.quantity    || "",   // דונמים
    water:               initial?.water       || "",
    quantitiesOfProduct: initial?.quantitiesOfProduct || {},
    pricesOfProducts:    initial?.pricesOfProducts    || {},
    product:             initial?.product     || [],
    tractorPrice:        tractorPriceDefault  || "",
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const setVal = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleProduct = (expense) => {
    const name = expense.name;
    const already = form.product.includes(name);
    if (already) {
      const newProds = form.product.filter(p => p !== name);
      const newQty = { ...form.quantitiesOfProduct };
      const newPrc = { ...form.pricesOfProducts };
      delete newQty[name]; delete newPrc[name];
      setForm(p => ({ ...p, product: newProds, quantitiesOfProduct: newQty, pricesOfProducts: newPrc }));
    } else {
      setForm(p => ({
        ...p,
        product: [...p.product, name],
        quantitiesOfProduct: { ...p.quantitiesOfProduct, [name]: "" },
        pricesOfProducts:    { ...p.pricesOfProducts,    [name]: 0  },
      }));
    }
  };

  const updateProductQty = (name, qty, unitPrice) => {
    const total = parseFloat((toNum(qty) * toNum(unitPrice)).toFixed(2));
    setForm(p => ({
      ...p,
      quantitiesOfProduct: { ...p.quantitiesOfProduct, [name]: qty },
      pricesOfProducts:    { ...p.pricesOfProducts,    [name]: total },
    }));
  };

  const materialsTotal = Object.values(form.pricesOfProducts).reduce((a, v) => a + toNum(v), 0);
  const tractorTotal   = toNum(form.quantity) * toNum(form.tractorPrice);
  const grandTotal     = parseFloat((materialsTotal + tractorTotal).toFixed(2));

  const handleSave = () => {
    if (!form.clientName) return toast.error("נא לבחור לקוח");
    if (!form.name)       return toast.error("נא להזין שם המטע");
    onSave({ ...form, number: parseFloat(materialsTotal.toFixed(2)), totalAmount: grandTotal });
  };

  const selectedExpenses   = expenses.filter(e => form.product.includes(e.name));
  const unselectedExpenses = expenses.filter(e => !form.product.includes(e.name));

  const focusStyle = { borderColor: "#86efac" };
  const blurStyle  = { borderColor: "#e5e7eb" };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal} className="modal-inner">
        <div style={s.modalTitle}>{isEdit ? "עריכת מכירה" : "הוספת מכירה חדשה"}</div>

        {/* תאריך + לקוח */}
        <div style={s.grid2} className="modal-grid2">
          <div style={s.formGroup}>
            <label style={s.label}>תאריך</label>
            <input style={s.input} type="date" value={form.date} onChange={set("date")}
              onFocus={e => e.target.style.borderColor = "#86efac"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>לקוח *</label>
            <select style={s.select} value={form.clientName} onChange={set("clientName")}>
              <option value="">בחר לקוח</option>
              {clients.map(c => <option key={c._id} value={c.clientName}>{c.clientName}</option>)}
            </select>
          </div>
        </div>

        {/* שם המטע + מטרה */}
        <div style={s.grid2} className="modal-grid2">
          <div style={s.formGroup}>
            <label style={s.label}>שם המטע *</label>
            <input style={s.input} placeholder="מטע תפוחים..." value={form.name} onChange={set("name")}
              onFocus={e => e.target.style.borderColor = "#86efac"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>מטרה</label>
            <AutocompleteInput
              value={form.purpose}
              onChange={v => setVal("purpose", v)}
              suggestions={pastPurposes}
              placeholder="ריסוס, דישון..."
            />
          </div>
        </div>

        {/* זן + מים */}
        <div style={s.grid2} className="modal-grid2">
          <div style={s.formGroup}>
            <label style={s.label}>זן / אצות</label>
            <input style={s.input} placeholder="-" value={form.strains} onChange={set("strains")}
              onFocus={e => e.target.style.borderColor = "#86efac"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>מים (ליטר)</label>
            <input style={s.input} type="number" placeholder="0" value={form.water} onChange={set("water")}
              onFocus={e => e.target.style.borderColor = "#86efac"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
          </div>
        </div>

        <div style={s.divider} />

        {/* חומרי ריסוס */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ ...s.label, fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "10px" }}>
            🧪 חומרי ריסוס
          </label>

          {selectedExpenses.map(exp => (
            <div key={exp._id} style={s.productRow}>
              <button onClick={() => toggleProduct(exp)}
                style={{ ...s.iconBtn, color: "#e11d48", flexShrink: 0 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <span style={{ flex: 1, fontSize: "13px", fontWeight: "500", color: "#1a1a1a" }}>{exp.name}</span>
              <span style={{ fontSize: "12px", color: "#a3a3a3", flexShrink: 0 }}>{toNum(exp.number)} ₪/יח׳</span>
              <input type="number" placeholder="כמות"
                value={form.quantitiesOfProduct[exp.name] || ""}
                onChange={e => updateProductQty(exp.name, e.target.value, exp.number)}
                style={{ width: "80px", padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", textAlign: "center", outline: "none", fontFamily: "inherit" }}
                onFocus={e => e.target.style.borderColor = "#86efac"} onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#16a34a", minWidth: "64px", textAlign: "left" }}>
                {toNum(form.pricesOfProducts[exp.name]).toFixed(2)} ₪
              </span>
            </div>
          ))}

          {unselectedExpenses.length > 0 && (
            <select
              key={form.product.length}
              style={{ ...s.select, color: "#6b7280", marginTop: selectedExpenses.length ? "8px" : "0" }}
              defaultValue=""
              onChange={e => {
                const found = expenses.find(ex => ex._id === e.target.value);
                if (found) toggleProduct(found);
                e.target.value = "";
              }}>
              <option value="">+ הוסף חומר ריסוס</option>
              {unselectedExpenses.map(e => (
                <option key={e._id} value={e._id}>{e.name} — {toNum(e.number)} ₪</option>
              ))}
            </select>
          )}

          {expenses.length === 0 && (
            <div style={{ padding: "12px 14px", background: "#fffbeb", borderRadius: "8px", fontSize: "12px", color: "#92400e", border: "1px solid #fde68a" }}>
              ⚠️ אין חומרים ברשימה — הוסף חומרים בעמוד ההוצאות תחילה
            </div>
          )}
        </div>

        <div style={s.divider} />

        {/* טרקטור */}
        <label style={{ ...s.label, fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "12px", display: "block" }}>
          🚜 עבודת טרקטור
        </label>
        <div style={s.grid2} className="modal-grid2">
          <div style={s.formGroup}>
            <label style={s.label}>שטח (דונמים)</label>
            <input style={s.input} type="number" placeholder="0" value={form.quantity} onChange={set("quantity")}
              onFocus={e => e.target.style.borderColor = "#86efac"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>מחיר לדונם (₪)</label>
            <input style={s.input} type="number" placeholder="0" value={form.tractorPrice} onChange={set("tractorPrice")}
              onFocus={e => e.target.style.borderColor = "#86efac"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
          </div>
        </div>

        {/* סה"כ */}
        <div style={s.totalBox}>
          <div>
            <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>פירוט</div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              חומרים: {materialsTotal.toFixed(2)} ₪
              {toNum(form.quantity) > 0 && <span> &nbsp;+&nbsp; טרקטור: {tractorTotal.toFixed(2)} ₪</span>}
            </div>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "11px", color: "#16a34a", marginBottom: "2px" }}>סה"כ לפני מע"מ</div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#16a34a" }}>{grandTotal.toFixed(2)} ₪</div>
          </div>
        </div>

        <div style={s.btnRow}>
          <button style={s.btnCancel} onClick={onClose}>ביטול</button>
          <button style={s.btnSave} disabled={loading} onClick={handleSave}>
            {loading ? "שומר..." : isEdit ? "עדכן מכירה" : "הוסף מכירה"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function SalesPage() {
  const qc = useQueryClient();
  const [search, setSearch]         = useState("");
  const [modal, setModal]           = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);

  const { data: sales    = [] } = useQuery({ queryKey: ["sales"],        queryFn: fetchSales });
  const { data: expenses = [] } = useQuery({ queryKey: ["expenses"],     queryFn: fetchExpenses });
  const { data: clients  = [] } = useQuery({ queryKey: ["clients"],      queryFn: fetchClients });
  const { data: tractorArr= []} = useQuery({ queryKey: ["tractorPrice"], queryFn: fetchTractor });

  const tractorPrice  = toNum(tractorArr?.[0]?.price);
  // collect unique past purposes for autocomplete
  const pastPurposes  = useMemo(() => [...new Set(sales.map(s => s.purpose).filter(Boolean))], [sales]);
  const totalRevenue  = sales.reduce((a, r) => a + toNum(r.totalAmount), 0);

  const addMut  = useMutation({ mutationFn: createSale,
    onSuccess: () => { qc.invalidateQueries(["sales"]); toast.success("מכירה נוספה"); setModal(null); },
    onError: e => toast.error(e.response?.data?.message || "שגיאה") });
  const editMut = useMutation({ mutationFn: updateSale,
    onSuccess: () => { qc.invalidateQueries(["sales"]); toast.success("מכירה עודכנה"); setModal(null); },
    onError: e => toast.error(e.response?.data?.message || "שגיאה") });
  const delMut  = useMutation({ mutationFn: deleteSale,
    onSuccess: () => { qc.invalidateQueries(["sales"]); toast.success("מכירה נמחקה"); setDelConfirm(null); },
    onError: e => toast.error(e.response?.data?.message || "שגיאה") });

  const handleSave = (form) => {
    if (modal?._id) editMut.mutate({ id: modal._id, ...form });
    else addMut.mutate(form);
  };

  const filtered = sales.filter(s =>
    s.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.purpose?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={s.page} className="page-pad">
      <div style={s.topRow} className="top-row">
        <div>
          <div style={s.title}>מכירות</div>
          <div style={s.sub}>
            {sales.length} עבודות &nbsp;|&nbsp;
            סה"כ: <strong style={{ color: "#16a34a" }}>{totalRevenue.toFixed(2)} ₪</strong>
          </div>
        </div>
        <button style={s.btnPrimary} onClick={() => setModal("add")}
          onMouseEnter={e => e.currentTarget.style.background = "#15803d"}
          onMouseLeave={e => e.currentTarget.style.background = "#16a34a"}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          הוסף מכירה
        </button>
      </div>

      {/* VAT Summary */}
      <VatSummaryBar total={totalRevenue} applyVat={true} label='סה"כ מכירות' />

      <div style={s.searchWrap}>
        <span style={s.searchIcon}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input style={s.searchInput} placeholder="חיפוש לפי לקוח, שם מטע, מטרה..."
          value={search} onChange={e => setSearch(e.target.value)}
          onFocus={e => e.target.style.borderColor = "#86efac"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
      </div>

      <div style={s.card}>
        {filtered.length === 0 ? (
          <div style={{ padding: "56px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>💰</div>
            <div style={{ fontSize: "15px", fontWeight: "500", color: "#525252" }}>
              {search ? "לא נמצאו תוצאות" : "אין מכירות עדיין"}
            </div>
            {!search && <div style={{ fontSize: "13px", color: "#a3a3a3", marginTop: "6px" }}>לחץ על 'הוסף מכירה' להתחלה</div>}
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {["תאריך","לקוח","שם מטע","מטרה","דונמים","חומרים","סה\"כ",""].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((sale, i) => (
                <tr key={sale._id}
                  style={{ background: i % 2 === 0 ? "#fff" : "#fefefe" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f9fdf9"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fefefe"}>
                  <td style={{ ...s.td, fontSize: "13px", color: "#6b7280" }}>{sale.date}</td>
                  <td style={{ ...s.td, fontWeight: "500", color: "#1a1a1a" }}>{sale.clientName}</td>
                  <td style={s.td}>{sale.name}</td>
                  <td style={s.td}>{sale.purpose ? <span style={s.badge}>{sale.purpose}</span> : "—"}</td>
                  <td style={s.td}>{toNum(sale.quantity) > 0 ? `${sale.quantity} ד'` : "—"}</td>
                  <td style={{ ...s.td, fontSize: "12px", color: "#6b7280" }}>
                    {sale.product?.length > 0 ? `${sale.product.length} חומרים` : "—"}
                  </td>
                  <td style={{ ...s.td, fontWeight: "700", color: "#16a34a" }}>
                    {toNum(sale.totalAmount).toFixed(2)} ₪
                  </td>
                  <td style={{ ...s.td, width: "80px" }}>
                    <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                      <button style={s.iconBtn} onClick={() => setModal(sale)}
                        onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.color = "#16a34a"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#a3a3a3"; }}>
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button style={s.iconBtn} onClick={() => setDelConfirm(sale)}
                        onMouseEnter={e => { e.currentTarget.style.background = "#fff1f2"; e.currentTarget.style.color = "#e11d48"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#a3a3a3"; }}>
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <SaleModal
          initial={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          loading={addMut.isPending || editMut.isPending}
          expenses={expenses}
          clients={clients}
          tractorPriceDefault={tractorPrice}
          pastPurposes={pastPurposes}
        />
      )}

      {delConfirm && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setDelConfirm(null)}>
          <div style={{ ...s.modal, maxWidth: "360px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🗑️</div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1a1a1a", marginBottom: "8px" }}>מחיקת מכירה</div>
            <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>
              האם למחוק את <strong>{delConfirm.name}</strong> עבור <strong>{delConfirm.clientName}</strong>?
            </div>
            <div style={s.btnRow}>
              <button style={s.btnCancel} onClick={() => setDelConfirm(null)}>ביטול</button>
              <button style={{ ...s.btnSave, background: "#e11d48" }} disabled={delMut.isPending}
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
