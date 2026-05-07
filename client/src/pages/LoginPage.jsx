import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import api from "../services/api.js";
import toast from "react-hot-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/users/login", form);
      setAuth(data.data.user, data.data.accessToken);
      toast.success("ברוכים הבאים!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "שגיאה בכניסה לחשבון");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg mb-4">
            <span className="text-2xl text-white font-bold">ח.א</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ח.א חקלאות</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">מערכת ניהול חקלאית</p>
        </div>

        <div className="card shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">כניסה לחשבון</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">דואר אלקטרוני</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                className="input"
                placeholder="example@mail.com"
              />
            </div>

            <div>
              <label className="label">סיסמא</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input pl-10"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  מתחבר...
                </span>
              ) : "כניסה"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} ח.א חקלאות — כל הזכויות שמורות
        </p>

        {/* A.Shaalan Tech signature */}
        <div style={{ textAlign:"center", marginTop:"12px" }}>
          <div style={{ fontSize:"11px", color:"#c4c4c4", marginBottom:"8px", letterSpacing:"0.06em" }}>
            פותח ועוצב על ידי
          </div>
          <img
            src="/logo-shaalan.png"
            alt="A.Shaalan Tech"
            style={{ height:"60px", width:"auto", display:"inline-block" }}
          />
          <div style={{ fontSize:"10px", color:"#c4c4c4", marginTop:"6px", letterSpacing:"0.06em" }}>
            © {new Date().getFullYear()} כל הזכויות שמורות
          </div>
        </div>
      </div>
    </div>
  );
}
