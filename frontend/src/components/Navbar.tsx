import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import TrustScoreBadge from "./TrustScoreBadge";

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
              {user?.role === "admin" && <Link to="/admin">Admin</Link>}
              {user?.role === "tenant" && <Link to="/agreements/new">Create Agreement</Link>}
              
              {/* User and Trust Score */}
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{user?.name}</div>
                  {user?.trustScore !== undefined && (
                    <TrustScoreBadge score={user.trustScore} size="sm" />
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 rounded text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                >
                  Logout
                </button>
              </div>
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
