import { useState, useRef } from "react";

export default function EmergencyRestore() {
  const fileRef  = useRef(null);
  const [key, setKey]       = useState("");
  const [file, setFile]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState("");

  const handleSubmit = async () => {
    if (!key.trim()) return setError("נא להזין מפתח שחזור");
    if (!file)       return setError("נא לבחור קובץ גיבוי");

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("backup", file);
      formData.append("secretKey", key);

      const res = await fetch("/api/backup/emergency-restore", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message);
      setResult(data.data.restored);
    } catch (e) {
      setError(e.message || "שגיאה בשחזור");
    } finally {
      setLoading(false);
    }
  };

  if (result) return (
    <div style={{ minHeight:"100vh", background:"#f9fafb", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", direction:"rtl" }}>
      <div style={{ background:"#fff", borderRadius:"16px", padding:"32px", maxWidth:"420px", width:"100%", textAlign:"center", boxShadow:"0 8px 32px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize:"48px", marginBottom:"16px" }}>✅</div>
        <div style={{ fontSize:"20px", fontWeight:"700", color:"#1a1a1a", marginBottom:"8px" }}>הנתונים שוחזרו בהצלחה!</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", margin:"20px 0" }}>
          {Object.entries(result).map(([key, count]) => {
            const labels = {
              sales:"מכירות", expenses:"הוצאות", clients:"לקוחות",
              bids:"הצעות מחיר", users:"משתמשים",
              personalSales:"הכנסות אישיות", personalWorkers:"עובדים",
              personalRkrExpenses:"ריסוס", personalProductExpenses:"מוצרים",
              personalInvestments:"השקעות",
            };
            if (count === 0) return null;
            return (
              <div key={key} style={{ background:"#f0fdf4", borderRadius:"8px", padding:"10px", border:"1px solid #86efac" }}>
                <div style={{ fontSize:"20px", fontWeight:"700", color:"#16a34a" }}>{count}</div>
                <div style={{ fontSize:"11px", color:"#6b7280" }}>{labels[key]||key}</div>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => window.location.href = "/login"}
          style={{ width:"100%", padding:"13px", background:"#16a34a", color:"#fff", border:"none", borderRadius:"10px", fontSize:"15px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit" }}>
          עבור לדף הכניסה
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f9fafb", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", direction:"rtl" }}>
      <div style={{ background:"#fff", borderRadius:"16px", padding:"32px", maxWidth:"420px", width:"100%", boxShadow:"0 8px 32px rgba(0,0,0,0.1)" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"28px" }}>
          <div style={{ fontSize:"40px", marginBottom:"12px" }}>🚨</div>
          <div style={{ fontSize:"20px", fontWeight:"700", color:"#1a1a1a", marginBottom:"6px" }}>שחזור חירום</div>
          <div style={{ fontSize:"13px", color:"#a3a3a3", lineHeight:"1.6" }}>
            שחזור נתונים ללא צורך בהתחברות.<br/>
            הזן את מפתח השחזור שהגדרת בשרת.
          </div>
        </div>

        {/* Warning */}
        <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:"10px", padding:"12px 16px", marginBottom:"24px", fontSize:"12px", color:"#9a3412" }}>
          ⚠️ פעולה זו תמחק ותחליף את כל הנתונים הקיימים בנתונים מהגיבוי.
        </div>

        {/* Secret key */}
        <div style={{ marginBottom:"16px" }}>
          <label style={{ display:"block", fontSize:"12px", fontWeight:"500", color:"#6b7280", marginBottom:"6px" }}>
            מפתח שחזור סודי
          </label>
          <input
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="הזן את המפתח הסודי..."
            style={{ width:"100%", padding:"11px 14px", border:"1px solid #e5e7eb", borderRadius:"8px", fontSize:"14px", fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}
            onFocus={e => e.target.style.borderColor = "#86efac"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        {/* File select */}
        <div style={{ marginBottom:"20px" }}>
          <label style={{ display:"block", fontSize:"12px", fontWeight:"500", color:"#6b7280", marginBottom:"6px" }}>
            קובץ גיבוי (ZIP)
          </label>
          <input ref={fileRef} type="file" accept=".zip" onChange={e => setFile(e.target.files?.[0]||null)} style={{ display:"none" }}/>
          <button
            onClick={() => fileRef.current?.click()}
            style={{ width:"100%", padding:"11px", border:"2px dashed #e5e7eb", borderRadius:"8px", background:"#fafaf9", fontSize:"14px", color: file ? "#16a34a" : "#9ca3af", cursor:"pointer", fontFamily:"inherit", fontWeight: file?"600":"400", transition:"all 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#86efac"}
            onMouseLeave={e=>e.currentTarget.style.borderColor=file?"#86efac":"#e5e7eb"}>
            {file ? `✅ ${file.name}` : "📁 בחר קובץ ZIP"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:"8px", padding:"10px 14px", marginBottom:"16px", fontSize:"13px", color:"#b91c1c" }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !key || !file}
          style={{ width:"100%", padding:"13px", background:"#16a34a", color:"#fff", border:"none", borderRadius:"10px", fontSize:"15px", fontWeight:"600", cursor: loading||!key||!file ? "not-allowed":"pointer", fontFamily:"inherit", opacity: loading||!key||!file ? 0.6 : 1, transition:"all 0.15s" }}>
          {loading ? "משחזר נתונים..." : "שחזר עכשיו"}
        </button>

        <div style={{ textAlign:"center", marginTop:"16px" }}>
          <a href="/login" style={{ fontSize:"13px", color:"#a3a3a3", textDecoration:"none" }}>
            ← חזור לדף הכניסה
          </a>
        </div>
      </div>
    </div>
  );
}
