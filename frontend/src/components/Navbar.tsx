import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import TrustScoreBadge from "./TrustScoreBadge";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const getTenantNavItems = () => [
    { label: "Overview", path: "/dashboard", icon: "📊" },
    { label: "Browse Properties", path: "/properties", icon: "🏠" },
    { label: "My Agreements", path: "/agreements", icon: "📋" },
    { label: "Escrow Status", path: "/escrow", icon: "🔒" },
    { label: "Disputes", path: "/disputes", icon: "⚠️" },
    { label: "Evidence Vault", path: "/evidence", icon: "📸" },
    { label: "Trust Score", path: "/trust", icon: "⭐" },
  ];

  const getLandlordNavItems = () => [
    { label: "Overview", path: "/dashboard", icon: "📊" },
    { label: "My Properties", path: "/properties/me", icon: "🏠" },
    { label: "Agreements", path: "/agreements", icon: "📋" },
    { label: "Escrow Management", path: "/escrow", icon: "🔒" },
    { label: "Disputes", path: "/disputes", icon: "⚠️" },
    { label: "Trust Score", path: "/trust", icon: "⭐" },
  ];

  const getAdminNavItems = () => [
    { label: "Platform Overview", path: "/admin", icon: "📊" },
    { label: "All Agreements", path: "/admin", icon: "📋" },
    { label: "All Disputes", path: "/admin", icon: "⚠️" },
    { label: "Escrow Monitor", path: "/escrow", icon: "🔒" },
    { label: "Users", path: "/admin", icon: "👥" },
  ];

  const getNavItems = () => {
    if (user?.role === "tenant") return getTenantNavItems();
    if (user?.role === "landlord") return getLandlordNavItems();
    if (user?.role === "admin") return getAdminNavItems();
    return [];
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-midnight-900/95 backdrop-blur">
        <div className="mx-auto max-w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle Button */}
            {isAuthenticated && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/5 transition text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Logo */}
            <Link to="/dashboard" className="text-xl font-bold text-white hover:text-neon-400 transition">
              RentShield
            </Link>
          </div>

          {/* Right Side */}
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">{user?.name}</div>
                {user?.trustScore !== undefined && (
                  <TrustScoreBadge score={user.trustScore} size="sm" />
                )}
              </div>

              {/* Admin Link */}
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="px-3 py-1 rounded-lg text-sm font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition"
                >
                  Admin
                </Link>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
              >
                Logout
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-neon-500 text-midnight-900 hover:bg-neon-400 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar */}
      {isAuthenticated && (
        <>
          {/* Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Panel */}
          <aside
            className={`fixed top-0 left-0 h-screen w-64 bg-midnight-900 border-r border-white/10 z-30 transform transition-transform duration-200 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            } lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)]`}
          >
            <nav className="p-4 space-y-2 overflow-y-auto h-full flex flex-col">
              {/* Navigation Items */}
              {getNavItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.path)
                      ? "bg-neon-500/20 text-neon-400 border border-neon-500/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Bottom Section */}
              <div className="pt-4 border-t border-white/10">
                <div className="px-4 py-3 rounded-lg bg-white/5">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Your Trust Score</p>
                  {user?.trustScore !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">{user.trustScore}</span>
                      <TrustScoreBadge score={user.trustScore} size="sm" />
                    </div>
                  )}
                </div>

                <Link
                  to="/trust"
                  onClick={() => setSidebarOpen(false)}
                  className="block mt-3 px-4 py-2 rounded-lg text-xs font-medium text-center bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                >
                  View Details
                </Link>
              </div>
            </nav>
          </aside>
        </>
      )}
    </>
  );
};

export default Navbar;
