import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Skeleton from "../components/ui/Skeleton";
import TrustScoreBadge from "../components/TrustScoreBadge";
import { AgreementWithEscrow, EscrowStatus } from "../types/agreement";
import { getMyAgreements } from "../services/agreementService";
import { useToast } from "../components/ui/ToastProvider";
import useAuth from "../hooks/useAuth";

const DashboardOverview = () => {
  const [agreements, setAgreements] = useState<AgreementWithEscrow[]>([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyAgreements();
        setAgreements(data);
      } catch {
        push("Unable to load overview data.", "error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [push]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const activeCount = agreements.filter((item) => item.agreement.agreementStatus === "active").length;
  const completedCount = agreements.filter((item) => item.agreement.agreementStatus === "completed").length;
  const pendingCount = agreements.filter((item) => item.agreement.agreementStatus === "pending").length;
  const lockedEscrow = agreements.filter((item) => item.escrow?.escrowStatus === EscrowStatus.Locked).length;
  const totalEscrowAmount = agreements.reduce((sum, item) => sum + (item.agreement.depositAmount || 0), 0);
  const disputeCount = agreements.filter((item) => item.escrow?.escrowStatus === EscrowStatus.Disputed).length;

  const stats = [
    {
      label: "Total Agreements",
      value: agreements.length,
      icon: "📋",
      color: "bg-blue-500/10 border-blue-500/30"
    },
    {
      label: "Active Agreements",
      value: activeCount,
      icon: "✓",
      color: "bg-green-500/10 border-green-500/30"
    },
    {
      label: "Completed",
      value: completedCount,
      icon: "✔",
      color: "bg-emerald-500/10 border-emerald-500/30"
    },
    {
      label: "Pending Approval",
      value: pendingCount,
      icon: "⏳",
      color: "bg-amber-500/10 border-amber-500/30"
    },
    {
      label: "Locked in Escrow",
      value: `₹${(totalEscrowAmount / 100000).toFixed(1)}L`,
      icon: "💰",
      color: "bg-purple-500/10 border-purple-500/30"
    },
    {
      label: "Active Disputes",
      value: disputeCount,
      icon: "⚠️",
      color: "bg-red-500/10 border-red-500/30"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Welcome back, {user?.name}</h1>
        <p className="text-slate-400 mt-1">Your rental agreement dashboard</p>
      </div>

      {/* Trust Score Card */}
      {user?.trustScore !== undefined && (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-neon-500/10 to-blue-500/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-2">Your Trust Score</p>
              <p className="text-3xl font-bold text-white mb-2">{user.trustScore}/100</p>
              <p className="text-xs text-slate-500">Your score affects your ability to create agreements and influences landlord/tenant decisions</p>
            </div>
            <TrustScoreBadge score={user.trustScore} size="lg" />
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border ${stat.color} p-5 transition hover:bg-opacity-80`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Link
            to="/properties"
            className="rounded-lg border border-neon-500/30 px-4 py-3 text-center font-medium text-neon-400 hover:bg-neon-500/10 transition"
          >
            Browse Properties & Create Agreement
          </Link>
          <Link
            to="/agreements"
            className="rounded-lg border border-white/10 px-4 py-3 text-center font-medium text-slate-300 hover:bg-white/5 transition"
          >
            View All Agreements
          </Link>
          {user?.role === "landlord" && (
            <>
              <Link
                to="/properties/me"
                className="rounded-lg border border-white/10 px-4 py-3 text-center font-medium text-slate-300 hover:bg-white/5 transition"
              >
                My Properties
              </Link>
              <Link
                to="/properties/new"
                className="rounded-lg border border-white/10 px-4 py-3 text-center font-medium text-slate-300 hover:bg-white/5 transition"
              >
                Add New Property
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Recent Agreements */}
      {agreements.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Agreements</h2>
          <div className="space-y-3">
            {agreements.slice(0, 3).map(({ agreement, escrow }) => (
              <Link
                key={agreement._id}
                to={`/agreements/${agreement._id}`}
                className="block rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 p-4 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-white">{agreement.propertyId.title}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {escrow?.escrowStatus || "pending"} • Deposit: ₹{agreement.depositAmount.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-slate-300 capitalize">{agreement.agreementStatus}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
