import { Menu, ShieldCheck } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const DashboardTopbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-midnight-900/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg border border-white/10 p-2 text-slate-200 md:hidden"
            onClick={onMenuClick}
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <ShieldCheck className="text-neon-600" size={20} />
            RentShield
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right text-sm md:block">
            <p className="font-medium text-white">{user?.name || "Guest"}</p>
            <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-200">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
