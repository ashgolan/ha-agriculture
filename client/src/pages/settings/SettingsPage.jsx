import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api.js";
import toast from "react-hot-toast";

const fetchTractor = () => api.get("/tractorPrice").then(r => r.data.data);
const fetchTax     = () => api.get("/taxValues").then(r => r.data.data);
const toNum = (v) => parseFloat(v) || 0;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const s = {
  page:      { padding:"28px 32px", direction:"rtl", maxWidth:"680px" },
  title:     { fontSize:"20px", fontWeight:"600", color:"#1a1a1a", marginBottom:"4px" },
  sub:       { fontSize:"13px", color:"#a3a3a3", marginBottom:"28px" },
  card:      { background:"#fff", borderRadius:"12px", border:"1px solid #f0f0ef", padding:"24px", marginBottom:"16px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" },
  cardTitle: { fontSize:"15px", fontWeight:"600", color:"#1a1a1a", marginBottom:"4px", display:"flex", alignItems:"center", gap:"8px" },
  cardSub:   { fontSize:"12px", color:"#a3a3a3", marginBottom:"20px" },
  label:     { display:"block", fontSize:"12px", fontWeight:"500", color:"#6b7280", marginBottom:"6px" },
  row:       { display:"flex", gap:"12px", alignItems:"flex-end" },
  input:     { flex:1, padding:"11px 14px", border:"1px solid #e5e7eb", borderRadius:"8px", fontSize:"15px", fontFamily:"inherit", color:"#1a1a1a", outline:"none", transition:"border-color 0.15s", boxSizing:"border-box" },
  btn:       { padding:"11px 22px", background:"#16a34a", color:"#fff", border:"none", borderRadius:"8px", fontSize:"14px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", whiteSpace:"nowrap" },
  divider:   { borderTop:"1px solid #f5f5f4", margin:"20px 0" },
  preview:   { background:"#f0fdf4", border:"1px solid #86efac", borderRadius:"8px", padding:"12px 16px", marginTop:"12px", fontSize:"13px", color:"#15803d" },
  overlay:   { position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"16px" },
  modal:     { background:"#fff", borderRadius:"16px", width:"100%", maxWidth:"400px", padding:"28px", boxShadow:"0 20px 60px rgba(0,0,0,0.15)", direction:"rtl", textAlign:"center" },
};

const fo = (e) => { e.target.style.borderColor = "#86efac"; };
const bl = (e) => { e.target.style.borderColor = "#e5e7eb"; };

