import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import { useToast } from "../components/ui/ToastProvider";
import useAuth from "../hooks/useAuth";
import { getMyAgreements } from "../services/agreementService";

const EscrowStatusPage = () => {
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMyAgreements();
        setAgreements(data);
      } catch {
        push("Unable to load escrow data", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [push]);

  // Group by escrow status
  const groupedByStatus = agreements.reduce((acc: any, item: any) => {
    const status = item.escrow?.escrowStatus || "unknown";
    if (!acc[status]) acc[status] = [];
    acc[status].push(item);
    return acc;
  }, {});

  // Calculate metrics
  const escrows = agreements.map((a: any) => a.escrow).filter(Boolean);
  const totalLocked = escrows.reduce((sum: number, e: any) => sum + (e.escrowStatus === "locked" ? e.amount : 0), 0);
  const totalPendingRelease = escrows.reduce((sum: number, e: any) => sum + (e.escrowStatus === "release_requested" ? e.amount : 0), 0);
  const totalDisputed = escrows.reduce((sum: number, e: any) => sum + (e.escrowStatus === "disputed" ? e.amount : 0), 0);
  const totalReleased = escrows.reduce((sum: number, e: any) => sum + (e.escrowStatus === "released" ? e.amount : 0), 0);

  const getStatusBadge = (status: string) => {
    const badgeMap: Record<string, { bg: string; text: string; label: string }> = {
      unpaid: { bg: "bg-gray-500/20", text: "text-gray-400", label: "UNPAID" },
      locked: { bg: "bg-blue-500/20", text: "text-blue-400", label: "LOCKED" },
      release_requested: { bg: "bg-amber-500/20", text: "text-amber-400", label: "RELEASE REQUESTED" },
      released: { bg: "bg-green-500/20", text: "text-green-400", label: "RELEASED" },
      disputed: { bg: "bg-red-500/20", text: "text-red-400", label: "DISPUTED" },
    };
    const style = badgeMap[status] || badgeMap.unpaid;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-900 p-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-900 p-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Escrow Management</h1>
          <p className="text-slate-400">Monitor all locked deposits and pending releases</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Currently Locked</p>
            <p className="text-3xl font-bold text-white">₹{totalLocked.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Pending Release</p>
            <p className="text-3xl font-bold text-blue-400">₹{totalPendingRelease.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Under Dispute</p>
            <p className="text-3xl font-bold text-red-400">₹{totalDisputed.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Released</p>
            <p className="text-3xl font-bold text-green-400">₹{totalReleased.toLocaleString()}</p>
          </div>
        </div>

        {/* Grouped Listings */}
        {agreements.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-slate-400">No escrow records yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByStatus).map(([status, items]: [string, any]) => (
              <div key={status}>
                <h2 className="text-xl font-bold text-white mb-4 capitalize flex items-center gap-2">
                  {getStatusBadge(status)}
                  <span>({(items as any[]).length})</span>
                </h2>
                <div className="grid gap-3">
                  {(items as any[]).map(({ agreement, escrow }: any) => (
                    <Link
                      key={agreement._id}
                      to={`/agreements/${agreement._id}`}
                      className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition p-5 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-white">{agreement.propertyId.title}</p>
                        <p className="text-sm text-slate-400">
                          Deposit: ₹{escrow?.amount?.toLocaleString() || "N/A"}
                        </p>
                      </div>
                      <button className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 transition">
                        View Details →
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EscrowStatusPage;
