import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { RentalAgreement, EscrowStatus } from "../types/agreement";
import { Dispute, DisputeStatus } from "../types/dispute";
import { getMyAgreements } from "../services/agreementService";
import { adminResolveDispute, getDisputeByAgreement, runAiReview } from "../services/disputeService";
import { getAgreementEvidence } from "../services/evidenceService";
import { EvidenceGroupedResponse } from "../types/evidence";
import DisputeStatusBadge from "../components/DisputeStatusBadge";
import TrustScoreBadge from "../components/TrustScoreBadge";
import useAuth from "../hooks/useAuth";
import { useToast } from "../components/ui/ToastProvider";
import Spinner from "../components/ui/Spinner";

const DisputeDetailPage = () => {
  const { agreementId } = useParams();
  const { user } = useAuth();
  const [agreement, setAgreement] = useState<RentalAgreement | null>(null);
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [evidence, setEvidence] = useState<EvidenceGroupedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [finalDecision, setFinalDecision] = useState(0);
  const { push } = useToast();

  const loadData = async () => {
    if (!agreementId) return;
    setLoading(true);
    try {
      const disputeData = await getDisputeByAgreement(agreementId);
      setDispute(disputeData);
      if (user?.role !== "admin") {
        const agreements = await getMyAgreements();
        const match = agreements.find((item) => item._id === agreementId) || null;
        setAgreement(match);
      }
      const evidenceData = await getAgreementEvidence(agreementId);
      setEvidence(evidenceData);
      setFinalDecision(
        disputeData.finalDecisionPercentage ?? disputeData.recommendedPayoutPercentage ?? 0
      );
    } catch {
      setMessage("Unable to load dispute details.");
      push("Unable to load dispute details.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [agreementId, user?.role, push]);

  const canRunAi = user?.role === "admin" && dispute?.status === DisputeStatus.Open;
  const canResolve = user?.role === "admin" && dispute?.status === DisputeStatus.AiReviewed;

  const handleAiReview = async () => {
    if (!dispute) return;
    setAiLoading(true);
    setMessage(null);
    try {
      const updated = await runAiReview(dispute._id);
      setDispute(updated);
      push("AI review complete.", "success");
    } catch {
      setMessage("AI review failed.");
      push("AI review failed.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!dispute) return;
    setAdminLoading(true);
    setMessage(null);
    try {
      const updated = await adminResolveDispute(dispute._id, finalDecision);
      setDispute(updated);
      push("Dispute resolved.", "success");
    } catch {
      setMessage("Unable to resolve dispute.");
      push("Unable to resolve dispute.", "error");
    } finally {
      setAdminLoading(false);
    }
  };

  const escrowStatus = agreement?.escrow?.status || EscrowStatus.AwaitingPayment;

  const timeline = useMemo(() => {
    if (!evidence?.evidence?.length) {
      return <p className="text-slate-400 text-sm">No evidence available.</p>;
    }
    return (
      <div style={{ borderLeft: "2px solid rgba(255,255,255,0.1)", paddingLeft: 16 }}>
        {evidence.evidence.map((item) => (
          <div key={item._id} style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: "#fff" }}>{new Date(item.uploadedAt).toLocaleString()}</div>
            <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: 8 }}>
              {item.uploadedBy.name} • {item.type.replace("_", " ")}
            </div>
            {item.mimeType.startsWith("video") ? (
              <video src={item.fileUrl} controls style={{ width: "100%", borderRadius: 12, maxHeight: 300 }} />
            ) : (
              <img src={item.fileUrl} alt="evidence" style={{ width: "100%", borderRadius: 12, maxHeight: 300 }} />
            )}
          </div>
        ))}
      </div>
    );
  }, [evidence]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-6 text-slate-300">
        <Spinner />
        <span>Loading dispute...</span>
      </div>
    );
  }

  if (!agreement || !dispute) {
    return (
      <section className="card">
        <p className="muted">Dispute not found.</p>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-900 p-6">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
            <h1 className="text-3xl font-semibold text-white">{agreement.propertyId.title}</h1>
              <p className="text-slate-400 mt-1">{agreement.propertyId.address}</p>
            </div>
            <DisputeStatusBadge status={dispute.status} />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-white/5 p-3 text-sm">
              <p className="text-slate-400">Raised By</p>
              <p className="text-white font-medium mt-1">{dispute.raisedBy.name}</p>
            </div>
            <div className="rounded-lg bg-white/5 p-3 text-sm">
              <p className="text-slate-400">Escrow Status</p>
              <p className="text-white font-medium mt-1 capitalize">{escrowStatus}</p>
            </div>
            <div className="rounded-lg bg-white/5 p-3 text-sm">
              <p className="text-slate-400">Agreement Status</p>
              <p className="text-white font-medium mt-1 capitalize">{agreement.status}</p>
            </div>
          </div>
        </div>

        {/* Dispute Reason */}
        <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase mb-2">Dispute Reason</h2>
          <p className="text-white">{dispute.reason}</p>
        </div>

        {/* AI Report Card */}
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5">
          <h2 className="text-lg font-semibold text-amber-400 mb-4">🤖 AI Analysis Report</h2>
          
          {dispute.aiReport ? (
            <div className="space-y-3">
              {typeof dispute.aiReport?.damageDetected !== "undefined" && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-midnight-900/50">
                  <span className="text-slate-300">Damage Detected</span>
                  <span className={`font-semibold ${dispute.aiReport.damageDetected ? "text-red-400" : "text-green-400"}`}>
                    {dispute.aiReport.damageDetected ? "Yes" : "No"}
                  </span>
                </div>
              )}
              
              {dispute.aiReport?.damageSummary && (
                <div className="p-3 rounded-lg bg-midnight-900/50">
                  <p className="text-xs text-slate-400 mb-1">Summary</p>
                  <p className="text-white">{dispute.aiReport.damageSummary}</p>
                </div>
              )}

              {dispute.aiReport && (dispute.aiReport as any).severityLevel && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-midnight-900/50">
                  <span className="text-slate-300">Severity</span>
                  <span className={`font-semibold px-3 py-1 rounded text-sm ${
                    (dispute.aiReport as any).severityLevel === "high"
                      ? "bg-red-500/20 text-red-400"
                      : (dispute.aiReport as any).severityLevel === "medium"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-green-500/20 text-green-400"
                  }`}>
                    {((dispute.aiReport as any).severityLevel as string).toUpperCase()}
                  </span>
                </div>
              )}

              {typeof dispute.aiReport?.confidenceScore !== "undefined" && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-midnight-900/50">
                  <span className="text-slate-300">Confidence Score</span>
                  <span className="font-semibold text-blue-400">{(dispute.aiReport.confidenceScore * 100).toFixed(0)}%</span>
                </div>
              )}

              {typeof dispute.recommendedPayoutPercentage !== "undefined" && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <span className="text-white font-medium">AI Recommended Payout %</span>
                  <span className="font-bold text-blue-400 text-xl">{dispute.recommendedPayoutPercentage}%</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">AI report not available yet.</p>
          )}

          {canRunAi && (
            <button
              onClick={handleAiReview}
              disabled={aiLoading}
              className="mt-4 w-full rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 px-4 py-2 text-sm font-medium text-white transition"
            >
              {aiLoading ? "Running AI Review..." : "🔍 Run AI Review"}
            </button>
          )}
        </div>

        {/* Admin Override Panel */}
        {canResolve && (
          <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-950/20 p-5">
            <h2 className="text-lg font-semibold text-green-400 mb-4">👨‍⚖️ Admin Resolution</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Final Decision Payout % to Tenant
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={finalDecision}
                    onChange={(e) => setFinalDecision(Number(e.target.value))}
                    className="flex-1 h-2 bg-white/10 rounded-full cursor-pointer accent-green-500"
                  />
                  <span className="px-4 py-2 rounded-lg bg-midnight-900/50 text-white font-semibold font-mono min-w-[80px] text-center">
                    {finalDecision}%
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>Tenant Gets: ₹{((agreement.escrow?.depositAmount! * finalDecision) / 100).toLocaleString()}</span>
                  <span>Landlord Gets: ₹{((agreement.escrow?.depositAmount! * (100 - finalDecision)) / 100).toLocaleString()}</span>
                </div>
              </div>

              {dispute.finalDecisionPercentage === undefined && (
                <button
                  onClick={handleResolve}
                  disabled={adminLoading}
                  className="w-full rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-3 text-sm font-semibold text-white transition"
                >
                  {adminLoading ? "Resolving..." : "✓ Resolve Dispute"}
                </button>
              )}

              {dispute.finalDecisionPercentage !== undefined && (
                <div className="p-4 rounded-lg bg-midnight-900/50 border border-green-500/30">
                  <p className="text-sm text-slate-400 mb-1">Already Resolved</p>
                  <p className="text-white font-semibold">Final Decision: {dispute.finalDecisionPercentage}% to Tenant</p>
                </div>
              )}
            </div>
          </div>
        )}

        {dispute.finalDecisionPercentage !== undefined && !canResolve && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <p className="text-sm text-green-400">✓ Resolved</p>
            <p className="text-white font-semibold mt-1">{dispute.finalDecisionPercentage}% goes to tenant</p>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-red-400">{message}</p>
          </div>
        )}

        {/* Evidence Timeline */}
        <div className="rounded-2xl border border-white/10 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">📸 Evidence Timeline</h2>
          {timeline}
        </div>
      </div>
    </div>
  );
};

export default DisputeDetailPage;
