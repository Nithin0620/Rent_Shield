import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import useAuth from "../hooks/useAuth";
import { useToast } from "../components/ui/ToastProvider";
import { UserRole } from "../types/auth";

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "tenant" as UserRole });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: loginUser } = useAuth();
  const navigate = useNavigate();
  const { push } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await register(form);
      loginUser(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken });
      push("Account created.", "success");
      navigate("/dashboard");
    } catch {
      setError("Registration failed.");
      push("Registration failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-2xl font-semibold text-white">Create account</h1>
        <p className="mt-2 text-sm text-slate-300">Join the RentShield escrow network.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400"
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
          <select
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}
          >
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
          </select>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-neon-500 px-4 py-3 text-sm font-semibold text-midnight-900 glow hover:bg-neon-600 transition"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-neon-500 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
