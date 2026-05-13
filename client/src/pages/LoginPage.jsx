import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-surface font-bold text-sm">AI</div>
          <span className="text-soft font-semibold text-lg">AI Chat</span>
        </div>
        <h1 className="text-2xl font-semibold text-soft mb-1">Welcome back</h1>
        <p className="text-muted text-sm mb-6">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg">{error}</div>}
          {[{ key: "email", label: "Email", type: "email", placeholder: "you@example.com" }, { key: "password", label: "Password", type: "password", placeholder: "••••••••" }].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-muted mb-1.5 uppercase tracking-wider">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} required className="w-full bg-panel border border-border rounded-lg px-4 py-2.5 text-sm text-soft placeholder-muted focus:outline-none focus:border-accent transition-colors" />
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent-dim text-surface font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="text-center text-muted text-sm mt-6">No account? <Link to="/register" className="text-accent hover:underline">Register</Link></p>
      </div>
    </div>
  );
}