// ─── Tractor Price ────────────────────────────────────────────
function TractorCard({ qc }) {
  const { data: arr = [], isLoading } = useQuery({ queryKey:["tractorPrice"], queryFn:fetchTractor });
  const existing = arr?.[0];
  const [val, setVal] = useState("");

  const saveMut = useMutation({
    mutationFn: (price) =>
      existing?._id
        ? api.patch(`/tractorPrice/${existing._id}`, { price: String(price) })
        : api.post("/tractorPrice", { price: String(price) }),
    onSuccess: () => { qc.invalidateQueries(["tractorPrice"]); toast.success("מחיר הטרקטור עודכן!"); setVal(""); },
    onError: e => toast.error(e.response?.data?.message || "שגיאה"),
  });

  const currentPrice = toNum(existing?.price);
  return (
    <div style={s.card}>
      <div style={s.cardTitle}>🚜 מחיר עבודת הטרקטור</div>
      <div style={s.cardSub}>המחיר לדונם — ישמש אוטומטית בכל מכירה חדשה</div>
      {isLoading ? <div style={{ fontSize:"13px", color:"#a3a3a3" }}>טוען...</div> : (
        <>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px", padding:"14px 16px", background:"#fafaf9", borderRadius:"8px", border:"1px solid #f0f0ef" }}>
            <span style={{ fontSize:"13px", color:"#6b7280" }}>מחיר נוכחי:</span>
            <span style={{ fontSize:"22px", fontWeight:"700", color: currentPrice ? "#16a34a" : "#e11d48" }}>
              {currentPrice ? `${currentPrice} ₪ לדונם` : "לא הוגדר עדיין ⚠️"}
            </span>
          </div>
          <label style={s.label}>{currentPrice ? "עדכן מחיר חדש (₪ לדונם)" : "הגדר מחיר לדונם (₪)"}</label>
          <div style={s.row}>
            <input style={s.input} type="number" min="0"
              placeholder={currentPrice ? String(currentPrice) : "לדוג׳ 150"}
              value={val} onChange={e => setVal(e.target.value)}
              onFocus={fo} onBlur={bl}
              onKeyDown={e => e.key === "Enter" && val && saveMut.mutate(toNum(val))}/>
            <button style={s.btn} disabled={saveMut.isPending || !toNum(val)}
              onClick={() => saveMut.mutate(toNum(val))}
              onMouseEnter={e=>e.currentTarget.style.background="#15803d"}
              onMouseLeave={e=>e.currentTarget.style.background="#16a34a"}>
              {saveMut.isPending ? "שומר..." : currentPrice ? "עדכן" : "הגדר"}
            </button>
          </div>
          {toNum(val) > 0 && (
            <div style={s.preview}>📊 דוגמה: 10 דונמים × {toNum(val)} ₪ = <strong>{(10*toNum(val)).toFixed(0)} ₪</strong></div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Tax Values ───────────────────────────────────────────────
function TaxCard({ qc }) {
  const { data: arr = [], isLoading } = useQuery({ queryKey:["taxValues"], queryFn:fetchTax });
  const existing = arr?.[0];
  const [maam, setMaam] = useState("");
  const [mas, setMas]   = useState("");

  const saveMut = useMutation({
    mutationFn: (body) =>
      existing?._id
        ? api.patch(`/taxValues/${existing._id}`, body)
        : api.post("/taxValues", body),
    onSuccess: () => { qc.invalidateQueries(["taxValues"]); toast.success("ערכי המס עודכנו!"); setMaam(""); setMas(""); },
    onError: e => toast.error(e.response?.data?.message || "שגיאה"),
  });

  const currentMaam = toNum(existing?.maamValue) || 17;
  const currentMas  = toNum(existing?.masValue)  || 0;

  return (
    <div style={s.card}>
      <div style={s.cardTitle}>📊 ערכי מס</div>
      <div style={s.cardSub}>שיעורי מע"מ ומס הכנסה</div>
      {isLoading ? <div style={{ fontSize:"13px", color:"#a3a3a3" }}>טוען...</div> : (
        <>
          <div style={{ display:"flex", gap:"16px", marginBottom:"20px" }}>
            {[{ label:'מע"מ נוכחי', value:currentMaam, color:"#d97706" },{ label:"מס הכנסה נוכחי", value:currentMas, color:"#7c3aed" }].map(item=>(
              <div key={item.label} style={{ flex:1, padding:"14px", background:"#fafaf9", borderRadius:"8px", border:"1px solid #f0f0ef", textAlign:"center" }}>
                <div style={{ fontSize:"11px", color:"#a3a3a3", marginBottom:"6px" }}>{item.label}</div>
                <div style={{ fontSize:"24px", fontWeight:"700", color:item.color }}>{item.value}%</div>
              </div>
            ))}
          </div>
          <div style={s.divider}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"14px" }} className="modal-grid2">
            <div><label style={s.label}>מע"מ חדש (%)</label><input style={s.input} type="number" placeholder={String(currentMaam)} value={maam} onChange={e=>setMaam(e.target.value)} onFocus={fo} onBlur={bl}/></div>
            <div><label style={s.label}>מס הכנסה (%)</label><input style={s.input} type="number" placeholder={String(currentMas)} value={mas} onChange={e=>setMas(e.target.value)} onFocus={fo} onBlur={bl}/></div>
          </div>
          <button style={{ ...s.btn, width:"100%" }} disabled={saveMut.isPending}
            onClick={() => saveMut.mutate({ maamValue: maam||String(currentMaam), masValue: mas||String(currentMas) })}
            onMouseEnter={e=>e.currentTarget.style.background="#15803d"}
            onMouseLeave={e=>e.currentTarget.style.background="#16a34a"}>
            {saveMut.isPending ? "שומר..." : "עדכן ערכי מס"}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Backup Card ──────────────────────────────────────────────
function BackupCard() {
  const fileRef = useRef(null);
  const [importing, setImporting]   = useState(false);
  const [confirmFile, setConfirmFile] = useState(null);
  const [result, setResult]         = useState(null);
  const [emailSending, setEmailSending] = useState(false);
  const [lastBackup, setLastBackup] = useState(() => localStorage.getItem("lastManualBackup"));
  const [weekReminder, setWeekReminder] = useState(false);

  // Weekly reminder check
  useEffect(() => {
    const last = Number(localStorage.getItem("lastManualBackup") || 0);
    const lastReminder = Number(localStorage.getItem("lastBackupReminder") || 0);
    const now = Date.now();
    if (now - last >= WEEK_MS && now - lastReminder >= WEEK_MS) {
      setWeekReminder(true);
      localStorage.setItem("lastBackupReminder", String(now));
    }
  }, []);

  // Download backup
  const handleDownload = async () => {
    try {
      const res = await api.get("/backup/export", { responseType:"blob" });
      const date = new Date().toLocaleDateString("he-IL").replace(/\//g,"-");
      const url  = URL.createObjectURL(new Blob([res.data], { type:"application/zip" }));
      const a    = document.createElement("a");
      a.href = url;
      a.download = `גיבוי_חקלאות_${date}.zip`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      const now = String(Date.now());
      localStorage.setItem("lastManualBackup", now);
      setLastBackup(now);
      setWeekReminder(false);
      toast.success("הגיבוי הורד בהצלחה! 💾");
    } catch (e) {
      toast.error("שגיאה בהורדת הגיבוי");
    }
  };

  // Send email manually
  const handleSendEmail = async () => {
    setEmailSending(true);
    try {
      await api.post("/backup/send-email");
      toast.success("הגיבוי נשלח לאימייל בהצלחה! 📧");
    } catch (e) {
      toast.error(e.response?.data?.message || "שגיאה בשליחת האימייל");
    } finally {
      setEmailSending(false);
    }
  };

  // File select for import
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setConfirmFile(file);
    e.target.value = "";
  };

  // Confirm import
  const handleImport = async () => {
    if (!confirmFile) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("backup", confirmFile);
      const res = await api.post("/backup/import", formData, {
        headers: { "Content-Type":"multipart/form-data" },
      });
      setResult(res.data.data.restored);
      setConfirmFile(null);
      toast.success("הנתונים שוחזרו בהצלחה! ✅");
    } catch (e) {
      toast.error(e.response?.data?.message || "שגיאה בשחזור הגיבוי");
      setConfirmFile(null);
    } finally {
      setImporting(false);
    }
  };

  const lastBackupDate = lastBackup
    ? new Date(Number(lastBackup)).toLocaleDateString("he-IL", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" })
    : "לא בוצע עדיין";

  return (
    <>
      {/* ── Weekly reminder banner ── */}
      {weekReminder && (
        <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:"10px", padding:"14px 18px", marginBottom:"16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ fontSize:"20px" }}>⚠️</span>
            <div>
              <div style={{ fontSize:"13px", fontWeight:"600", color:"#92400e" }}>תזכורת גיבוי שבועית</div>
              <div style={{ fontSize:"12px", color:"#b45309" }}>עברה שבוע מאז הגיבוי האחרון — מומלץ לגבות עכשיו</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:"8px" }}>
            <button onClick={handleDownload} style={{ ...s.btn, padding:"8px 14px", fontSize:"12px" }}>גבה עכשיו</button>
            <button onClick={() => setWeekReminder(false)} style={{ padding:"8px 12px", border:"1px solid #fde68a", borderRadius:"8px", background:"transparent", fontSize:"12px", color:"#92400e", cursor:"pointer", fontFamily:"inherit" }}>סגור</button>
          </div>
        </div>
      )}

      <div style={s.card}>
        <div style={s.cardTitle}>💾 גיבוי ושחזור נתונים</div>
        <div style={s.cardSub}>גיבוי מלא של כל הנתונים — מכירות, הוצאות, לקוחות, הצעות מחיר ועוד</div>

        {/* Last backup info */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"12px 16px", background:"#fafaf9", borderRadius:"8px", border:"1px solid #f0f0ef", marginBottom:"20px" }}>
          <span style={{ fontSize:"18px" }}>🕐</span>
          <div>
            <div style={{ fontSize:"11px", color:"#a3a3a3" }}>גיבוי ידני אחרון</div>
            <div style={{ fontSize:"13px", fontWeight:"500", color:"#374151" }}>{lastBackupDate}</div>
          </div>
          <div style={{ marginRight:"auto", textAlign:"left" }}>
            <div style={{ fontSize:"11px", color:"#a3a3a3" }}>גיבוי אוטומטי</div>
            <div style={{ fontSize:"12px", fontWeight:"500", color:"#16a34a" }}>כל יום 01:00 בלילה ✅</div>
          </div>
        </div>

        <div style={s.divider}/>

        {/* Export section */}
        <div style={{ marginBottom:"20px" }}>
          <div style={{ fontSize:"13px", fontWeight:"600", color:"#374151", marginBottom:"12px" }}>📤 יצוא גיבוי</div>
          <button onClick={handleDownload} style={{
            ...s.btn, display:"flex", alignItems:"center", gap:"8px",
          }}
            onMouseEnter={e=>e.currentTarget.style.background="#15803d"}
            onMouseLeave={e=>e.currentTarget.style.background="#16a34a"}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            הורד גיבוי (ZIP)
          </button>
        </div>

        <div style={s.divider}/>

        {/* Import section */}
        <div>
          <div style={{ fontSize:"13px", fontWeight:"600", color:"#374151", marginBottom:"6px" }}>📥 שחזור מגיבוי</div>
          <div style={{ fontSize:"12px", color:"#a3a3a3", marginBottom:"12px" }}>
            בחר קובץ ZIP של גיבוי קודם — כל הנתונים הקיימים יוחלפו בנתונים מהגיבוי
          </div>
          <input ref={fileRef} type="file" accept=".zip" onChange={handleFileSelect} style={{ display:"none" }}/>
          <button onClick={() => fileRef.current?.click()} style={{
            display:"flex", alignItems:"center", gap:"8px",
            padding:"11px 18px", background:"#faeeda", color:"#633806",
            border:"1px solid #ef9f27", borderRadius:"8px", fontSize:"14px",
            fontWeight:"600", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s",
          }}
            onMouseEnter={e=>e.currentTarget.style.background="#f5e0c0"}
            onMouseLeave={e=>e.currentTarget.style.background="#faeeda"}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            בחר קובץ גיבוי לשחזור
          </button>
        </div>
      </div>

      {/* ── Confirm Import Modal ── */}
      {confirmFile && (
        <div style={s.overlay} onClick={e => e.target===e.currentTarget && setConfirmFile(null)}>
          <div style={s.modal}>
            <div style={{ fontSize:"36px", marginBottom:"12px" }}>⚠️</div>
            <div style={{ fontSize:"16px", fontWeight:"700", color:"#1a1a1a", marginBottom:"10px" }}>שחזור גיבוי</div>
            <div style={{ fontSize:"13px", color:"#6b7280", lineHeight:"1.7", marginBottom:"16px" }}>
              פעולה זו תמחק את <strong>כל הנתונים הקיימים</strong> ותחליף אותם בנתונים מקובץ הגיבוי.<br/>
              <span style={{ color:"#e11d48", fontWeight:"600" }}>לא ניתן לבטל פעולה זו.</span>
            </div>
            <div style={{ background:"#f8f8f8", borderRadius:"10px", padding:"10px 14px", fontSize:"12px", color:"#888", marginBottom:"20px" }}>
              📦 {confirmFile.name}
            </div>
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={() => setConfirmFile(null)} style={{ flex:1, padding:"12px", border:"1px solid #e5e7eb", borderRadius:"10px", background:"#fff", fontSize:"14px", fontWeight:"500", color:"#6b7280", cursor:"pointer", fontFamily:"inherit" }}>
                ביטול
              </button>
              <button onClick={handleImport} disabled={importing} style={{ flex:2, padding:"12px", border:"none", borderRadius:"10px", background:"#e11d48", fontSize:"14px", fontWeight:"700", color:"#fff", cursor:"pointer", fontFamily:"inherit", opacity:importing?0.7:1 }}>
                {importing ? "משחזר..." : "אישור — שחזר עכשיו"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Result Modal ── */}
      {result && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={{ fontSize:"36px", marginBottom:"12px" }}>✅</div>
            <div style={{ fontSize:"16px", fontWeight:"700", color:"#1a1a1a", marginBottom:"16px" }}>הגיבוי שוחזר בהצלחה!</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"20px" }}>
              {Object.entries(result).map(([key, count]) => {
                const labels = {
                  sales:"מכירות", expenses:"הוצאות", clients:"לקוחות",
                  bids:"הצעות מחיר", users:"משתמשים", tractorPrices:"מחיר טרקטור",
                  taxValues:"ערכי מס", personalSales:"הכנסות אישיות",
                  personalWorkers:"עובדים", personalRkrExpenses:"ריסוס-קיסוח",
                  personalProductExpenses:"מוצרים", personalInvestments:"השקעות",
                  personalTractorPrices:"טרקטור אישי",
                };
                return (
                  <div key={key} style={{ background:"#f0fdf4", borderRadius:"8px", padding:"10px", border:"1px solid #86efac" }}>
                    <div style={{ fontSize:"18px", fontWeight:"700", color:"#16a34a" }}>{count}</div>
                    <div style={{ fontSize:"11px", color:"#6b7280" }}>{labels[key]||key}</div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => { setResult(null); window.location.reload(); }} style={{ ...s.btn, width:"100%", padding:"13px" }}>
              סיום — רענן את הדף
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function SettingsPage() {
  const qc = useQueryClient();
  return (
    <div style={s.page} className="page-pad">
      <div style={s.title}>הגדרות</div>
      <div style={s.sub}>הגדרות מערכת — מחירים, מסים וגיבויים</div>
      <TractorCard qc={qc}/>
      <TaxCard qc={qc}/>
      <BackupCard/>
    </div>
  );
}
