import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";
import toast from "react-hot-toast";

const navItems = [
  { label:"לוח בקרה",    to:"/dashboard", icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { label:"לקוחות",      to:"/clients",   icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
  { label:"הכנסות",      to:"/sales",     icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
  { label:"הוצאות",      to:"/expenses",  icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
  { label:"הצעות מחיר",  to:"/bids",      icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { label:"אישי",        to:"/personal",  icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { label:"דוחות",       to:"/reports",   icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
];

const settingsItem = {
  label:"הגדרות", to:"/settings",
  icon:<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
};

const linkStyle = (isActive) => ({
  display:"flex", alignItems:"center", gap:"10px",
  padding:"10px 12px", borderRadius:"8px", marginBottom:"2px",
  fontSize:"14px", fontWeight: isActive?"600":"400",
  color: isActive?"#16a34a":"#525252",
  background: isActive?"#f0fdf4":"transparent",
  textDecoration:"none", transition:"all 0.15s",
  borderRight: isActive?"3px solid #16a34a":"3px solid transparent",
});

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); navigate("/login"); toast.success("התנתקת בהצלחה");
  };

  const renderLink = (item) => (
    <NavLink key={item.to} to={item.to}
      style={({ isActive }) => linkStyle(isActive)}
      onClick={onClose}
      onMouseEnter={e=>{ if(!e.currentTarget.getAttribute("aria-current")){ e.currentTarget.style.background="#fafaf9"; e.currentTarget.style.color="#1a1a1a"; }}}
      onMouseLeave={e=>{ if(!e.currentTarget.getAttribute("aria-current")){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#525252"; }}}>
      <span style={{ opacity:0.85, flexShrink:0 }}>{item.icon}</span>
      <span>{item.label}</span>
    </NavLink>
  );

  return (
    <aside style={{
      width:"240px", height:"100vh", background:"#ffffff",
      borderLeft:"1px solid #f0f0ef", display:"flex", flexDirection:"column",
      flexShrink:0, boxShadow:"2px 0 12px rgba(0,0,0,0.04)",
    }}>
      {/* Logo */}
      <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid #f5f5f4", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"38px", height:"38px", background:"linear-gradient(135deg,#16a34a,#4ade80)", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:"700", color:"#fff", boxShadow:"0 4px 12px rgba(22,163,74,0.25)" }}>ח.א</div>
          <div>
            <div style={{ fontSize:"15px", fontWeight:"600", color:"#1a1a1a", lineHeight:1.2 }}>ח.א חקלאות</div>
            <div style={{ fontSize:"11px", color:"#a3a3a3", marginTop:"2px" }}>מערכת ניהול</div>
          </div>
        </div>
        {/* Close button (tablet only) */}
        {onClose && (
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#a3a3a3", padding:"4px", borderRadius:"6px" }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"12px 10px", overflowY:"auto" }}>
        <div style={{ fontSize:"10px", fontWeight:"600", color:"#c4c4c0", letterSpacing:"0.08em", padding:"8px 10px 6px", textTransform:"uppercase" }}>תפריט ראשי</div>
        {navItems.map(renderLink)}
        <div style={{ borderTop:"1px solid #f5f5f4", margin:"10px 0" }}/>
        <div style={{ fontSize:"10px", fontWeight:"600", color:"#c4c4c0", letterSpacing:"0.08em", padding:"4px 10px 6px", textTransform:"uppercase" }}>מערכת</div>
        {renderLink(settingsItem)}
      </nav>

      {/* User */}
      <div style={{ padding:"14px", borderTop:"1px solid #f5f5f4" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px", borderRadius:"8px", background:"#fafaf9", marginBottom:"8px" }}>
          <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"linear-gradient(135deg,#16a34a,#4ade80)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:"700", color:"#fff", flexShrink:0 }}>
            {user?.email?.[0]?.toUpperCase()||"A"}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:"12px", fontWeight:"500", color:"#1a1a1a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email}</div>
            <div style={{ fontSize:"10px", color:"#a3a3a3" }}>{user?.role==="Admin"?"מנהל":"משתמש"}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", padding:"9px", borderRadius:"8px", border:"1px solid #f0f0ef", background:"transparent", fontSize:"13px", fontWeight:"500", color:"#737373", cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit" }}
          onMouseEnter={e=>{e.currentTarget.style.background="#fff1f2";e.currentTarget.style.color="#e11d48";e.currentTarget.style.borderColor="#fecdd3";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#737373";e.currentTarget.style.borderColor="#f0f0ef";}}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          התנתק
        </button>
      </div>
    </aside>
  );
}
