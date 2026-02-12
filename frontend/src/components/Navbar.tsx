import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard">
          <strong>RentShield</strong>
        </Link>

        <nav className="nav-links">
          {isAuthenticated && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/properties">Properties</Link>
              <Link to="/agreements">My Agreements</Link>
              <Link to="/transactions">Transactions</Link>
              {user?.role === "landlord" && (
                <>
                  <Link to="/properties/me">My Properties</Link>
                  <Link to="/properties/new">Add Property</Link>
                  <Link to="/agreements/pending">Pending Agreements</Link>
                </>
              )}
              {user?.role === "tenant" && <Link to="/agreements/new">Create Agreement</Link>}
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
