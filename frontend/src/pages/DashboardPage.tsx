import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <section className="card">
      <h1>Welcome back, {user.name}</h1>
      <p className="muted">Role: {user.role}</p>
      <div className="form-grid">
        <Link to={`/dashboard/${user.role}`}>Go to your role dashboard</Link>
        <Link to="/properties">Browse all properties</Link>
        {user.role === "landlord" && <Link to="/properties/new">Create a property</Link>}
      </div>
    </section>
  );
};

export default DashboardPage;
