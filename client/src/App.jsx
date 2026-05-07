import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore.js";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import EmergencyRestore from "./pages/EmergencyRestore.jsx";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/emergency-restore" element={<EmergencyRestore />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
