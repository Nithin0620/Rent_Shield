import { Outlet } from "react-router-dom";
import { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-midnight-900">
      <DashboardTopbar onMenuClick={() => setOpen((prev) => !prev)} />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 pb-10 pt-6 md:px-6">
        <DashboardSidebar className="hidden md:flex" />
        <main className="min-h-[70vh] flex-1 rounded-3xl bg-white/5 p-6 text-slate-100 backdrop-blur border border-white/10">
          <Outlet />
        </main>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setOpen(false)}>
          <div className="h-full w-72 bg-white p-4" onClick={(event) => event.stopPropagation()}>
            <DashboardSidebar className="flex" onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
