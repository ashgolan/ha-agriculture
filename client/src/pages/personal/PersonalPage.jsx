import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api.js";
import toast from "react-hot-toast";

// ─── API ──────────────────────────────────────────────────────
const endpoints = {
  personalSales:           "/personalSales",
  personalWorkers:         "/personalWorkers",
  personalRkrExpenses:     "/personalRkrExpenses",
  personalProductExpenses: "/personalProductExpenses",
  personalInvestments:     "/personalInvestments",
};

const fetchAll  = (ep) => () => api.get(ep).then(r => r.data.data);
const toNum     = (v) => parseFloat(v) || 0;
const today     = () => new Date().toISOString().split("T")[0];

// ─── Styles ───────────────────────────────────────────────────
const s = {
  page:       { padding: "28px 32px", direction: "rtl" },
  title:      { fontSize: "20px", fontWeight: "600", color: "#1a1a1a", marginBottom: "4px" },
  sub:        { fontSize: "13px", color: "#a3a3a3", marginBottom: "20px" },
  tabs:       { display: "flex", gap: "4px", marginBottom: "20px", borderBottom: "1px solid #f0f0ef", paddingBottom: "0" },
  tab:        { padding: "10px 16px", border: "none", background: "transparent", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "inherit", borderBottom: "2px solid transparent", transition: "all 0.15s", color: "#6b7280", marginBottom: "-1px" },
  tabActive:  { color: "#16a34a", borderBottomColor: "#16a34a", fontWeight: "600" },
  topRow:     { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" },
  secTitle:   { fontSize: "15px", fontWeight: "600", color: "#374151" },
  count:      { fontSize: "12px", color: "#a3a3a3", fontWeight: "400" },
  btnPrimary: { display:"flex", alignItems:"center", gap:"7px", background:"#16a34a", color:"#fff", border:"none", borderRadius:"8px", padding:"9px 16px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" },
  card:       { background:"#fff", borderRadius:"12px", border:"1px solid #f0f0ef", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" },
  table:      { width:"100%", borderCollapse:"collapse" },
  th:         { padding:"11px 14px", fontSize:"11px", fontWeight:"600", color:"#a3a3a3", textAlign:"right", letterSpacing:"0.06em", borderBottom:"1px solid #f0f0ef", background:"#fafaf9", textTransform:"uppercase" },
  td:         { padding:"11px 14px", fontSize:"13px", color:"#374151", borderBottom:"1px solid #f9f9f8", textAlign:"right" },
  iconBtn:    { background:"none", border:"none", cursor:"pointer", padding:"5px", borderRadius:"6px", display:"flex", alignItems:"center", color:"#a3a3a3", transition:"all 0.15s" },
  totalRow:   { background:"#f0fdf4", padding:"11px 14px", fontSize:"13px", fontWeight:"600", color:"#16a34a", textAlign:"left", borderTop:"1px solid #e5e7eb" },
  summaryBar: { background:"#fff", borderRadius:"12px", border:"1px solid #f0f0ef", padding:"18px 24px", marginBottom:"16px", display:"flex", gap:"32px", alignItems:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", flexWrap:"wrap" },
  statItem:   { display:"flex", flexDirection:"column", gap:"3px" },
  statLabel:  { fontSize:"11px", color:"#a3a3a3", fontWeight:"500", letterSpacing:"0.04em", textTransform:"uppercase" },
  statValue:  { fontSize:"18px", fontWeight:"700", color:"#1a1a1a" },
  empty:      { padding:"48px", textAlign:"center", fontSize:"14px", color:"#a3a3a3" },
  overlay:    { position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"16px" },
  modal:      { background:"#fff", borderRadius:"16px", width:"100%", maxWidth:"560px", maxHeight:"90vh", overflowY:"auto", padding:"24px", boxShadow:"0 20px 60px rgba(0,0,0,0.15)", direction:"rtl" },
  modalTitle: { fontSize:"16px", fontWeight:"600", color:"#1a1a1a", marginBottom:"18px" },
  grid2:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" },
  fg:         { marginBottom:"12px" },
  label:      { display:"block", fontSize:"12px", fontWeight:"500", color:"#6b7280", marginBottom:"5px" },
  input:      { width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:"8px", fontSize:"14px", fontFamily:"inherit", color:"#1a1a1a", outline:"none", boxSizing:"border-box", transition:"border-color 0.15s" },
  select:     { width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:"8px", fontSize:"14px", fontFamily:"inherit", color:"#1a1a1a", outline:"none", background:"#fff", boxSizing:"border-box" },
  divider:    { borderTop:"1px solid #f0f0ef", margin:"14px 0" },
  productRow: { display:"flex", alignItems:"center", gap:"8px", padding:"9px 12px", background:"#fafaf9", borderRadius:"8px", marginBottom:"6px", border:"1px solid #f0f0ef" },
  totalBox:   { background:"#f0fdf4", border:"1px solid #86efac", borderRadius:"8px", padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"12px" },
  btnRow:     { display:"flex", gap:"10px", marginTop:"18px" },
  btnCancel:  { flex:1, padding:"10px", border:"1px solid #e5e7eb", borderRadius:"8px", background:"#fff", fontSize:"13px", fontWeight:"500", color:"#6b7280", cursor:"pointer", fontFamily:"inherit" },
  btnSave:    { flex:2, padding:"10px", border:"none", borderRadius:"8px", background:"#16a34a", fontSize:"13px", fontWeight:"600", color:"#fff", cursor:"pointer", fontFamily:"inherit" },
};

const fo = (e) => { e.target.style.borderColor = "#86efac"; };
const bl = (e) => { e.target.style.borderColor = "#e5e7eb"; };

// ─── Generic Table ────────────────────────────────────────────
function GenericTable({ data, cols, onEdit, onDel }) {
  if (!data.length) return (
    <div style={s.empty}><div style={{ fontSize:"28px", marginBottom:"8px" }}>📂</div>אין נתונים עדיין</div>
  );
  const total = data.reduce((a, r) => a + toNum(r.totalAmount), 0);
  return (
    <div style={s.card}>
      <table style={s.table}>
        <thead><tr>
          {cols.map(c => <th key={c.key} style={s.th}>{c.label}</th>)}
          <th style={s.th}></th>
        </tr></thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row._id}
              style={{ background: i%2===0?"#fff":"#fefefe" }}
              onMouseEnter={e=>e.currentTarget.style.background="#f9fdf9"}
              onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#fefefe"}>
              {cols.map(c => (
                <td key={c.key} style={{ ...s.td, ...(c.style||{}) }}>
                  {c.render ? c.render(row) : (row[c.key] ?? "—")}
                </td>
              ))}
              <td style={{ ...s.td, width:"70px" }}>
                <div style={{ display:"flex", gap:"3px", justifyContent:"flex-end" }}>
                  <button style={s.iconBtn} onClick={() => onEdit(row)}
                    onMouseEnter={e=>{e.currentTarget.style.background="#f0fdf4";e.currentTarget.style.color="#16a34a";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="#a3a3a3";}}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button style={s.iconBtn} onClick={() => onDel(row)}
                    onMouseEnter={e=>{e.currentTarget.style.background="#fff1f2";e.currentTarget.style.color="#e11d48";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="#a3a3a3";}}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={s.totalRow}>סה"כ: {total.toFixed(2)} ₪</div>
    </div>
  );
}

// ─── Del confirm ──────────────────────────────────────────────
function DelConfirm({ item, onClose, onDel, loading }) {
  return (
    <div style={s.overlay} onClick={e => e.target===e.currentTarget&&onClose()}>
      <div style={{ ...s.modal, maxWidth:"340px", textAlign:"center" }}>
        <div style={{ fontSize:"28px", marginBottom:"10px" }}>🗑️</div>
        <div style={{ fontSize:"15px", fontWeight:"600", marginBottom:"8px" }}>מחיקה</div>
        <div style={{ fontSize:"13px", color:"#6b7280", marginBottom:"20px" }}>האם למחוק <strong>{item?.name || item?.clientName}</strong>?</div>
        <div style={s.btnRow}>
          <button style={s.btnCancel} onClick={onClose}>ביטול</button>
          <button style={{ ...s.btnSave, background:"#e11d48" }} disabled={loading} onClick={onDel}>
            {loading?"מוחק...":"מחק"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ─── RKR MODAL (ריסוס-קיסוח-ריסוק) ──────────────────────────
// ══════════════════════════════════════════════════════════════
const WORK_TYPES = ["ריסוס","קיסוח","ריסוק"];

function RkrModal({ initial, onClose, onSave, loading, expenses, clients }) {
  const isEdit = !!initial?._id;

  const [form, setForm] = useState({
    date:                initial?.date        || today(),
    clientName:          initial?.clientName  || "",
    name:                initial?.name        || "",
    workKind:            initial?.workKind    || "ריסוס",
    quantity:            initial?.quantity    || "",
    workPrice:           initial?.workPrice   || "",
    other:               initial?.other       || "",
    product:             initial?.product     || [],
    quantitiesOfProduct: initial?.quantitiesOfProduct || {},
    pricesOfProducts:    initial?.pricesOfProducts    || {},
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const toggleProduct = (exp) => {
    const name = exp.name;
    if (form.product.includes(name)) {
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

  const updateQty = (name, qty, unitPrice) => {
    const total = parseFloat((toNum(qty) * toNum(unitPrice)).toFixed(2));
    setForm(p => ({
      ...p,
      quantitiesOfProduct: { ...p.quantitiesOfProduct, [name]: qty },
      pricesOfProducts:    { ...p.pricesOfProducts,    [name]: total },
    }));
  };

  const materialsTotal = Object.values(form.pricesOfProducts).reduce((a,v) => a + toNum(v), 0);
  const workTotal      = parseFloat((toNum(form.workPrice) * toNum(form.quantity)).toFixed(2));
  const grandTotal     = parseFloat((materialsTotal + workTotal).toFixed(2));

  const selectedExp   = expenses.filter(e => form.product.includes(e.name));
  const unselectedExp = expenses.filter(e => !form.product.includes(e.name));

  const handleSave = () => {
    if (!form.name) return toast.error("נא להזין שם מטע");
    onSave({ ...form, workPrice: workTotal, number: parseFloat(materialsTotal.toFixed(2)), totalAmount: grandTotal });
  };

  return (
    <div style={s.overlay} onClick={e => e.target===e.currentTarget&&onClose()}>
      <div style={s.modal} className="modal-inner">
        <div style={s.modalTitle}>{isEdit ? "עריכת רשומה" : "הוספת ריסוס-קיסוח-ריסוק"}</div>

        {/* שורה 1 */}
        <div style={s.grid2} className="modal-grid2">
          <div style={s.fg}>
            <label style={s.label}>תאריך</label>
            <input style={s.input} type="date" value={form.date} onChange={set("date")} onFocus={fo} onBlur={bl}/>
          </div>
          <div style={s.fg}>
            <label style={s.label}>סוג עבודה</label>
            <select style={s.select} value={form.workKind} onChange={set("workKind")}>
              {WORK_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>

        {/* שורה 2 */}
        <div style={s.grid2} className="modal-grid2">
          <div style={s.fg}>
            <label style={s.label}>שם מטע *</label>
            <input style={s.input} placeholder="שם המטע..." value={form.name} onChange={set("name")} onFocus={fo} onBlur={bl}/>
          </div>
          <div style={s.fg}>
            <label style={s.label}>דונמים</label>
            <input style={s.input} type="number" placeholder="0" value={form.quantity} onChange={set("quantity")} onFocus={fo} onBlur={bl}/>
          </div>
        </div>

        {/* שורה 3 */}
        <div style={s.fg}>
          <label style={s.label}>הערה</label>
          <input style={s.input} placeholder="-" value={form.other} onChange={set("other")} onFocus={fo} onBlur={bl}/>
        </div>

        <div style={s.divider}/>

        {/* חומרים */}
        <label style={{ ...s.label, fontSize:"13px", fontWeight:"600", color:"#374151", marginBottom:"10px", display:"block" }}>
          🧪 חומרים
        </label>

        {selectedExp.map(exp => (
          <div key={exp._id} style={s.productRow}>
            <button onClick={() => toggleProduct(exp)} style={{ ...s.iconBtn, color:"#e11d48", flexShrink:0 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <span style={{ flex:1, fontSize:"13px", fontWeight:"500" }}>{exp.name}</span>
            <span style={{ fontSize:"12px", color:"#a3a3a3", flexShrink:0 }}>{toNum(exp.number)} ₪/יח׳</span>
            <input type="number" placeholder="כמות"
              value={form.quantitiesOfProduct[exp.name] || ""}
              onChange={e => updateQty(exp.name, e.target.value, exp.number)}
              style={{ width:"75px", padding:"6px 9px", border:"1px solid #e5e7eb", borderRadius:"6px", fontSize:"13px", textAlign:"center", outline:"none", fontFamily:"inherit" }}
              onFocus={fo} onBlur={bl}/>
            <span style={{ fontSize:"12px", fontWeight:"600", color:"#16a34a", minWidth:"60px", textAlign:"left" }}>
              {toNum(form.pricesOfProducts[exp.name]).toFixed(2)} ₪
            </span>
          </div>
        ))}

        {unselectedExp.length > 0 && (
          <select key={form.product.length} style={{ ...s.select, color:"#6b7280", marginTop: selectedExp.length?"6px":"0" }}
            defaultValue=""
            onChange={e => {
              const found = expenses.find(ex => ex._id === e.target.value);
              if (found) toggleProduct(found);
              e.target.value = "";
            }}>
            <option value="">+ הוסף חומר</option>
            {unselectedExp.map(e => (
              <option key={e._id} value={e._id}>{e.name} — {toNum(e.number)} ₪</option>
            ))}
          </select>
        )}

        {expenses.length === 0 && (
          <div style={{ padding:"10px 12px", background:"#fffbeb", borderRadius:"8px", fontSize:"12px", color:"#92400e", border:"1px solid #fde68a" }}>
            ⚠️ אין חומרים — הוסף חומרים בעמוד 'הוצאות מוצרים' תחילה
          </div>
        )}

        <div style={s.divider}/>

        {/* עבודה */}
        <div style={s.fg}>
          <label style={{ ...s.label, fontSize:"13px", fontWeight:"600", color:"#374151" }}>💼 עלות עבודה (₪)</label>
          <input style={s.input} type="number" placeholder="0" value={form.workPrice} onChange={set("workPrice")} onFocus={fo} onBlur={bl}/>
        </div>

        {/* סה"כ */}
        <div style={s.totalBox}>
          <div>
            <div style={{ fontSize:"11px", color:"#6b7280", marginBottom:"3px" }}>פירוט</div>
            <div style={{ fontSize:"12px", color:"#6b7280" }}>
              חומרים: {materialsTotal.toFixed(2)} ₪
              {toNum(form.workPrice) > 0 && toNum(form.quantity) > 0 && (
                <span> + עבודה: {toNum(form.workPrice)} × {toNum(form.quantity)} ד׳ = {workTotal.toFixed(2)} ₪</span>
              )}
            </div>
          </div>
          <div style={{ textAlign:"left" }}>
            <div style={{ fontSize:"11px", color:"#16a34a", marginBottom:"2px" }}>סה"כ</div>
            <div style={{ fontSize:"20px", fontWeight:"700", color:"#16a34a" }}>{grandTotal.toFixed(2)} ₪</div>
          </div>
        </div>

        <div style={s.btnRow}>
          <button style={s.btnCancel} onClick={onClose}>ביטול</button>
          <button style={s.btnSave} disabled={loading} onClick={handleSave}>
            {loading ? "שומר..." : isEdit ? "עדכן" : "הוסף"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ─── GENERIC MODAL (for other sections) ──────────────────────
// ══════════════════════════════════════════════════════════════
function GenericModal({ title, fields, initial, onClose, onSave, loading, clients }) {
  const init = {};
  fields.forEach(f => { init[f.key] = initial?.[f.key] ?? f.default ?? ""; });
  const [form, setForm] = useState(init);
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div style={s.overlay} onClick={e => e.target===e.currentTarget&&onClose()}>
      <div style={s.modal} className="modal-inner">
        <div style={s.modalTitle}>{initial?._id ? `עריכת ${title}` : `הוספת ${title}`}</div>
        <div style={s.grid2} className="modal-grid2">
          {fields.map(f => (
            <div key={f.key} style={{ ...s.fg, gridColumn: f.full?"1/-1":"auto" }}>
              <label style={s.label}>{f.label}{f.required?" *":""}</label>
              {f.type === "select-clients" ? (
                <select style={s.select} value={form[f.key]} onChange={set(f.key)}>
                  <option value="">בחר לקוח</option>
                  {clients.map(c => <option key={c._id} value={c.clientName}>{c.clientName}</option>)}
                </select>
              ) : f.type === "select-weight" ? (
                <select style={s.select} value={form[f.key]} onChange={set(f.key)}>
                  <option value="">בחר משקל</option>
                  <option value="קילו">קילו</option>
                  <option value="מיכל">מיכל</option>
                </select>
              ) : (
                <input style={s.input} type={f.type||"text"} placeholder={f.placeholder||""}
                  value={form[f.key]} onChange={set(f.key)} onFocus={fo} onBlur={bl}/>
              )}
            </div>
          ))}
        </div>
        <div style={s.btnRow}>
          <button style={s.btnCancel} onClick={onClose}>ביטול</button>
          <button style={s.btnSave} disabled={loading} onClick={() => onSave(form)}>
            {loading?"שומר...":initial?._id?"עדכן":"הוסף"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ─── TABS CONFIG ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
const TABS = [
  {
    key: "personalSales", label: "הכנסות אישיות", icon: "💵",
    cols: [
      { key:"date", label:"תאריך", style:{fontSize:"12px",color:"#6b7280"} },
      { key:"name", label:"מטע", style:{fontWeight:"500",color:"#1a1a1a"} },
      { key:"strains", label:"זנים" },
      { key:"weightType", label:"משקל" },
      { key:"quantity", label:"כמות" },
      { key:"totalAmount", label:'סה"כ', render: r => <strong style={{color:"#16a34a"}}>{toNum(r.totalAmount).toFixed(2)} ₪</strong> },
    ],
    fields: [
      { key:"date", label:"תאריך", type:"date", default: today() },
      { key:"name", label:"מטע", placeholder:"שם המטע", required:true },
      { key:"strains", label:"זנים מטופלים", placeholder:"גולדן, פוג׳י..." },
      { key:"weightType", label:"סוג משקל", type:"select-weight" },
      { key:"number", label:"סכום ליחידה (₪)", type:"number", placeholder:"0" },
      { key:"quantity", label:"כמות", type:"number", placeholder:"0" },
    ],
    calcTotal: (f) => parseFloat((toNum(f.quantity) * toNum(f.number)).toFixed(2)),
    useRkr: false,
  },
  {
    key: "personalWorkers", label: "עובדים", icon: "👷",
    cols: [
      { key:"date", label:"תאריך", style:{fontSize:"12px",color:"#6b7280"} },
      { key:"clientName", label:"עובד", style:{fontWeight:"500",color:"#1a1a1a"} },
      { key:"name", label:"מטע" },
      { key:"number", label:"יומית", render: r => `${toNum(r.number).toFixed(2)} ₪` },
      { key:"totalAmount", label:'סה"כ', render: r => <strong style={{color:"#16a34a"}}>{toNum(r.totalAmount).toFixed(2)} ₪</strong> },
    ],
    fields: [
      { key:"date", label:"תאריך", type:"date", default: today() },
      { key:"clientName", label:"שם העובד", placeholder:"שם העובד", required:true },
      { key:"name", label:"מטע", placeholder:"שם המטע" },
      { key:"number", label:"יומית (₪)", type:"number", placeholder:"0" },
    ],
    calcTotal: (f) => toNum(f.number),
    useRkr: false,
  },
  {
    key: "personalRkrExpenses", label: "ריסוס-קיסוח-ריסוק", icon: "🚜",
    useRkr: true,
    cols: [
      { key:"date", label:"תאריך", style:{fontSize:"12px",color:"#6b7280"} },
      { key:"name", label:"מטע", style:{fontWeight:"500",color:"#1a1a1a"} },
      { key:"workKind", label:"עבודה" },
      { key:"quantity", label:"דונמים" },
      { key:"number", label:"חומרים", render: r => `${toNum(r.number).toFixed(2)} ₪` },
      { key:"workPrice", label:"עבודה", render: r => `${toNum(r.workPrice).toFixed(2)} ₪` },
      { key:"totalAmount", label:'סה"כ', render: r => <strong style={{color:"#16a34a"}}>{toNum(r.totalAmount).toFixed(2)} ₪</strong> },
    ],
  },
  {
    key: "personalProductExpenses", label: "הוצאות מוצרים", icon: "📦",
    cols: [
      { key:"date", label:"תאריך", style:{fontSize:"12px",color:"#6b7280"} },
      { key:"name", label:"מוצר", style:{fontWeight:"500",color:"#1a1a1a"} },
      { key:"quantity", label:"כמות" },
      { key:"number", label:"מחיר", render: r => `${toNum(r.number).toFixed(2)} ₪` },
      { key:"totalAmount", label:'סה"כ', render: r => <strong style={{color:"#16a34a"}}>{toNum(r.totalAmount).toFixed(2)} ₪</strong> },
    ],
    fields: [
      { key:"date", label:"תאריך", type:"date", default: today() },
      { key:"name", label:"שם המוצר", placeholder:"שם המוצר", required:true },
      { key:"quantity", label:"כמות", type:"number", placeholder:"0" },
      { key:"number", label:"מחיר (₪)", type:"number", placeholder:"0" },
    ],
    calcTotal: (f) => parseFloat((toNum(f.quantity)*toNum(f.number)).toFixed(2)),
    useRkr: false,
  },
  {
    key: "personalInvestments", label: "השקעות", icon: "📈",
    cols: [
      { key:"date", label:"תאריך", style:{fontSize:"12px",color:"#6b7280"} },
      { key:"name", label:"השקעה", style:{fontWeight:"500",color:"#1a1a1a"} },
      { key:"quantity", label:"כמות" },
      { key:"number", label:"סכום", render: r => `${toNum(r.number).toFixed(2)} ₪` },
      { key:"totalAmount", label:'סה"כ', render: r => <strong style={{color:"#16a34a"}}>{toNum(r.totalAmount).toFixed(2)} ₪</strong> },
    ],
    fields: [
      { key:"date", label:"תאריך", type:"date", default: today() },
      { key:"name", label:"תיאור ההשקעה", placeholder:"ציוד, תשתית...", required:true, full:true },
      { key:"quantity", label:"כמות", type:"number", placeholder:"0" },
      { key:"number", label:"סכום (₪)", type:"number", placeholder:"0" },
      { key:"other", label:"הערות", placeholder:"-" },
    ],
    calcTotal: (f) => parseFloat((toNum(f.quantity)*toNum(f.number)).toFixed(2)),
    useRkr: false,
  },
];

// ══════════════════════════════════════════════════════════════
// ─── MAIN ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
export default function PersonalPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("personalSales");
  const [modal, setModal]         = useState(null);
  const [delItem, setDelItem]     = useState(null);

  const tab = TABS.find(t => t.key === activeTab);
  const ep  = endpoints[activeTab];

  const { data: taxArr   = [] } = useQuery({ queryKey: ["taxValues"],         queryFn: fetchAll("/taxValues") });
  const maamValue = parseFloat(taxArr?.[0]?.maamValue) || 17;
  const { data: records  = [] } = useQuery({ queryKey: [activeTab],                queryFn: fetchAll(ep) });
  const { data: clients  = [] } = useQuery({ queryKey: ["clients"],                 queryFn: fetchAll("/clients") });
  const { data: expenses = [] } = useQuery({ queryKey: ["expenses"],                queryFn: fetchAll("/expenses") });
  const { data: personalProducts = [] } = useQuery({ queryKey: ["personalProductExpenses"], queryFn: fetchAll("/personalProductExpenses") });

  const addMut = useMutation({
    mutationFn: (b) => api.post(ep, b).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries([activeTab]); toast.success("נוסף"); setModal(null); },
    onError: e => toast.error(e.response?.data?.message || "שגיאה"),
  });
  const editMut = useMutation({
    mutationFn: ({ id, ...b }) => api.patch(`${ep}/${id}`, b).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries([activeTab]); toast.success("עודכן"); setModal(null); },
    onError: e => toast.error(e.response?.data?.message || "שגיאה"),
  });
  const delMut = useMutation({
    mutationFn: (id) => api.delete(`${ep}/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries([activeTab]); toast.success("נמחק"); setDelItem(null); },
    onError: e => toast.error(e.response?.data?.message || "שגיאה"),
  });

  const handleSave = (form) => {
    const body = tab.calcTotal ? { ...form, totalAmount: tab.calcTotal(form) } : form;
    if (modal?._id) editMut.mutate({ id: modal._id, ...body });
    else addMut.mutate(body);
  };

  const handleRkrSave = (form) => {
    if (modal?._id) editMut.mutate({ id: modal._id, ...form });
    else addMut.mutate(form);
  };

  return (
    <div style={s.page} className="page-pad">
      <div style={s.title}>אישי</div>
      <div style={s.sub}>נתונים אישיים ופנימיים</div>

      {/* Tabs */}
      <div style={s.tabs} className="personal-tabs">
        {TABS.map(t => (
          <button key={t.key}
            style={{ ...s.tab, ...(activeTab===t.key ? s.tabActive : {}) }}
            onClick={() => { setActiveTab(t.key); setModal(null); setDelItem(null); }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Top row */}
      <div style={s.topRow} className="top-row">
        <div style={s.secTitle}>
          {tab?.icon} {tab?.label}
          <span style={s.count}> ({records.length})</span>
        </div>
        <button style={s.btnPrimary} onClick={() => setModal({})}
          onMouseEnter={e=>e.currentTarget.style.background="#15803d"}
          onMouseLeave={e=>e.currentTarget.style.background="#16a34a"}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          הוסף
        </button>
      </div>
      {/* Summary Bar */}
      {(() => {
        const total = records.reduce((a,r) => a + (parseFloat(r.totalAmount)||0), 0);
        const taxAmt = parseFloat((total * (maamValue/100)).toFixed(2));
        const grand  = parseFloat((total + taxAmt).toFixed(2));
        return (
          <div style={s.summaryBar} className="summary-bar">
            <div style={s.statItem}>
              <span style={s.statLabel}>סה"כ לפני מע"מ</span>
              <span style={{ ...s.statValue, color:"#374151" }}>{total.toFixed(2)} ₪</span>
            </div>
            <div style={{ width:"1px", background:"#f0f0ef", alignSelf:"stretch" }}/>
            <div style={s.statItem}>
              <span style={s.statLabel}>מע"מ ({maamValue}%)</span>
              <span style={{ ...s.statValue, color:"#d97706", fontSize:"16px" }}>{taxAmt.toFixed(2)} ₪</span>
            </div>
            <div style={{ width:"1px", background:"#f0f0ef", alignSelf:"stretch" }}/>
            <div style={s.statItem}>
              <span style={s.statLabel}>סה"כ כולל מע"מ</span>
              <span style={{ ...s.statValue, color:"#16a34a" }}>{grand.toFixed(2)} ₪</span>
            </div>
            <div style={{ marginRight:"auto" }}>
              <div style={{ fontSize:"11px", color:"#a3a3a3" }}>שיעור מע"מ</div>
              <div style={{ fontSize:"13px", fontWeight:"600", color:"#374151" }}>{maamValue}%</div>
            </div>
          </div>
        );
      })()}

      {/* Table */}
      <GenericTable data={records} cols={tab?.cols||[]} onEdit={setModal} onDel={setDelItem}/>

      {/* Modal */}
      {modal !== null && (
        tab?.useRkr ? (
          <RkrModal
            initial={modal?._id ? modal : null}
            onClose={() => setModal(null)}
            onSave={handleRkrSave}
            loading={addMut.isPending || editMut.isPending}
            expenses={personalProducts}
            clients={clients}
          />
        ) : (
          <GenericModal
            title={tab?.label}
            fields={tab?.fields||[]}
            initial={modal?._id ? modal : null}
            onClose={() => setModal(null)}
            onSave={handleSave}
            loading={addMut.isPending || editMut.isPending}
            clients={clients}
          />
        )
      )}

      {/* Delete */}
      {delItem && (
        <DelConfirm
          item={delItem}
          onClose={() => setDelItem(null)}
          onDel={() => delMut.mutate(delItem._id)}
          loading={delMut.isPending}
        />
      )}
    </div>
  );
}
