import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { login as loginRequest } from "../services/authService";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginRequest({ email, password });
      login(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken });
      navigate("/dashboard");
    } catch (err) {
      setError("Unable to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h1>Login</h1>
      <p className="muted">Access your RentShield account.</p>
      <form className="form-grid" onSubmit={handleSubmit}>
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
        {error && <span className="muted">{error}</span>}
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </section>
  );
};

export default LoginPage;
