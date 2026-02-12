import { NavLink } from "react-router-dom";
import { FileText, Home, LogOut, ShieldCheck, Building2 } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const DashboardSidebar = ({
  className = "",
  onNavigate
}: {
  className?: string;
  onNavigate?: () => void;
}) => {
  const { user, logout } = useAuth();
  const isLandlord = user?.role === "landlord";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
      isActive ? "bg-neon-500/20 text-neon-500" : "text-slate-200 hover:bg-white/10"
    }`;

  return (
    <aside className={`w-64 flex-col rounded-3xl bg-white/5 p-4 shadow-soft border border-white/10 ${className}`}>
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Dashboard</p>
      <nav className="mt-4 flex flex-1 flex-col gap-2">
        <NavLink to="/dashboard" end className={linkClass} onClick={onNavigate}>
          <Home size={18} />
          Overview
        </NavLink>
        <NavLink to="/dashboard/agreements" className={linkClass} onClick={onNavigate}>
          <FileText size={18} />
          My Agreements
        </NavLink>
        {isLandlord && (
          <NavLink to="/dashboard/properties" className={linkClass} onClick={onNavigate}>
            <Building2 size={18} />
            Properties
          </NavLink>
        )}
        <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-400">
          <ShieldCheck size={18} />
          Escrow Status
        </div>
      </nav>
      <button
        onClick={logout}
        className="mt-6 flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
      >
        <LogOut size={16} />
        Logout
      </button>
    </aside>
  );
};

export default DashboardSidebar;
