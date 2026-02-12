import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AgreementWithEscrow, EscrowStatus } from "../types/agreement";
import { Dispute, DisputeStatus } from "../types/dispute";
import { getEscrowByAgreement, getMyAgreements } from "../services/agreementService";
import { adminResolveDispute, getDisputeByAgreement, runAiReview } from "../services/disputeService";
import { getAgreementEvidence } from "../services/evidenceService";
import { EvidenceGroupedResponse } from "../types/evidence";
import DisputeStatusBadge from "../components/DisputeStatusBadge";
import useAuth from "../hooks/useAuth";

const DisputeDetailPage = () => {
  const { agreementId } = useParams();
  const { user } = useAuth();
  const [agreement, setAgreement] = useState<AgreementWithEscrow | null>(null);
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [evidence, setEvidence] = useState<EvidenceGroupedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [finalDecision, setFinalDecision] = useState(0);

  const loadData = async () => {
    if (!agreementId) return;
    setLoading(true);
    try {
      const disputeData = await getDisputeByAgreement(agreementId);
      setDispute(disputeData);
      if (user?.role !== "admin") {
        const agreements = await getMyAgreements();
        const match = agreements.find((item) => item.agreement._id === agreementId) || null;
        setAgreement(match);
      } else if (typeof disputeData.agreementId !== "string") {
        const escrow = await getEscrowByAgreement(agreementId);
        setAgreement({ agreement: disputeData.agreementId, escrow });
      }
      const evidenceData = await getAgreementEvidence(agreementId);
      setEvidence(evidenceData);
      setFinalDecision(disputeData.finalDecisionPercentage || disputeData.recommendedPayoutPercentage || 0);
    } catch {
      setMessage("Unable to load dispute details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [agreementId]);

  const canRunAi = user?.role === "admin" && dispute?.status === DisputeStatus.Open;
  const canResolve = user?.role === "admin" && dispute?.status === DisputeStatus.AiReviewed;

  const handleAiReview = async () => {
    if (!dispute) return;
    setAiLoading(true);
    setMessage(null);
    try {
      const updated = await runAiReview(dispute._id);
      setDispute(updated);
    } catch {
      setMessage("AI review failed.");
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
    } catch {
      setMessage("Unable to resolve dispute.");
    } finally {
      setAdminLoading(false);
    }
  };

  const escrowStatus = agreement?.escrow?.escrowStatus || EscrowStatus.Unpaid;

  const timeline = useMemo(() => {
    if (!evidence?.evidence?.length) {
      return <p className="muted">No evidence available.</p>;
    }
    return (
      <div style={{ borderLeft: "2px solid #e5e7eb", paddingLeft: 16 }}>
        {evidence.evidence.map((item) => (
          <div key={item._id} style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600 }}>{new Date(item.uploadedAt).toLocaleString()}</div>
            <div className="muted">
              {item.uploadedBy.name} • {item.type.replace("_", " ")}
            </div>
            {item.mimeType.startsWith("video") ? (
              <video src={item.fileUrl} controls style={{ width: "100%", borderRadius: 12, marginTop: 8 }} />
            ) : (
              <img src={item.fileUrl} alt="evidence" style={{ width: "100%", borderRadius: 12, marginTop: 8 }} />
            )}
          </div>
        ))}
      </div>
    );
  }, [evidence]);

  if (loading) {
    return (
      <section className="card">
        <p className="muted">Loading dispute...</p>
      </section>
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
    <section className="card">
      <h1>Dispute details</h1>
      {message && <p className="muted">{message}</p>}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <DisputeStatusBadge status={dispute.status} />
        <span className="muted">Escrow: {escrowStatus}</span>
      </div>
      <p className="muted">Property: {agreement.agreement.propertyId.title}</p>
      <p className="muted">Agreement status: {agreement.agreement.agreementStatus}</p>
      <p>Reason: {dispute.reason}</p>

      <section className="card">
        <h3>AI report</h3>
        {dispute.aiReport ? (
          <div className="form-grid">
            {typeof dispute.aiReport.damageDetected !== "undefined" && (
              <p>Damage detected: {String(dispute.aiReport.damageDetected)}</p>
            )}
            {dispute.aiReport.severityLevel && <p>Severity: {dispute.aiReport.severityLevel}</p>}
            {typeof dispute.aiReport.confidenceScore !== "undefined" && (
              <p>Confidence: {dispute.aiReport.confidenceScore}</p>
            )}
            {typeof dispute.recommendedPayoutPercentage !== "undefined" && (
              <p>Recommended payout %: {dispute.recommendedPayoutPercentage}</p>
            )}
            {dispute.aiReport.error && <p className="muted">Error: {dispute.aiReport.error}</p>}
          </div>
        ) : (
          <p className="muted">AI report not available.</p>
        )}
        {canRunAi && (
          <button onClick={handleAiReview} disabled={aiLoading}>
            {aiLoading ? "Running..." : "Run AI Review"}
          </button>
        )}
      </section>

      {canResolve && (
        <section className="card">
          <h3>Admin resolution</h3>
          <div className="form-grid">
            <input
              type="number"
              min={0}
              max={100}
              value={finalDecision}
              onChange={(event) => setFinalDecision(Number(event.target.value))}
            />
            <button onClick={handleResolve} disabled={adminLoading}>
              {adminLoading ? "Saving..." : "Resolve dispute"}
            </button>
          </div>
        </section>
      )}

      <section className="card">
        <h3>Evidence timeline</h3>
        {timeline}
      </section>
    </section>
  );
};

export default DisputeDetailPage;
