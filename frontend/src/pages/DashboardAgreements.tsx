import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EscrowStatusBadge from "../components/dashboard/EscrowStatusBadge";
import Skeleton from "../components/ui/Skeleton";
import Spinner from "../components/ui/Spinner";
import TrustScoreBadge from "../components/TrustScoreBadge";
import { AgreementWithEscrow, EscrowStatus } from "../types/agreement";
import {
  confirmRelease,
  getMyAgreements,
  payDeposit,
  requestRelease
} from "../services/agreementService";
import { useToast } from "../components/ui/ToastProvider";
import useAuth from "../hooks/useAuth";

const DashboardAgreements = () => {
  const [agreements, setAgreements] = useState<AgreementWithEscrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState<Record<string, "pay" | "request" | "confirm" | null>>(
    {}
  );
  const { push } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyAgreements();
        setAgreements(data);
      } catch {
        push("Unable to load agreements.", "error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [push]);

  const updateEscrow = (agreementId: string, nextEscrow: AgreementWithEscrow["escrow"]) => {
    setAgreements((prev) =>
      prev.map((item) =>
        item.agreement._id === agreementId ? { ...item, escrow: nextEscrow } : item
      )
    );
  };

  const handlePayDeposit = async (agreementId: string) => {
    setActionState((prev) => ({ ...prev, [agreementId]: "pay" }));
    try {
      const escrow = await payDeposit(agreementId);
      updateEscrow(agreementId, escrow);
      push("Deposit paid and escrow locked.", "success");
    } catch {
      push("Failed to pay deposit.", "error");
    } finally {
      setActionState((prev) => ({ ...prev, [agreementId]: null }));
    }
  };

  const handleRequestRelease = async (agreementId: string) => {
    setActionState((prev) => ({ ...prev, [agreementId]: "request" }));
    try {
      const escrow = await requestRelease(agreementId);
      updateEscrow(agreementId, escrow);
      push("Release requested.", "success");
    } catch {
      push("Failed to request release.", "error");
    } finally {
      setActionState((prev) => ({ ...prev, [agreementId]: null }));
    }
  };

  const handleConfirmRelease = async (agreementId: string) => {
    setActionState((prev) => ({ ...prev, [agreementId]: "confirm" }));
    try {
      const escrow = await confirmRelease(agreementId);
      updateEscrow(agreementId, escrow);
      push("Release confirmed.", "success");
    } catch {
      push("Failed to confirm release.", "error");
    } finally {
      setActionState((prev) => ({ ...prev, [agreementId]: null }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    );
  }

  if (!agreements.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-slate-300 mb-4">No agreements yet.</p>
        <Link
          to="/properties"
          className="inline-block rounded-lg bg-neon-500 px-4 py-2 text-sm font-medium text-midnight-900 hover:bg-neon-400"
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">My Agreements</h2>
        <span className="text-sm text-slate-400">{agreements.length} total</span>
      </div>

      <div className="grid gap-4">
        {agreements.map(({ agreement, escrow }) => (
          <div key={agreement._id} className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{agreement.propertyId.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{agreement.propertyId.address}</p>
              </div>
              <div className="flex items-center gap-2">
                {escrow && <EscrowStatusBadge status={escrow.escrowStatus} />}
                <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-medium text-slate-300 capitalize">
                  {agreement.agreementStatus}
                </span>
              </div>
            </div>

            {/* Party Details */}
            <div className="grid gap-3 mb-4 md:grid-cols-3">
              <div className="rounded-lg bg-midnight-900/50 p-3 text-sm">
                <p className="text-slate-400 mb-1">Other Party</p>
                <p className="text-white font-medium mb-2">
                  {user?.id === agreement.tenantId._id ? agreement.landlordId.name : agreement.tenantId.name}
                </p>
                {user?.id === agreement.tenantId._id && agreement.landlordId.trustScore !== undefined && (
                  <TrustScoreBadge score={agreement.landlordId.trustScore} size="sm" />
                )}
                {user?.id === agreement.landlordId._id && agreement.tenantId.trustScore !== undefined && (
                  <TrustScoreBadge score={agreement.tenantId.trustScore} size="sm" />
                )}
              </div>

              <div className="rounded-lg bg-midnight-900/50 p-3 text-sm space-y-1">
                <p className="text-slate-400">Monthly Rent</p>
                <p className="text-white font-semibold">₹{agreement.propertyId.rent?.toLocaleString() || "N/A"}</p>
              </div>

              <div className="rounded-lg bg-midnight-900/50 p-3 text-sm space-y-1">
                <p className="text-slate-400">Deposit</p>
                <p className="text-white font-semibold">₹{agreement.depositAmount.toLocaleString()}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/agreements/${agreement._id}`}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 transition"
              >
                View Details
              </Link>

              {escrow?.escrowStatus === EscrowStatus.Unpaid && user?.id === agreement.tenantId._id && (
                <button
                  onClick={() => handlePayDeposit(agreement._id)}
                  disabled={actionState[agreement._id] === "pay"}
                  className="rounded-lg bg-neon-500 px-4 py-2 text-sm font-semibold text-midnight-900 hover:bg-neon-400 disabled:opacity-60 transition"
                >
                  {actionState[agreement._id] === "pay" ? "Paying..." : "💳 Pay Deposit"}
                </button>
              )}

              {escrow?.escrowStatus === EscrowStatus.Locked && (
                <button
                  onClick={() => handleRequestRelease(agreement._id)}
                  disabled={actionState[agreement._id] === "request"}
                  className="rounded-lg border border-blue-500/30 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-950/20 disabled:opacity-60 transition"
                >
                  {actionState[agreement._id] === "request" ? "Requesting..." : "Request Release"}
                </button>
              )}

              {escrow?.escrowStatus === EscrowStatus.ReleaseRequested &&
                ((user?.id === agreement.tenantId._id && !escrow.releaseRequestedByTenant) ||
                  (user?.id === agreement.landlordId._id && !escrow.releaseRequestedByLandlord)) && (
                <button
                  onClick={() => handleConfirmRelease(agreement._id)}
                  disabled={actionState[agreement._id] === "confirm"}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition"
                >
                  {actionState[agreement._id] === "confirm" ? "Confirming..." : "✓ Confirm Release"}
                </button>
              )}

              {escrow?.escrowStatus === EscrowStatus.Disputed && (
                <Link
                  to={`/disputes/${agreement._id}`}
                  className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-950/20 transition"
                >
                  ⚠️ View Dispute
                </Link>
              )}

              <Link
                to={`/agreements/${agreement._id}/evidence`}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 transition"
              >
                📸 Evidence
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardAgreements;
