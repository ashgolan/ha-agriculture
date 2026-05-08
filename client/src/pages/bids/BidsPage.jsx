import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api.js";
import toast from "react-hot-toast";

const fetchBids    = () => api.get("/bids").then(r => r.data.data);
const fetchClients = () => api.get("/clients").then(r => r.data.data);
const createBid    = (b) => api.post("/bids", b).then(r => r.data.data);
const updateBid    = ({ id, ...b }) => api.patch(`/bids/${id}`, b).then(r => r.data.data);
const deleteBid    = (id) => api.delete(`/bids/${id}`).then(r => r.data);

const toNum = (v) => parseFloat(v) || 0;
const today = () => new Date().toISOString().split("T")[0];

const s = {
  page:       { padding: "28px 32px", direction: "rtl" },
  topRow:     { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" },
  title:      { fontSize: "20px", fontWeight: "600", color: "#1a1a1a" },
  sub:        { fontSize: "13px", color: "#a3a3a3", marginTop: "3px" },
  btnPrimary: { display:"flex", alignItems:"center", gap:"7px", background:"#16a34a", color:"#fff", border:"none", borderRadius:"8px", padding:"9px 18px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", boxShadow:"0 2px 8px rgba(22,163,74,0.25)", transition:"all 0.15s" },
  summaryBar: { background:"#fff", borderRadius:"12px", border:"1px solid #f0f0ef", padding:"18px 24px", marginBottom:"16px", display:"flex", gap:"32px", alignItems:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", flexWrap:"wrap" },
  statItem:   { display:"flex", flexDirection:"column", gap:"3px" },
  statLabel:  { fontSize:"11px", color:"#a3a3a3", fontWeight:"500", letterSpacing:"0.04em", textTransform:"uppercase" },
  statValue:  { fontSize:"18px", fontWeight:"700", color:"#1a1a1a" },
  searchWrap: { position:"relative", marginBottom:"20px" },
  searchInput:{ width:"100%", padding:"10px 16px 10px 40px", border:"1px solid #e5e7eb", borderRadius:"10px", fontSize:"14px", background:"#fff", outline:"none", fontFamily:"inherit", color:"#1a1a1a", boxSizing:"border-box" },
  searchIcon: { position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"#a3a3a3" },
  grid:       { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:"16px" },
  card:       { background:"#fff", borderRadius:"12px", border:"1px solid #f0f0ef", padding:"20px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", display:"flex", flexDirection:"column", gap:"12px" },
  cardTop:    { display:"flex", justifyContent:"space-between", alignItems:"flex-start" },
  clientName: { fontSize:"16px", fontWeight:"600", color:"#1a1a1a" },
  dateText:   { fontSize:"12px", color:"#a3a3a3" },
  statusBadge:{ display:"inline-flex", alignItems:"center", gap:"4px", borderRadius:"6px", padding:"3px 10px", fontSize:"12px", fontWeight:"500" },
  target:     { fontSize:"13px", color:"#6b7280", background:"#fafaf9", borderRadius:"6px", padding:"8px 12px", lineHeight:"1.5", maxHeight:"60px", overflow:"hidden", textOverflow:"ellipsis" },
  total:      { fontSize:"20px", fontWeight:"700", color:"#16a34a" },
  actions:    { display:"flex", gap:"8px", borderTop:"1px solid #f5f5f4", paddingTop:"12px" },
  actionBtn:  { flex:1, padding:"8px", border:"1px solid #e5e7eb", borderRadius:"8px", background:"#fff", fontSize:"13px", fontWeight:"500", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px" },
  overlay:    { position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"16px" },
  modal:      { background:"#fff", borderRadius:"16px", width:"100%", maxWidth:"680px", maxHeight:"90vh", overflowY:"auto", padding:"28px", boxShadow:"0 20px 60px rgba(0,0,0,0.15)", direction:"rtl" },
  modalTitle: { fontSize:"17px", fontWeight:"600", color:"#1a1a1a", marginBottom:"20px" },
  tabs:       { display:"flex", gap:"0", marginBottom:"20px", background:"#f5f5f4", borderRadius:"8px", padding:"3px" },
  tab:        { flex:1, padding:"8px", borderRadius:"6px", border:"none", fontSize:"13px", fontWeight:"500", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" },
  grid2:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" },
  formGroup:  { marginBottom:"14px" },
  label:      { display:"block", fontSize:"12px", fontWeight:"500", color:"#6b7280", marginBottom:"6px" },
  input:      { width:"100%", padding:"10px 13px", border:"1px solid #e5e7eb", borderRadius:"8px", fontSize:"14px", fontFamily:"inherit", color:"#1a1a1a", outline:"none", boxSizing:"border-box", transition:"border-color 0.15s" },
  select:     { width:"100%", padding:"10px 13px", border:"1px solid #e5e7eb", borderRadius:"8px", fontSize:"14px", fontFamily:"inherit", color:"#1a1a1a", outline:"none", background:"#fff", boxSizing:"border-box" },
  textarea:   { width:"100%", padding:"12px 14px", border:"1px solid #e5e7eb", borderRadius:"8px", fontSize:"14px", fontFamily:"inherit", color:"#1a1a1a", outline:"none", boxSizing:"border-box", resize:"vertical", minHeight:"160px", lineHeight:"1.6", transition:"border-color 0.15s" },
  divider:    { borderTop:"1px solid #f0f0ef", margin:"16px 0" },
  btnRow:     { display:"flex", gap:"10px", marginTop:"20px" },
  btnCancel:  { flex:1, padding:"10px", border:"1px solid #e5e7eb", borderRadius:"8px", background:"#fff", fontSize:"14px", fontWeight:"500", color:"#6b7280", cursor:"pointer", fontFamily:"inherit" },
  btnSave:    { flex:2, padding:"10px", border:"none", borderRadius:"8px", background:"#16a34a", fontSize:"14px", fontWeight:"600", color:"#fff", cursor:"pointer", fontFamily:"inherit" },
  itemRow:    { display:"flex", gap:"8px", alignItems:"center", marginBottom:"8px" },
  itemInput:  { flex:1, padding:"8px 12px", border:"1px solid #e5e7eb", borderRadius:"7px", fontSize:"13px", fontFamily:"inherit", outline:"none", boxSizing:"border-box" },
  iconBtn:    { background:"none", border:"none", cursor:"pointer", padding:"6px", borderRadius:"6px", display:"flex", alignItems:"center", color:"#a3a3a3", transition:"all 0.15s" },
  totalBox:   { background:"#f0fdf4", border:"1px solid #86efac", borderRadius:"10px", padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"12px" },
};

const fo = (e) => { e.target.style.borderColor = "#86efac"; };
const bl = (e) => { e.target.style.borderColor = "#e5e7eb"; };

// ─── Bid Modal ────────────────────────────────────────────────
function BidModal({ initial, onClose, onSave, loading, clients }) {
  const isEdit = !!initial?._id;
  const [bidType, setBidType] = useState(initial?.freeBid === false ? "items" : "free");

  const [form, setForm] = useState({
    clientName:  initial?.clientName || "",
    date:        initial?.date       || today(),
    target:      initial?.target     || "",
    isApproved:  initial?.isApproved || false,
    freeBid:     initial?.freeBid    ?? true,
    totalAmount: initial?.totalAmount || 0,
    data:        initial?.data       || [],
  });

  // Items mode state
  const [items, setItems] = useState(
    initial?.data?.length > 0
      ? initial.data
      : [{ desc: "", qty: "", price: "", total: 0 }]
  );

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  // Items calculations
  const updateItem = (i, k, v) => {
    const newItems = [...items];
    newItems[i] = { ...newItems[i], [k]: v };
    if (k === "qty" || k === "price") {
      newItems[i].total = parseFloat((toNum(newItems[i].qty) * toNum(newItems[i].price)).toFixed(2));
    }
    setItems(newItems);
  };

  const addItem = () => setItems(p => [...p, { desc: "", qty: "", price: "", total: 0 }]);
  const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i));

  const itemsTotal = items.reduce((a, it) => a + toNum(it.total), 0);

  const handleSave = () => {
    if (!form.clientName) return toast.error("נא לבחור לקוח");
    const isItems = bidType === "items";
    onSave({
      ...form,
      freeBid: !isItems,
      data: isItems ? items : [],
      totalAmount: isItems ? parseFloat(itemsTotal.toFixed(2)) : toNum(form.totalAmount),
    });
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal} className="modal-inner">
        <div style={s.modalTitle}>{isEdit ? "עריכת הצעת מחיר" : "הצעת מחיר חדשה"}</div>

        {/* Tabs */}
        <div style={s.tabs}>
          {[
            { key: "free",  label: "📝 טקסט חופשי" },
            { key: "items", label: "📋 רשימת פריטים" },
          ].map(t => (
            <button key={t.key} style={{
              ...s.tab,
              background: bidType === t.key ? "#fff" : "transparent",
              color: bidType === t.key ? "#16a34a" : "#6b7280",
              fontWeight: bidType === t.key ? "600" : "500",
              boxShadow: bidType === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }} onClick={() => setBidType(t.key)}>{t.label}</button>
          ))}
        </div>

        {/* Header fields */}
        <div style={s.grid2} className="modal-grid2">
          <div style={s.formGroup}>
            <label style={s.label}>לקוח *</label>
            <select style={s.select} value={form.clientName} onChange={set("clientName")}>
              <option value="">בחר לקוח</option>
              {clients.map(c => <option key={c._id} value={c.clientName}>{c.clientName}</option>)}
            </select>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>תאריך</label>
            <input style={s.input} type="date" value={form.date} onChange={set("date")} onFocus={fo} onBlur={bl}/>
          </div>
        </div>

        <div style={s.divider}/>

        {/* FREE TEXT mode */}
        {bidType === "free" && (
          <>
            <div style={s.formGroup}>
              <label style={s.label}>עבור — נושא / תיאור העבודה</label>
              <input style={s.input} placeholder="עבור: ריסוס מטע תפוחים..." value={form.target} onChange={set("target")} onFocus={fo} onBlur={bl}/>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>תוכן הצעת המחיר</label>
              <textarea
                style={s.textarea}
                placeholder={`לדוג׳:\n• ריסוס מניעתי — 15 דונם\n• חומר: גלגלית 10 ליטר\n• עבודת טרקטור\n\nהערות נוספות...`}
                value={form.data?.[0]?.text || ""}
                onChange={e => setForm(p => ({ ...p, data: [{ text: e.target.value }] }))}
                onFocus={fo} onBlur={bl}
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>סכום כולל (₪)</label>
              <input style={{ ...s.input, fontSize:"18px", fontWeight:"600", color:"#16a34a" }}
                type="number" placeholder="0.00" value={form.totalAmount} onChange={set("totalAmount")} onFocus={fo} onBlur={bl}/>
            </div>
          </>
        )}

        {/* ITEMS mode */}
        {bidType === "items" && (
          <>
            <div style={s.formGroup}>
              <label style={s.label}>עבור — נושא העבודה</label>
              <input style={s.input} placeholder="עבור: ריסוס מטע תפוחים..." value={form.target} onChange={set("target")} onFocus={fo} onBlur={bl}/>
            </div>

            <label style={{ ...s.label, marginBottom:"10px" }}>פריטים</label>

            {/* Items header */}
            <div style={{ display:"flex", gap:"8px", marginBottom:"6px", padding:"0 4px" }}>
              {["תיאור", "כמות", "מחיר ליח׳", "סה\"כ", ""].map((h, i) => (
                <div key={i} style={{ flex: i === 0 ? 2 : 1, fontSize:"11px", fontWeight:"600", color:"#a3a3a3", textAlign: i === 3 ? "left" : "right" }}>{h}</div>
              ))}
            </div>

            {items.map((item, i) => (
              <div key={i} style={s.itemRow}>
                <input style={{ ...s.itemInput, flex: 2 }} placeholder="תיאור..." value={item.desc}
                  onChange={e => updateItem(i, "desc", e.target.value)} onFocus={fo} onBlur={bl}/>
                <input style={s.itemInput} type="number" placeholder="כמות" value={item.qty}
                  onChange={e => updateItem(i, "qty", e.target.value)} onFocus={fo} onBlur={bl}/>
                <input style={s.itemInput} type="number" placeholder="מחיר" value={item.price}
                  onChange={e => updateItem(i, "price", e.target.value)} onFocus={fo} onBlur={bl}/>
                <div style={{ flex:1, fontSize:"13px", fontWeight:"600", color:"#16a34a", textAlign:"left", padding:"0 4px" }}>
                  {toNum(item.total).toFixed(2)} ₪
                </div>
                <button style={s.iconBtn} onClick={() => removeItem(i)} disabled={items.length === 1}
                  onMouseEnter={e => { e.currentTarget.style.color="#e11d48"; e.currentTarget.style.background="#fff1f2"; }}
                  onMouseLeave={e => { e.currentTarget.style.color="#a3a3a3"; e.currentTarget.style.background="none"; }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}

            <button onClick={addItem} style={{ width:"100%", padding:"9px", border:"1px dashed #d1d5db", borderRadius:"8px", background:"transparent", fontSize:"13px", color:"#6b7280", cursor:"pointer", fontFamily:"inherit", marginBottom:"4px", transition:"all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#86efac"; e.currentTarget.style.color="#16a34a"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#d1d5db"; e.currentTarget.style.color="#6b7280"; }}>
              + הוסף פריט
            </button>

            <div style={s.totalBox}>
              <span style={{ fontSize:"14px", fontWeight:"500", color:"#15803d" }}>סה"כ לפני מע"מ</span>
              <span style={{ fontSize:"22px", fontWeight:"700", color:"#16a34a" }}>{itemsTotal.toFixed(2)} ₪</span>
            </div>
          </>
        )}

        <div style={s.divider}/>

        {/* Status */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"12px 14px", background:"#fafaf9", borderRadius:"8px", border:"1px solid #f0f0ef" }}>
          <label style={{ position:"relative", width:"36px", height:"20px", flexShrink:0 }}>
            <input type="checkbox" checked={form.isApproved}
              onChange={e => setForm(p => ({ ...p, isApproved: e.target.checked }))}
              style={{ opacity:0, width:0, height:0, position:"absolute" }}/>
            <span style={{ position:"absolute", inset:0, borderRadius:"20px", cursor:"pointer", transition:"0.2s", background: form.isApproved ? "#16a34a" : "#d1d5db" }}/>
            <span style={{ position:"absolute", top:"2px", right: form.isApproved ? "2px" : "18px", width:"16px", height:"16px", borderRadius:"50%", background:"#fff", transition:"0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
          </label>
          <div>
            <div style={{ fontSize:"13px", fontWeight:"500", color:"#374151" }}>הצעה מאושרת</div>
            <div style={{ fontSize:"11px", color:"#a3a3a3" }}>
              {form.isApproved ? "✅ הלקוח אישר את ההצעה" : "ממתינה לאישור"}
            </div>
          </div>
        </div>

        <div style={s.btnRow}>
          <button style={s.btnCancel} onClick={onClose}>ביטול</button>
          <button style={s.btnSave} disabled={loading} onClick={handleSave}>
            {loading ? "שומר..." : isEdit ? "עדכן הצעה" : "שמור הצעה"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────
function ViewModal({ bid, onClose }) {
  const isFree  = bid.freeBid;
  const content = isFree ? bid.data?.[0]?.text : null;
  const items   = !isFree ? bid.data : [];

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...s.modal, maxWidth:"560px" }}>

        {/* Header */}
        <div style={{ borderBottom:"2px solid #16a34a", paddingBottom:"16px", marginBottom:"20px" }}>
          <div style={{ fontSize:"13px", color:"#a3a3a3", marginBottom:"4px" }}>הצעת מחיר</div>
          <div style={{ fontSize:"22px", fontWeight:"700", color:"#1a1a1a" }}>{bid.clientName}</div>
          <div style={{ fontSize:"13px", color:"#6b7280", marginTop:"4px" }}>
            תאריך: {bid.date} &nbsp;|&nbsp; {bid.time || ""}
          </div>
          {bid.target && (
            <div style={{ marginTop:"10px", fontSize:"14px", fontWeight:"500", color:"#374151" }}>
              עבור: {bid.target}
            </div>
          )}
        </div>

        {/* Content */}
        {isFree && content && (
          <div style={{ fontSize:"14px", lineHeight:"1.8", color:"#374151", whiteSpace:"pre-wrap", marginBottom:"20px" }}>
            {content}
          </div>
        )}

        {!isFree && items?.length > 0 && (
          <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:"16px" }}>
            <thead>
              <tr style={{ background:"#f9fafb" }}>
                {["תיאור","כמות","מחיר ליח׳","סה\"כ"].map(h => (
                  <th key={h} style={{ padding:"10px 12px", fontSize:"12px", fontWeight:"600", color:"#6b7280", textAlign:"right", borderBottom:"1px solid #f0f0ef" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom:"1px solid #f9f9f8" }}>
                  <td style={{ padding:"10px 12px", fontSize:"14px" }}>{item.desc}</td>
                  <td style={{ padding:"10px 12px", fontSize:"14px" }}>{item.qty}</td>
                  <td style={{ padding:"10px 12px", fontSize:"14px" }}>{toNum(item.price).toFixed(2)} ₪</td>
                  <td style={{ padding:"10px 12px", fontSize:"14px", fontWeight:"600", color:"#16a34a" }}>{toNum(item.total).toFixed(2)} ₪</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Total */}
        <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:"10px", padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
          <span style={{ fontSize:"14px", fontWeight:"500", color:"#15803d" }}>סה"כ לפני מע"מ</span>
          <span style={{ fontSize:"24px", fontWeight:"700", color:"#16a34a" }}>{toNum(bid.totalAmount).toFixed(2)} ₪</span>
        </div>

        {/* Status */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{
            ...s.statusBadge,
            background: bid.isApproved ? "#f0fdf4" : "#fffbeb",
            color:      bid.isApproved ? "#16a34a" : "#d97706",
          }}>
            {bid.isApproved ? "✅ מאושר" : "⏳ ממתין לאישור"}
          </span>
          <button style={{ ...s.btnCancel, flex:"none", padding:"8px 20px" }} onClick={onClose}>סגור</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function BidsPage() {
  const qc = useQueryClient();
  const [search, setSearch]         = useState("");
  const [modal, setModal]           = useState(null);
  const [viewBid, setViewBid]       = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);

  const { data: bids    = [] } = useQuery({ queryKey: ["bids"],    queryFn: fetchBids });
  const { data: taxArr  = [] } = useQuery({ queryKey: ["taxValues"], queryFn: () => api.get("/taxValues").then(r => r.data.data) });
  const maamValue = parseFloat(taxArr?.[0]?.maamValue) || 17;
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: fetchClients });

  const addMut  = useMutation({ mutationFn: createBid,
    onSuccess: () => { qc.invalidateQueries(["bids"]); toast.success("הצעה נשמרה"); setModal(null); },
    onError: e => toast.error(e.response?.data?.message || "שגיאה") });
  const editMut = useMutation({ mutationFn: updateBid,
    onSuccess: () => { qc.invalidateQueries(["bids"]); toast.success("הצעה עודכנה"); setModal(null); },
    onError: e => toast.error(e.response?.data?.message || "שגיאה") });
  const delMut  = useMutation({ mutationFn: deleteBid,
    onSuccess: () => { qc.invalidateQueries(["bids"]); toast.success("הצעה נמחקה"); setDelConfirm(null); },
    onError: e => toast.error(e.response?.data?.message || "שגיאה") });

  const handleSave = (form) => {
    if (modal?._id) editMut.mutate({ id: modal._id, ...form });
    else addMut.mutate(form);
  };

  const filtered = bids.filter(b =>
    b.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    b.target?.toLowerCase().includes(search.toLowerCase())
  );

  const approved = bids.filter(b => b.isApproved).length;
  const pending  = bids.length - approved;
  const totalBids  = bids.reduce((a, b) => a + toNum(b.totalAmount), 0);
  const taxTotal   = parseFloat((totalBids * (maamValue / 100)).toFixed(2));
  const grandTotal = parseFloat((totalBids + taxTotal).toFixed(2));

  return (
    <div style={s.page} className="page-pad">
      <div style={s.topRow} className="top-row">
        <div>
          <div style={s.title}>הצעות מחיר</div>
          <div style={s.sub}>
            {bids.length} הצעות &nbsp;|&nbsp;
            <span style={{ color:"#16a34a" }}>{approved} מאושרות</span>
            &nbsp;|&nbsp;
            <span style={{ color:"#d97706" }}>{pending} ממתינות</span>
          </div>
        </div>
        <button style={s.btnPrimary} onClick={() => setModal("add")}
          onMouseEnter={e => e.currentTarget.style.background = "#15803d"}
          onMouseLeave={e => e.currentTarget.style.background = "#16a34a"}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          הצעה חדשה
        </button>
      </div>
      {/* Summary Bar */}
      <div style={s.summaryBar} className="summary-bar">
        <div style={s.statItem}>
          <span style={s.statLabel}>סה"כ לפני מע"מ</span>
          <span style={{ ...s.statValue, color:"#374151" }}>{totalBids.toFixed(2)} ₪</span>
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
        <input style={s.searchInput} placeholder="חיפוש לפי לקוח או נושא..."
          value={search} onChange={e => setSearch(e.target.value)}
          onFocus={fo} onBlur={bl}/>
      </div>

      {/* Grid of cards */}
      {filtered.length === 0 ? (
        <div style={{ background:"#fff", borderRadius:"12px", border:"1px solid #f0f0ef", padding:"56px", textAlign:"center" }}>
          <div style={{ fontSize:"32px", marginBottom:"12px" }}>📋</div>
          <div style={{ fontSize:"15px", fontWeight:"500", color:"#525252" }}>
            {search ? "לא נמצאו תוצאות" : "אין הצעות מחיר עדיין"}
          </div>
          {!search && <div style={{ fontSize:"13px", color:"#a3a3a3", marginTop:"6px" }}>לחץ 'הצעה חדשה' להתחלה</div>}
        </div>
      ) : (
        <div style={s.grid} className="bids-grid">
          {filtered.map(bid => (
            <div key={bid._id} style={s.card}>
              <div style={s.cardTop}>
                <div>
                  <div style={s.clientName}>{bid.clientName}</div>
                  <div style={s.dateText}>{bid.date}</div>
                </div>
                <span style={{
                  ...s.statusBadge,
                  background: bid.isApproved ? "#f0fdf4" : "#fffbeb",
                  color:      bid.isApproved ? "#16a34a" : "#d97706",
                }}>
                  {bid.isApproved ? "✅ מאושר" : "⏳ ממתין"}
                </span>
              </div>

              {bid.target && (
                <div style={s.target}>עבור: {bid.target}</div>
              )}

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"12px", color:"#a3a3a3" }}>
                  {bid.freeBid ? "📝 טקסט חופשי" : `📋 ${bid.data?.length || 0} פריטים`}
                </span>
                <div style={s.total}>{toNum(bid.totalAmount).toFixed(2)} ₪</div>
              </div>

              <div style={s.actions}>
                <button style={s.actionBtn} onClick={() => setViewBid(bid)}
                  onMouseEnter={e => { e.currentTarget.style.background="#f0fdf4"; e.currentTarget.style.borderColor="#86efac"; e.currentTarget.style.color="#16a34a"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="#fff"; e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.color="inherit"; }}>
                  👁 צפה
                </button>
                <button style={s.actionBtn} onClick={() => setModal(bid)}
                  onMouseEnter={e => { e.currentTarget.style.background="#f0f9ff"; e.currentTarget.style.borderColor="#bae6fd"; e.currentTarget.style.color="#0284c7"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="#fff"; e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.color="inherit"; }}>
                  ✏️ עריכה
                </button>
                <button style={{ ...s.actionBtn, flex:"none", padding:"8px 10px" }} onClick={() => setDelConfirm(bid)}
                  onMouseEnter={e => { e.currentTarget.style.background="#fff1f2"; e.currentTarget.style.borderColor="#fecdd3"; e.currentTarget.style.color="#e11d48"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="#fff"; e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.color="inherit"; }}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <BidModal
          initial={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          loading={addMut.isPending || editMut.isPending}
          clients={clients}
        />
      )}

      {viewBid && <ViewModal bid={viewBid} onClose={() => setViewBid(null)} />}

      {delConfirm && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setDelConfirm(null)}>
          <div style={{ ...s.modal, maxWidth:"360px", textAlign:"center" }}>
            <div style={{ fontSize:"32px", marginBottom:"12px" }}>🗑️</div>
            <div style={{ fontSize:"16px", fontWeight:"600", color:"#1a1a1a", marginBottom:"8px" }}>מחיקת הצעה</div>
            <div style={{ fontSize:"13px", color:"#6b7280", marginBottom:"24px" }}>
              האם למחוק את הצעת המחיר עבור <strong>{delConfirm.clientName}</strong>?
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
