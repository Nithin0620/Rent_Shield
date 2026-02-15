import { useEffect, useState } from "react";
import Spinner from "../components/ui/Spinner";
import TrustScoreBadge from "../components/TrustScoreBadge";
import { useToast } from "../components/ui/ToastProvider";
import {
  getAdminStats,
  getAdminAgreements,
  getAdminDisputes,
  AdminStats,
  AdminAgreement,
  AdminDispute,
  triggerAiReview,
  resolveDispute
} from "../services/adminService";

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [agreements, setAgreements] = useState<AdminAgreement[]>([]);
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "agreements" | "disputes">("overview");
  const [processingDisputeId, setProcessingDisputeId] = useState<string | null>(null);
  const { push } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [statsData, agreementsData, disputesData] = await Promise.all([
        getAdminStats(),
        getAdminAgreements(),
        getAdminDisputes()
      ]);
      setStats(statsData);
      setAgreements(agreementsData);
      setDisputes(disputesData);
    } catch {
      push("Failed to load admin data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [push]);

  const handleTriggerAiReview = async (disputeId: string) => {
    setProcessingDisputeId(disputeId);
    try {
      await triggerAiReview(disputeId);
      setDisputes((prev) =>
        prev.map((d) =>
          d._id === disputeId ? { ...d, status: "ai_reviewed" } : d
        )
      );
      push("AI review triggered", "success");
    } catch {
      push("Failed to trigger AI review", "error");
    } finally {
      setProcessingDisputeId(null);
    }
  };

  const handleResolveDispute = async (disputeId: string, decision: number) => {
    setProcessingDisputeId(disputeId);
    try {
      await resolveDispute(disputeId, decision);
      setDisputes((prev) => prev.filter((d) => d._id !== disputeId));
      push(`Dispute resolved - ${decision}% to tenant`, "success");
    } catch {
      push("Failed to resolve dispute", "error");
    } finally {
      setProcessingDisputeId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-900 p-6">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">System monitoring and dispute resolution</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10 mb-8">
          {(["overview", "agreements", "disputes"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab
                  ? "border-neon-500 text-neon-400"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              {tab === "overview" && "📊 Overview"}
              {tab === "agreements" && "📋 Agreements"}
              {tab === "disputes" && "⚠️ Disputes"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "blue" },
              { label: "Total Agreements", value: stats.totalAgreements, icon: "📋", color: "purple" },
              { label: "Active Agreements", value: stats.totalAgreementsActive, icon: "✓", color: "green" },
              { label: "Completed Agreements", value: stats.totalAgreementsCompleted, icon: "✔", color: "emerald" },
              { label: "Open Disputes", value: stats.openDisputes, icon: "⚠️", color: "red" },
              { label: "Total Escrow Locked", value: `₹${(stats.totalEscrowAmount / 100000).toFixed(1)}L`, icon: "💰", color: "amber" }
            ].map((stat) => {
              const colorMap = {
                blue: "bg-blue-500/10 border-blue-500/30",
                purple: "bg-purple-500/10 border-purple-500/30",
                green: "bg-green-500/10 border-green-500/30",
                emerald: "bg-emerald-500/10 border-emerald-500/30",
                red: "bg-red-500/10 border-red-500/30",
                amber: "bg-amber-500/10 border-amber-500/30"
              };
              return (
                <div key={stat.label} className={`rounded-2xl border ${colorMap[stat.color as keyof typeof colorMap]} p-6`}>
                  <div className="text-3xl mb-3">{stat.icon}</div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Agreements Tab */}
        {activeTab === "agreements" && (
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Tenant</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Landlord</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {agreements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No agreements yet
                      </td>
                    </tr>
                  ) : (
                    agreements.map((a) => (
                      <tr key={a._id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-white">{a.propertyId?.title}</p>
                            <p className="text-xs text-slate-500">{a.propertyId?.address}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white">{a.tenantId?.name}</p>
                            {a.tenantId?.trustScore !== undefined && (
                              <TrustScoreBadge score={a.tenantId.trustScore} size="sm" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white">{a.landlordId?.name}</p>
                            {a.landlordId?.trustScore !== undefined && (
                              <TrustScoreBadge score={a.landlordId.trustScore} size="sm" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 capitalize">
                            {a.agreementStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Disputes Tab */}
        {activeTab === "disputes" && (
          <div className="space-y-4">
            {disputes.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                <p className="text-slate-400">No open disputes</p>
              </div>
            ) : (
              disputes.map((dispute) => (
                <div
                  key={dispute._id}
                  className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition p-5"
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {dispute.agreementId?.propertyId?.title}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Raised by {dispute.raisedBy?.name}
                      </p>
                      <p className="text-sm text-slate-300 mt-2">{dispute.reason}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      dispute.status === "open" 
                        ? "bg-red-500/20 text-red-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {dispute.status}
                    </span>
                  </div>

                  {/* AI Report Preview */}
                  {dispute.aiReport && (
                    <div className="mb-4 rounded-lg bg-midnight-900/50 p-4 border border-amber-500/20">
                      <p className="text-xs text-amber-400 font-semibold mb-2">🤖 AI Analysis</p>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Damage Detected:</span>
                          <span className="text-white font-medium">
                            {(dispute.aiReport as any).damageDetected ? "Yes" : "No"}
                          </span>
                        </div>
                        {dispute.aiReport && (dispute.aiReport as any).severityLevel && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Severity:</span>
                            <span className="text-white font-medium capitalize">
                              {((dispute.aiReport as any).severityLevel as string)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-400">Recommended Payout:</span>
                          <span className="text-blue-400 font-semibold">
                            {dispute.recommendedPayoutPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {dispute.status === "open" && (
                      <button
                        onClick={() => handleTriggerAiReview(dispute._id)}
                        disabled={processingDisputeId === dispute._id}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition text-white"
                      >
                        {processingDisputeId === dispute._id ? "Processing..." : "🔍 Trigger AI Review"}
                      </button>
                    )}

                    {dispute.status === "ai_reviewed" && (
                      <>
                        <button
                          onClick={() => handleResolveDispute(dispute._id, 100)}
                          disabled={processingDisputeId === dispute._id}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 disabled:opacity-50 transition text-white"
                        >
                          {processingDisputeId === dispute._id ? "Processing..." : "✓ Release (100%)"}
                        </button>
                        <button
                          onClick={() => handleResolveDispute(dispute._id, 0)}
                          disabled={processingDisputeId === dispute._id}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 transition text-white"
                        >
                          {processingDisputeId === dispute._id ? "Processing..." : "✗ Forfeit (0%)"}
                        </button>
                        <button
                          onClick={() => handleResolveDispute(dispute._id, 50)}
                          disabled={processingDisputeId === dispute._id}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition text-white"
                        >
                          {processingDisputeId === dispute._id ? "Processing..." : "⚖️ Split (50%)"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
