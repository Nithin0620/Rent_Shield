import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import { useToast } from "../components/ui/ToastProvider";
import useAuth from "../hooks/useAuth";
import { getAdminDisputes, AdminDispute } from "../services/adminService";
import { DisputeStatus } from "../types/dispute";

const DisputesPage = () => {
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Only admins can view all disputes
        if (user?.role === "admin") {
          const data = await getAdminDisputes();
          setDisputes(data);
        } else {
          setDisputes([]);
          // Regular users see their disputes on the agreement detail pages
        }
      } catch (error) {
        push("Unable to load disputes", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [push, user?.role]);

  const statusCounts = {
    open: disputes.filter((d) => d.status === DisputeStatus.Open).length,
    ai_reviewed: disputes.filter((d) => d.status === DisputeStatus.AiReviewed).length,
    resolved: disputes.filter((d) => d.status === DisputeStatus.Resolved).length,
  };

  const getStatusBadge = (status: string) => {
    const badgeMap: Record<string, { bg: string; text: string; label: string }> = {
      [DisputeStatus.Open]: { bg: "bg-amber-500/20", text: "text-amber-400", label: "OPEN" },
      [DisputeStatus.AiReviewed]: { bg: "bg-blue-500/20", text: "text-blue-400", label: "AI REVIEWED" },
      [DisputeStatus.Resolved]: { bg: "bg-green-500/20", text: "text-green-400", label: "RESOLVED" },
    };
    const style = badgeMap[status] || badgeMap[DisputeStatus.Open];
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

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-midnight-900 p-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Disputes</h1>
            <p className="text-slate-400">Track disputes related to your agreements</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-slate-400">Disputes appear on your agreement detail pages. Navigate to an agreement to view or raise a dispute.</p>
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
          <h1 className="text-4xl font-bold text-white mb-2">Disputes</h1>
          <p className="text-slate-400">Track and manage all disputes and their resolutions</p>
        </div>

        {/* Status Counters */}
        <div className="grid gap-3 md:grid-cols-3 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-2xl font-bold text-white">{statusCounts.open}</p>
            <p className="text-sm text-slate-400">Open Disputes</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-2xl font-bold text-blue-400">{statusCounts.ai_reviewed}</p>
            <p className="text-sm text-slate-400">AI Reviewed</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-2xl font-bold text-green-400">{statusCounts.resolved}</p>
            <p className="text-sm text-slate-400">Resolved</p>
          </div>
        </div>

        {/* Disputes List */}
        {disputes.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-slate-400 mb-4">No disputes yet. Hoping to keep it that way! 🙏</p>
          </div>
        ) : (
          <div className="space-y-3">
            {disputes.map((dispute) => (
              <Link
                key={dispute._id}
                to={`/disputes/${dispute._id}`}
                className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{dispute.agreementId.propertyId.title}</p>
                    <p className="text-sm text-slate-400 line-clamp-1">{dispute.reason}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Raised {new Date(dispute.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {dispute.recommendedPayoutPercentage !== undefined && (
                    <div className="text-right mr-4">
                      <p className="text-xs text-slate-400">Recommended</p>
                      <p className="text-sm font-semibold text-amber-400">
                        {dispute.recommendedPayoutPercentage}% to tenant
                      </p>
                    </div>
                  )}

                  {getStatusBadge(dispute.status)}

                  <div className="ml-4">
                    <button className="text-slate-400 hover:text-white transition">→</button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputesPage;
