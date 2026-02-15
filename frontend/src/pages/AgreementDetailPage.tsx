import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EscrowStatusBadge from "../components/dashboard/EscrowStatusBadge";
import { EscrowStatus, AgreementWithEscrow } from "../types/agreement";
import { useToast } from "../components/ui/ToastProvider";
import {
  confirmRelease,
  getMyAgreements,
  payDeposit,
  requestRelease,
  rejectAgreement,
  getChecklist,
  updateChecklist
} from "../services/agreementService";
import { ExitChecklist } from "../types/checklist";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/ui/Spinner";
import TrustScoreBadge from "../components/TrustScoreBadge";

const AgreementDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const { user } = useAuth();
  const [agreement, setAgreement] = useState<AgreementWithEscrow | null>(null);
  const [checklist, setChecklist] = useState<ExitChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState<"pay" | "request" | "confirm" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getMyAgreements();
        const match = data.find((item) => item.agreement._id === id) || null;
        setAgreement(match);
        if (!match) {
          setError("Agreement not found.");
        } else {
          try {
            const checklistData = await getChecklist(id);
            setChecklist(checklistData);
          } catch {
            // Checklist might not be available yet
          }
        }
      } catch {
        setError("Unable to load agreement.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const updateEscrow = (nextEscrow: AgreementWithEscrow["escrow"]) => {
    setAgreement((prev) => (prev ? { ...prev, escrow: nextEscrow } : prev));
  };

  const handlePayDeposit = async () => {
    if (!agreement) return;
    setActionState("pay");
    try {
      const escrow = await payDeposit(agreement.agreement._id);
      updateEscrow(escrow);
      push("Deposit paid and escrow locked.", "success");
    } catch {
      push("Failed to pay deposit.", "error");
    } finally {
      setActionState(null);
    }
  };

  const handleRequestRelease = async () => {
    if (!agreement) return;
    setActionState("request");
    try {
      const escrow = await requestRelease(agreement.agreement._id);
      updateEscrow(escrow);
      push("Release requested.", "success");
    } catch {
      push("Failed to request release.", "error");
    } finally {
      setActionState(null);
    }
  };

  const handleConfirmRelease = async () => {
    if (!agreement) return;
    setActionState("confirm");
    try {
      const escrow = await confirmRelease(agreement.agreement._id);
      updateEscrow(escrow);
      push("Release confirmed.", "success");
    } catch {
      push("Failed to confirm release.", "error");
    } finally {
      setActionState(null);
    }
  };

  const handleRaiseDispute = () => {
    if (agreement) {
      navigate(`/disputes/${agreement.agreement._id}/create`);
    }
  };

  const handleRejectAgreement = async () => {
    if (!agreement) return;
    setActionState("reject");
    try {
      await rejectAgreement(agreement.agreement._id, rejectReason || undefined);
      push("Agreement rejected.", "success");
      navigate("/agreements");
    } catch {
      push("Failed to reject agreement.", "error");
    } finally {
      setActionState(null);
      setShowRejectForm(false);
    }
  };

  const handleUpdateChecklist = async () => {
    if (!agreement || !checklist) return;
    try {
      const updated = await updateChecklist(agreement.agreement._id, checklist.items);
      setChecklist(updated);
      push("Checklist updated.", "success");
    } catch {
      push("Failed to update checklist.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-6 text-slate-300">
        <Spinner />
        <span>Loading agreement...</span>
      </div>
    );
  }

  if (!agreement) {
    return <p className="p-6 text-slate-300">{error || "Agreement not found."}</p>;
  }

  const escrowStatus = agreement.escrow?.escrowStatus || EscrowStatus.Unpaid;
  const isTenant = user?.id === agreement.agreement.tenantId._id;
  const isLandlord = user?.id === agreement.agreement.landlordId._id;
  const canPay = isTenant && escrowStatus === EscrowStatus.Unpaid;
  const canRequest = escrowStatus === EscrowStatus.Locked;
  const canConfirm =
    escrowStatus === EscrowStatus.ReleaseRequested &&
    ((isTenant && !agreement.escrow?.releaseRequestedByTenant) ||
      (isLandlord && !agreement.escrow?.releaseRequestedByLandlord));
  const canDispute = escrowStatus === EscrowStatus.ReleaseRequested;

  return (
    <div className="min-h-screen bg-midnight-900 p-6">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-white">{agreement.agreement.propertyId.title}</h1>
            <p className="text-slate-400">{agreement.agreement.propertyId.address}</p>
          </div>
          <div className="flex items-center gap-3">
            <EscrowStatusBadge status={escrowStatus} />
            <span className="px-3 py-1 rounded-lg bg-white/10 text-sm text-slate-300 capitalize">
              {agreement.agreement.agreementStatus}
            </span>
          </div>
        </div>

        {/* Parties with Trust Scores */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Tenant</p>
            <p className="font-semibold text-white mb-2">{agreement.agreement.tenantId.name}</p>
            {agreement.agreement.tenantId.trustScore !== undefined && (
              <TrustScoreBadge score={agreement.agreement.tenantId.trustScore} size="sm" />
            )}
          </div>
          <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Landlord</p>
            <p className="font-semibold text-white mb-2">{agreement.agreement.landlordId.name}</p>
            {agreement.agreement.landlordId.trustScore !== undefined && (
              <TrustScoreBadge score={agreement.agreement.landlordId.trustScore} size="sm" />
            )}
          </div>
          <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Agreement Terms</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Deposit</span>
                <span className="text-white font-medium">₹{agreement.agreement.depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rent</span>
                <span className="text-white font-medium">₹{agreement.agreement.propertyId.rent?.toLocaleString() || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exit Checklist Section */}
        {checklist && (
          <div className="mb-6 rounded-2xl border border-white/10 p-4 bg-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-lg">Exit Checklist</h3>
              <span className="text-xs text-slate-400">
                {checklist.items.filter((i) => i.agreed).length} of {checklist.items.length} complete
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              {checklist.items.map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={item.agreed}
                    onChange={(e) => {
                      const updated = [...checklist.items];
                      updated[idx] = { ...item, agreed: e.target.checked };
                      setChecklist({ ...checklist, items: updated });
                    }}
                    className="rounded accent-neon-500 w-4 h-4"
                  />
                  <span className={`text-sm ${item.agreed ? "line-through text-slate-500" : "text-slate-300"}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mb-4 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-neon-500 transition-all"
                style={{
                  width: `${(checklist.items.filter((i) => i.agreed).length / checklist.items.length) * 100}%`
                }}
              ></div>
            </div>

            {checklist.items.some((i) => !i.agreed) && (
              <button
                onClick={handleUpdateChecklist}
                className="w-full rounded-lg px-4 py-2 text-sm font-medium bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 transition"
              >
                Update Checklist
              </button>
            )}
          </div>
        )}

        {/* Reject Form */}
        {showRejectForm && !agreement.escrow && isLandlord && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-950/20 p-4">
            <h3 className="font-semibold text-red-400 mb-3">Reject Agreement</h3>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Optional: Reason for rejection"
              className="w-full mb-3 rounded-lg bg-midnight-900 border border-red-500/30 px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleRejectAgreement}
                disabled={actionState === "reject"}
                className="flex-1 rounded-lg px-3 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 transition text-white"
              >
                {actionState === "reject" ? "Rejecting..." : "Confirm Rejection"}
              </button>
              <button
                onClick={() => setShowRejectForm(false)}
                className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Escrow & Action Buttons */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            {/* Pay Deposit */}
            {canPay && (
              <button
                onClick={handlePayDeposit}
                disabled={actionState === "pay"}
                className="rounded-lg bg-neon-500 px-4 py-2 text-sm font-semibold text-midnight-900 hover:bg-neon-400 disabled:opacity-60 transition"
              >
                {actionState === "pay" ? "Processing..." : "💳 Pay Deposit (Simulated)"}
              </button>
            )}

            {/* Request Release */}
            {canRequest && (
              <button
                onClick={handleRequestRelease}
                disabled={actionState === "request"}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 disabled:opacity-60 transition"
              >
                {actionState === "request" ? "Processing..." : "Request Release"}
              </button>
            )}

            {/* Confirm Release */}
            {canConfirm && (
              <button
                onClick={handleConfirmRelease}
                disabled={actionState === "confirm"}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition"
              >
                {actionState === "confirm" ? "Processing..." : "✓ Confirm Release"}
              </button>
            )}

            {/* Reject Agreement */}
            {!agreement.escrow && isLandlord && agreement.agreement.agreementStatus === "pending" && (
              <button
                onClick={() => setShowRejectForm(!showRejectForm)}
                className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-950/20 transition"
              >
                Reject Agreement
              </button>
            )}

            {/* Raise Dispute */}
            {canDispute && (
              <button
                onClick={handleRaiseDispute}
                className="rounded-lg border border-amber-500/30 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-950/20 transition"
              >
                ⚠️ Raise Dispute
              </button>
            )}
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/agreements/${agreement.agreement._id}/evidence`}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 transition"
            >
              📸 View Evidence
            </Link>
            {canDispute && (
              <Link
                to={`/disputes/${agreement.agreement._id}`}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 transition"
              >
                View Dispute
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementDetailPage;
