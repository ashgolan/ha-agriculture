import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar       from "./Sidebar.jsx";
import Header        from "./Header.jsx";
import BottomNav     from "./BottomNav.jsx";
import Dashboard     from "../../pages/dashboard/Dashboard.jsx";
import ClientsPage   from "../../pages/clients/ClientsPage.jsx";
import SalesPage     from "../../pages/sales/SalesPage.jsx";
import ExpensesPage  from "../../pages/expenses/ExpensesPage.jsx";
import BidsPage      from "../../pages/bids/BidsPage.jsx";
import PersonalPage  from "../../pages/personal/PersonalPage.jsx";
import ReportsPage   from "../../pages/reports/ReportsPage.jsx";
import SettingsPage  from "../../pages/settings/SettingsPage.jsx";

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const fn = () => setWidth(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return width;
}

export default function DashboardLayout() {
  const width    = useWindowWidth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isMobile  = width < 768;
  const isDesktop = width >= 1024;

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"#f9fafb", direction:"rtl", position:"relative" }}>

      {/* ── Desktop: fixed sidebar ── */}
      {isDesktop && <Sidebar />}

      {/* ── Tablet + Mobile: overlay sidebar (opened by hamburger) ── */}
      {!isDesktop && (
        <>
          {/* Overlay */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:100 }}
            />
          )}
          {/* Sidebar panel */}
          <div style={{
            position:"fixed", top:0, right:0, height:"100vh", zIndex:101,
            transform: sidebarOpen ? "translateX(0)" : "translateX(100%)",
            transition:"transform 0.28s cubic-bezier(0.4,0,0.2,1)",
            willChange:"transform",
          }}>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* ── Main content ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

        <Header
          showHamburger={!isDesktop}
          onHamburger={() => setSidebarOpen(p => !p)}
        />

        <main style={{
          flex:1,
          overflowY:"auto",
          paddingBottom: isMobile ? "72px" : "0",
        }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients"   element={<ClientsPage />} />
            <Route path="/sales"     element={<SalesPage />} />
            <Route path="/expenses"  element={<ExpensesPage />} />
            <Route path="/bids"      element={<BidsPage />} />
            <Route path="/personal"  element={<PersonalPage />} />
            <Route path="/reports"   element={<ReportsPage />} />
            <Route path="/settings"  element={<SettingsPage />} />
            <Route path="*"          element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* ── Mobile only: bottom navigation ── */}
      {isMobile && <BottomNav />}
    </div>
  );
}
