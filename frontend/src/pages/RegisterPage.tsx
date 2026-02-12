import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { register as registerRequest } from "../services/authService";
import { UserRole } from "../types/auth";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("tenant");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await registerRequest({ name, email, password, role });
      login(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken });
      navigate("/dashboard");
    } catch (err) {
      setError("Unable to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h1>Create account</h1>
      <p className="muted">Get started with RentShield.</p>
      <form className="form-grid" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
          <option value="tenant">Tenant</option>
          <option value="landlord">Landlord</option>
          <option value="admin">Admin</option>
        </select>
        {error && <span className="muted">{error}</span>}
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>
      </form>
    </section>
  );
};

export default RegisterPage;
