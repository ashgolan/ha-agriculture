import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api.js";
import toast from "react-hot-toast";

const fetchClients = () => api.get("/clients").then(r => r.data.data);
const createClient = (body) => api.post("/clients", body).then(r => r.data.data);
const updateClient = ({ id, ...body }) => api.patch(`/clients/${id}`, body).then(r => r.data.data);
const deleteClient = (id) => api.delete(`/clients/${id}`).then(r => r.data);

const emptyForm = { clientName: "", name: "", quantity: "" };

// ─── Styles ───────────────────────────────────────────────────
const s = {
  page: { padding: "28px 32px", direction: "rtl" },
  topRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" },
  title: { fontSize: "20px", fontWeight: "600", color: "#1a1a1a" },
  sub: { fontSize: "13px", color: "#a3a3a3", marginTop: "3px" },
  btnPrimary: {
    display: "flex", alignItems: "center", gap: "7px",
    background: "#16a34a", color: "#fff", border: "none",
    borderRadius: "8px", padding: "9px 18px", fontSize: "13px",
    fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
    boxShadow: "0 2px 8px rgba(22,163,74,0.25)", transition: "all 0.15s",
  },
  searchWrap: { position: "relative", marginBottom: "20px" },
  searchInput: {
    width: "100%", padding: "10px 16px 10px 40px",
    border: "1px solid #e5e7eb", borderRadius: "10px",
    fontSize: "14px", background: "#fff", outline: "none",
    fontFamily: "inherit", color: "#1a1a1a",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  searchIcon: { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#a3a3a3" },
  card: {
    background: "#fff", borderRadius: "12px",
    border: "1px solid #f0f0ef", overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "12px 16px", fontSize: "11px", fontWeight: "600",
    color: "#a3a3a3", textAlign: "right", letterSpacing: "0.06em",
    borderBottom: "1px solid #f0f0ef", background: "#fafaf9",
    textTransform: "uppercase",
  },
  td: {
    padding: "13px 16px", fontSize: "14px", color: "#374151",
    borderBottom: "1px solid #f9f9f8", textAlign: "right",
  },
  badge: {
    display: "inline-flex", alignItems: "center", gap: "4px",
    background: "#f0fdf4", color: "#16a34a",
    borderRadius: "6px", padding: "3px 10px", fontSize: "12px", fontWeight: "500",
  },
  iconBtn: {
    background: "none", border: "none", cursor: "pointer",
    padding: "6px", borderRadius: "6px", display: "flex",
    alignItems: "center", color: "#a3a3a3", transition: "all 0.15s",
    fontFamily: "inherit",
  },
  // Modal
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "20px",
  },
  modal: {
    background: "#fff", borderRadius: "16px",
    width: "100%", maxWidth: "460px",
    padding: "28px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    direction: "rtl",
  },
  modalTitle: { fontSize: "17px", fontWeight: "600", color: "#1a1a1a", marginBottom: "20px" },
  formGroup: { marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", fontWeight: "500", color: "#6b7280", marginBottom: "6px" },
  input: {
    width: "100%", padding: "10px 13px", border: "1px solid #e5e7eb",
    borderRadius: "8px", fontSize: "14px", fontFamily: "inherit",
    color: "#1a1a1a", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  btnRow: { display: "flex", gap: "10px", marginTop: "24px" },
  btnCancel: {
    flex: 1, padding: "10px", border: "1px solid #e5e7eb",
    borderRadius: "8px", background: "#fff", fontSize: "14px",
    fontWeight: "500", color: "#6b7280", cursor: "pointer",
    fontFamily: "inherit", transition: "all 0.15s",
  },
  btnSave: {
    flex: 2, padding: "10px", border: "none",
    borderRadius: "8px", background: "#16a34a", fontSize: "14px",
    fontWeight: "600", color: "#fff", cursor: "pointer",
    fontFamily: "inherit", transition: "all 0.15s",
  },
};

// ─── Modal ────────────────────────────────────────────────────
function ClientModal({ initial, onClose, onSave, loading, existingClients }) {
  const isEdit = !!initial?._id;

  const [form, setForm] = useState({
    clientName: initial?.clientName || "",
    name:       initial?.name       || "",
    quantity:   initial?.quantity   || "",
  });

  const [fields, setFields] = useState(
    isEdit
      ? [{ name: initial?.name || "", quantity: initial?.quantity || "" }]
      : [{ name: "", quantity: "" }]
  );

  const [showSuggestions, setShowSuggestions] = useState(false);

  // اسماء الزبائن الفريدة
  const uniqueNames = [...new Set(existingClients.map(c => c.clientName))].sort();

  // اقتراحات بناءً على ما يكتبه
  const suggestions = form.clientName.trim()
    ? uniqueNames.filter(n => n.toLowerCase().includes(form.clientName.toLowerCase()) && n !== form.clientName)
    : [];

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const setField = (i, k) => (e) => {
    const next = [...fields];
    next[i] = { ...next[i], [k]: e.target.value };
    setFields(next);
  };

  const addField = () => setFields(p => [...p, { name: "", quantity: "" }]);
  const removeField = (i) => setFields(p => p.filter((_, idx) => idx !== i));

  const fo = (e) => e.target.style.borderColor = "#86efac";
  const bl = (e) => e.target.style.borderColor = "#e5e7eb";

  const handleSave = () => {
    if (!form.clientName.trim()) return;
    if (isEdit) {
      onSave({ clientName: form.clientName, name: fields[0].name, quantity: fields[0].quantity || 0 });
    } else {
      onSave(fields.map(f => ({
        clientName: form.clientName.trim(),
        name:       f.name,
        quantity:   f.quantity || 0,
      })));
    }
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...s.modal, maxWidth:"500px" }} className="modal-inner">
        <div style={s.modalTitle}>{isEdit ? "עריכת לקוח" : "הוספת לקוח חדש"}</div>

        {/* שם לקוח עם autocomplete */}
        <div style={{ ...s.formGroup, position:"relative" }}>
          <label style={s.label}>שם הלקוח *</label>
          <input style={s.input} placeholder="ישראל ישראלי"
            value={form.clientName}
            onChange={e => { set("clientName")(e); setShowSuggestions(true); }}
            onFocus={e => { fo(e); setShowSuggestions(true); }}
            onBlur={e => { bl(e); setTimeout(() => setShowSuggestions(false), 150); }}
            autoComplete="off"
          />

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position:"absolute", top:"100%", right:0, left:0, zIndex:100,
              background:"#fff", border:"1px solid #e5e7eb", borderRadius:"8px",
              boxShadow:"0 8px 24px rgba(0,0,0,0.12)", marginTop:"4px", overflow:"hidden",
            }}>
              <div style={{ padding:"6px 12px", fontSize:"10px", color:"#a3a3a3", borderBottom:"1px solid #f0f0ef" }}>
                לקוחות קיימים — בחר להוסיף מטע
              </div>
              {suggestions.map(name => (
                <div key={name}
                  onMouseDown={() => {
                    setForm(p => ({ ...p, clientName: name }));
                    setShowSuggestions(false);
                  }}
                  style={{
                    padding:"10px 14px", fontSize:"13px", color:"#374151",
                    cursor:"pointer", display:"flex", alignItems:"center", gap:"8px",
                    borderBottom:"1px solid #f9f9f8",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ color:"#16a34a" }}>👤</span>
                  {name}
                  <span style={{ marginRight:"auto", fontSize:"11px", color:"#a3a3a3" }}>
                    {existingClients.filter(c => c.clientName === name).length} מטעים
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* אדמות */}
        <div style={{ borderTop:"1px solid #f0f0ef", paddingTop:"16px", marginTop:"4px" }}>
          <div style={{ fontSize:"13px", fontWeight:"600", color:"#374151", marginBottom:"12px" }}>
            🌾 אדמות / מטעים
          </div>

          {fields.map((f, i) => (
            <div key={i} style={{
              background:"#f8fdf9", borderRadius:"10px", border:"1px solid #e5f0e8",
              padding:"14px", marginBottom:"10px",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                <span style={{ fontSize:"12px", fontWeight:"600", color:"#16a34a" }}>
                  {isEdit ? "פרטי המטע" : `מטע ${i + 1}`}
                </span>
                {!isEdit && fields.length > 1 && (
                  <button onClick={() => removeField(i)} style={{
                    background:"none", border:"none", cursor:"pointer",
                    color:"#e11d48", fontSize:"18px", lineHeight:1, padding:"0 4px",
                  }}>×</button>
                )}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                <div>
                  <label style={s.label}>שם מטע / ארץ</label>
                  <input style={s.input} placeholder="שם הכפר, אזור..."
                    value={f.name} onChange={setField(i, "name")} onFocus={fo} onBlur={bl}/>
                </div>
                <div>
                  <label style={s.label}>דונמים</label>
                  <input style={s.input} type="number" placeholder="0"
                    value={f.quantity} onChange={setField(i, "quantity")} onFocus={fo} onBlur={bl}/>
                </div>
              </div>
            </div>
          ))}

          {!isEdit && (
            <button onClick={addField} style={{
              width:"100%", padding:"9px", border:"1px dashed #86efac",
              borderRadius:"8px", background:"transparent", color:"#16a34a",
              fontSize:"13px", fontWeight:"500", cursor:"pointer", fontFamily:"inherit",
              marginBottom:"4px", transition:"all 0.15s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.background="#f0fdf4";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
              + הוספת מטע
            </button>
          )}
        </div>

        <div style={s.btnRow}>
          <button style={s.btnCancel} onClick={onClose}>ביטול</button>
          <button style={s.btnSave}
            disabled={loading || !form.clientName.trim()}
            onClick={handleSave}>
            {loading ? "שומר..." : isEdit ? "עדכן" : `הוסף${fields.length > 1 ? ` (${fields.length} מטעים)` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function ClientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);

  const { data: clients = [], isLoading } = useQuery({ queryKey: ["clients"], queryFn: fetchClients });

  const addMut = useMutation({
    mutationFn: createClient,
    onSuccess: () => { qc.invalidateQueries(["clients"]); toast.success("לקוח נוסף בהצלחה"); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.message || "שגיאה"),
  });

  const editMut = useMutation({
    mutationFn: updateClient,
    onSuccess: () => { qc.invalidateQueries(["clients"]); toast.success("לקוח עודכן"); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.message || "שגיאה"),
  });

  const delMut = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => { qc.invalidateQueries(["clients"]); toast.success("לקוח נמחק"); setDelConfirm(null); },
    onError: (e) => toast.error(e.response?.data?.message || "שגיאה"),
  });

  const filtered = clients.filter(c =>
    c.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (formData) => {
    if (Array.isArray(formData)) {
      try {
        for (const record of formData) {
          await createClient(record);
        }
        qc.invalidateQueries(["clients"]);
        toast.success(formData.length > 1 ? `${formData.length} קרקעות נוספו` : "לקוח נוסף בהצלחה");
        setModal(null);
      } catch (e) {
        toast.error(e.response?.data?.message || "שגיאה");
      }
    } else {
      if (modal?._id) editMut.mutate({ id: modal._id, ...formData });
      else addMut.mutate(formData);
    }
  };

  return (
    <div style={s.page} className="page-pad">

      {/* Top row */}
      <div style={s.topRow} className="top-row">
        <div>
          <div style={s.title}>לקוחות</div>
          <div style={s.sub}>{clients.length} לקוחות רשומים</div>
        </div>
        <button style={s.btnPrimary} onClick={() => setModal("add")}
          onMouseEnter={e => e.currentTarget.style.background = "#15803d"}
          onMouseLeave={e => e.currentTarget.style.background = "#16a34a"}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          הוסף לקוח
        </button>
      </div>

      {/* Search */}
      <div style={s.searchWrap}>
        <span style={s.searchIcon}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          style={s.searchInput}
          placeholder="חיפוש לפי שם, טלפון או כתובת..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={e => e.target.style.borderColor = "#86efac"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"}
        />
      </div>

      {/* Table */}
      <div style={s.card}>
        {isLoading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#a3a3a3", fontSize: "14px" }}>
            טוען...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "56px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>👥</div>
            <div style={{ fontSize: "15px", fontWeight: "500", color: "#525252" }}>
              {search ? "לא נמצאו תוצאות" : "אין לקוחות עדיין"}
            </div>
            <div style={{ fontSize: "13px", color: "#a3a3a3", marginTop: "6px" }}>
              {!search && "לחץ על 'הוסף לקוח' להתחלה"}
            </div>
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {["שם לקוח", "שם מטע / ארץ", "דונמים", ""].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c._id}
                  style={{ background: i % 2 === 0 ? "#fff" : "#fefefe" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f9fdf9"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fefefe"}
                >
                  <td style={s.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: "#f0fdf4", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "13px", fontWeight: "600", color: "#16a34a",
                        flexShrink: 0,
                      }}>
                        {c.clientName?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: "500", color: "#1a1a1a" }}>{c.clientName}</span>
                    </div>
                  </td>
                  <td style={s.td}>{c.name || "—"}</td>
                  <td style={s.td}>
                    {c.quantity ? (
                      <span style={s.badge}>🌾 {c.quantity}</span>
                    ) : "—"}
                  </td>
                  <td style={{ ...s.td, width: "80px" }}>
                    <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                      <button style={s.iconBtn} title="עריכה"
                        onClick={() => setModal(c)}
                        onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.color = "#16a34a"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#a3a3a3"; }}
                      >
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button style={s.iconBtn} title="מחיקה"
                        onClick={() => setDelConfirm(c)}
                        onMouseEnter={e => { e.currentTarget.style.background = "#fff1f2"; e.currentTarget.style.color = "#e11d48"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#a3a3a3"; }}
                      >
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
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

      {/* Add/Edit Modal */}
      {modal && (
        <ClientModal
          initial={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          loading={addMut.isPending || editMut.isPending}
          existingClients={clients}
        />
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && setDelConfirm(null)}>
          <div style={{ ...s.modal, maxWidth: "380px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🗑️</div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1a1a1a", marginBottom: "8px" }}>
              מחיקת לקוח
            </div>
            <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>
              האם למחוק את <strong>{delConfirm.clientName}</strong>? פעולה זו אינה ניתנת לביטול.
            </div>
            <div style={s.btnRow}>
              <button style={s.btnCancel} onClick={() => setDelConfirm(null)}>ביטול</button>
              <button
                style={{ ...s.btnSave, background: "#e11d48" }}
                disabled={delMut.isPending}
                onClick={() => delMut.mutate(delConfirm._id)}
              >
                {delMut.isPending ? "מוחק..." : "מחק"}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
