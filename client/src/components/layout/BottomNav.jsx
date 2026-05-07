import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore.js";
import toast from "react-hot-toast";

const mainItems = [
  { to:"/dashboard", label:"בקרה",
    icon:<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { to:"/clients", label:"לקוחות",
    icon:<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
  { to:"/sales", label:"מכירות",
    icon:<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
  { to:"/expenses", label:"הוצאות",
    icon:<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
  { to:"/personal", label:"אישי",
    icon:<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

const moreItems = [
  { to:"/bids",     label:"הצעות מחיר", emoji:"📋" },
  { to:"/reports",  label:"דוחות",       emoji:"📊" },
  { to:"/settings", label:"הגדרות",      emoji:"⚙️" },
];

export default function BottomNav() {
  const [showMore, setShowMore] = useState(false);
  const { logout }  = useAuthStore();
  const navigate    = useNavigate();
  const location    = useLocation();

  const isMoreActive = moreItems.some(i => location.pathname === i.to);

  const handleLogout = () => {
    setShowMore(false);
    logout();
    navigate("/login");
    toast.success("התנתקת בהצלחה");
  };

  const closeMore = () => setShowMore(false);

  return (
    <>
      {/* ── Overlay for drawer ── */}
      {showMore && (
        <div
          onClick={closeMore}
          style={{
            position:"fixed", inset:0,
            background:"rgba(0,0,0,0.25)",
            zIndex:98,
          }}
        />
      )}

      {/* ── More drawer (slides up) ── */}
      <div style={{
        position:"fixed",
        bottom: showMore ? "64px" : "-300px",
        right:0, left:0,
        zIndex:99,
        background:"#fff",
        borderRadius:"20px 20px 0 0",
        boxShadow:"0 -8px 32px rgba(0,0,0,0.12)",
        padding:"12px 12px 4px",
        transition:"bottom 0.28s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {/* Handle bar */}
        <div style={{
          width:"40px", height:"4px",
          background:"#e5e7eb", borderRadius:"99px",
          margin:"0 auto 16px",
        }}/>

        {moreItems.map(item => (
          <NavLink key={item.to} to={item.to}
            onClick={closeMore}
            style={({ isActive }) => ({
              display:"flex", alignItems:"center", gap:"16px",
              padding:"14px 16px", borderRadius:"12px",
              textDecoration:"none", marginBottom:"2px",
              background: isActive ? "#f0fdf4" : "transparent",
              color: isActive ? "#16a34a" : "#1a1a1a",
              fontWeight: isActive ? "600" : "400",
              fontSize:"15px", fontFamily:"inherit",
            })}>
            <span style={{ fontSize:"22px", lineHeight:1 }}>{item.emoji}</span>
            <span>{item.label}</span>
            {location.pathname === item.to && (
              <span style={{ marginRight:"auto", width:"6px", height:"6px", borderRadius:"50%", background:"#16a34a" }}/>
            )}
          </NavLink>
        ))}

        {/* Divider */}
        <div style={{ borderTop:"1px solid #f5f5f4", margin:"8px 0" }}/>

        {/* Logout */}
        <button onClick={handleLogout} style={{
          display:"flex", alignItems:"center", gap:"16px",
          padding:"14px 16px", borderRadius:"12px", marginBottom:"8px",
          border:"none", background:"#fff5f5", width:"100%",
          color:"#e11d48", fontSize:"15px", fontWeight:"500",
          cursor:"pointer", fontFamily:"inherit",
        }}>
          <span style={{ fontSize:"22px", lineHeight:1 }}>🚪</span>
          <span>התנתק</span>
        </button>
      </div>

      {/* ── Bottom bar ── */}
      <nav style={{
        position:"fixed", bottom:0, right:0, left:0,
        zIndex:100,
        background:"#fff",
        borderTop:"1px solid #f0f0ef",
        display:"flex",
        height:"64px",
        boxShadow:"0 -2px 16px rgba(0,0,0,0.07)",
      }}>
        {mainItems.map(item => (
          <NavLink key={item.to} to={item.to}
            style={({ isActive }) => ({
              flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center",
              gap:"3px", textDecoration:"none",
              color: isActive ? "#16a34a" : "#9ca3af",
              borderTop: isActive ? "2px solid #16a34a" : "2px solid transparent",
              paddingTop:"4px",
              transition:"color 0.15s, border-color 0.15s",
            })}>
            {item.icon}
            <span style={{ fontSize:"10px", fontWeight:"500", letterSpacing:"0.01em" }}>
              {item.label}
            </span>
          </NavLink>
        ))}

        {/* ── More button ── */}
        <button
          onClick={() => setShowMore(p => !p)}
          style={{
            flex:1, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            gap:"3px", border:"none", background:"transparent",
            color: showMore || isMoreActive ? "#16a34a" : "#9ca3af",
            borderTop: showMore || isMoreActive ? "2px solid #16a34a" : "2px solid transparent",
            cursor:"pointer", paddingTop:"4px",
            transition:"color 0.15s, border-color 0.15s",
          }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5"  cy="12" r="1.8"/>
            <circle cx="12" cy="12" r="1.8"/>
            <circle cx="19" cy="12" r="1.8"/>
          </svg>
          <span style={{ fontSize:"10px", fontWeight:"500" }}>עוד</span>
        </button>
      </nav>
    </>
  );
}
