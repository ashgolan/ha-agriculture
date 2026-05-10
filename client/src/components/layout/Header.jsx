import { useLocation } from "react-router-dom";

const pageTitles = {
  "/dashboard": { he:"לוח בקרה",     sub:"סקירה כללית" },
  "/clients":   { he:"לקוחות",        sub:"ניהול לקוחות" },
  "/sales":     { he:"הכנסות",         sub:"מעקב עסקאות" },
  "/expenses":  { he:"הוצאות",         sub:"ניהול הוצאות" },
  "/bids":      { he:"הצעות מחיר",     sub:"הצעות ואישורים" },
  "/personal":  { he:"אישי",           sub:"נתונים אישיים" },
  "/reports":   { he:"דוחות",          sub:"ניתוח ודוחות" },
  "/settings":  { he:"הגדרות",         sub:"מחירים ומסים" },
};

export default function Header({ showHamburger, onHamburger }) {
  const { pathname } = useLocation();
  const page = pageTitles[pathname] || { he:"ח.א חקלאות", sub:"" };
  const dateStr = new Date().toLocaleDateString("he-IL", {
    weekday:"long", year:"numeric", month:"long", day:"numeric",
  });

  return (
    <header style={{
      height: "60px",
      background: "#ffffff",
      borderBottom: "1px solid #f0f0ef",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      flexShrink: 0,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      gap: "12px",
    }}>

      {/* Left — date (hidden on mobile) */}
      <div style={{ fontSize:"12px", color:"#a3a3a3", display:"flex", alignItems:"center", gap:"6px", flexShrink:0 }}
        className="hide-mobile">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {dateStr}
      </div>

      {/* Right — page title */}
      <div style={{ textAlign:"right", flex:1 }}>
        <div style={{ fontSize:"16px", fontWeight:"600", color:"#1a1a1a", lineHeight:1.2 }}>{page.he}</div>
        {page.sub && <div style={{ fontSize:"11px", color:"#a3a3a3", marginTop:"1px" }}>{page.sub}</div>}
      </div>

      {/* Hamburger — tablet & mobile */}
      {showHamburger && (
        <button onClick={onHamburger} style={{
          background:"none", border:"1px solid #e5e7eb", borderRadius:"8px",
          padding:"7px", cursor:"pointer", display:"flex", alignItems:"center",
          color:"#6b7280", flexShrink:0, transition:"all 0.15s",
        }}
          onMouseEnter={e=>{e.currentTarget.style.background="#f0fdf4";e.currentTarget.style.borderColor="#86efac";}}
          onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.borderColor="#e5e7eb";}}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      )}
    </header>
  );
}
