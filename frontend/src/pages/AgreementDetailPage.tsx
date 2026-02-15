import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EscrowStatusBadge from "../components/dashboard/EscrowStatusBadge";
import { RentalAgreement, EscrowStatus } from "../types/agreement";
import { useToast } from "../components/ui/ToastProvider";
import {
  getAgreementDetail,
  approveAgreement,
} from "../services/agreementService";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/ui/Spinner";
import TrustScoreBadge from "../components/TrustScoreBadge";

const AgreementDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const { user } = useAuth();
  const [agreement, setAgreement] = useState<RentalAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState<"approve" | null>(null);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [landlordSignature, setLandlordSignature] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const { agreement } = await getAgreementDetail(id);
        setAgreement(agreement);
        if (!agreement) {
          setError("Agreement not found.");
        }
      } catch (err) {
        setError("Unable to load agreement. Please try again.");
        console.error("Error loading agreement:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleApproveAgreement = async () => {
    if (!agreement || !landlordSignature.trim()) {
      push("Please enter your full name to approve.", "error");
      return;
    }
    setActionState("approve");
    try {
      const updated = await approveAgreement(agreement._id, landlordSignature);
      setAgreement(updated);
      push("Agreement approved successfully.", "success");
      setShowApprovalForm(false);
      setLandlordSignature("");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to approve agreement.";
      push(errorMsg, "error");
      console.error("Error approving agreement:", err);
    } finally {
      setActionState(null);
    }
  };

  const handleRaiseDispute = () => {
    if (agreement) {
      navigate(`/disputes/${agreement._id}/create`);
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

  const escrowStatus = agreement.escrow?.status || EscrowStatus.AwaitingPayment;
  const isTenant = user?.id === agreement.tenantId._id;
  const isLandlord = user?.id === agreement.landlordId._id;
  const isPending = agreement.status === "pending";
  const isActive = agreement.status === "active";
  const canApprove = isLandlord && isPending && !agreement.agreement?.acceptedByLandlord;

  return (
    <div className="min-h-screen bg-midnight-900 p-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Header Section */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-semibold text-white">{agreement.propertyId.title}</h1>
              <p className="text-slate-400">{agreement.propertyId.address}</p>
            </div>
            <div className="flex items-center gap-3">
              <EscrowStatusBadge status={escrowStatus} />
              <span className="px-3 py-1 rounded-lg bg-white/10 text-sm text-slate-300 capitalize">
                {agreement.status}
              </span>
            </div>
          </div>
        </div>

        {/* Parties with Trust Scores */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Tenant</p>
            <p className="font-semibold text-white mb-2">{agreement.tenantId.name}</p>
            {agreement.tenantId.trustScore !== undefined && (
              <TrustScoreBadge score={agreement.tenantId.trustScore} size="sm" />
            )}
          </div>
          <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Landlord</p>
            <p className="font-semibold text-white mb-2">{agreement.landlordId.name}</p>
            {agreement.landlordId.trustScore !== undefined && (
              <TrustScoreBadge score={agreement.landlordId.trustScore} size="sm" />
            )}
          </div>
        </div>

        {/* Agreement Terms */}
        <div className="rounded-2xl border border-white/10 p-6 bg-white/5">
          <h2 className="font-semibold text-white text-lg mb-4">Agreement Terms</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Duration</span>
                <span className="text-white font-medium">
                  {agreement.months} months
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Start Date</span>
                <span className="text-white font-medium">
                  {new Date(agreement.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">End Date</span>
                <span className="text-white font-medium">
                  {new Date(agreement.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lock-in Period</span>
                <span className="text-white font-medium">
                  {agreement.propertyId.lockInPeriod || "N/A"} months
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Monthly Rent</span>
                <span className="text-white font-medium">
                  ₹{agreement.propertyId.rent?.toLocaleString() || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Notice Period</span>
                <span className="text-white font-medium">
                  {agreement.propertyId.noticePeriod || "N/A"} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Maintenance Charges</span>
                <span className="text-white font-medium">
                  ₹{agreement.propertyId.maintenanceCharges?.toLocaleString() || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Escrow Section */}
        <div className="rounded-2xl border border-white/10 p-6 bg-white/5">
          <h2 className="font-semibold text-white text-lg mb-4">Escrow & Deposit</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex justify-between">
                <span className="text-slate-400">Deposit Amount</span>
                <span className="text-white font-medium">
                  ₹{agreement.depositAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Escrow Fee Rate</span>
                <span className="text-white font-medium">
                  {agreement.escrow?.escrowFeePercentage || 1.5}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Escrow Fee Amount</span>
                <span className="text-neon-400 font-medium">
                  ₹{agreement.escrow?.escrowFeeAmount?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="h-px bg-white/10"></div>
              <div className="flex justify-between">
                <span className="text-slate-300">Total to Pay</span>
                <span className="text-white font-semibold">
                  ₹{agreement.escrow?.totalPayableAmount?.toLocaleString() || agreement.depositAmount.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-slate-300 text-sm">
                Your deposit is held in neutral escrow by RentShield. This ensures fair protection for both tenant and landlord throughout the lease duration.
              </p>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-slate-400">Status Timeline</p>
                <ul className="text-sm space-y-1 text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neon-500"></span>
                    Current: {escrowStatus === EscrowStatus.AwaitingPayment ? "Awaiting Payment" : escrowStatus}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                    At lease end: Release
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Default Checklist */}
        {agreement.defaultChecklistItems && agreement.defaultChecklistItems.length > 0 && (
          <div className="rounded-2xl border border-white/10 p-6 bg-white/5">
            <h2 className="font-semibold text-white text-lg mb-4">Property Checklist</h2>
            <ul className="space-y-2">
              {agreement.defaultChecklistItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition">
                  <span className="text-neon-500 text-lg">✓</span>
                  <span className="text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Signatures Section */}
        <div className="rounded-2xl border border-white/10 p-6 bg-white/5">
          <h2 className="font-semibold text-white text-lg mb-4">Digital Signatures</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Tenant Signature</p>
              <p className={`text-lg font-semibold ${agreement.agreement?.tenantSignature ? "text-neon-400" : "text-slate-500"}`}>
                {agreement.agreement?.tenantSignature || "Pending"}
              </p>
              {agreement.agreement?.tenantSignature && (
                <p className="text-xs text-slate-400 mt-2">
                  Signed on {new Date(agreement.agreement.digitalSignedAt || "").toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Landlord Signature</p>
              <p className={`text-lg font-semibold ${agreement.agreement?.landlordSignature ? "text-neon-400" : "text-slate-500"}`}>
                {agreement.agreement?.landlordSignature || "Pending"}
              </p>
              {agreement.agreement?.landlordSignature && (
                <p className="text-xs text-slate-400 mt-2">
                  Signed on {new Date(agreement.agreement.digitalSignedAt || "").toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Approval Section */}
        {canApprove && (
          <div className="rounded-2xl border border-neon-500/30 p-6 bg-neon-950/20">
            {!showApprovalForm ? (
              <div className="text-center">
                <p className="text-slate-300 mb-4">
                  As the landlord, you need to review and digitally sign this agreement to activate it.
                </p>
                <button
                  onClick={() => setShowApprovalForm(true)}
                  className="rounded-lg bg-neon-500 px-6 py-2 text-sm font-semibold text-midnight-900 hover:bg-neon-400 transition"
                >
                  ✓ Approve & Sign Agreement
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Sign Agreement</h3>
                <input
                  type="text"
                  value={landlordSignature}
                  onChange={(e) => setLandlordSignature(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg bg-midnight-900 border border-white/10 px-4 py-2 text-white placeholder-slate-500 focus:border-neon-500 outline-none transition"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleApproveAgreement}
                    disabled={actionState === "approve" || !landlordSignature.trim()}
                    className="flex-1 rounded-lg bg-neon-500 px-4 py-2 text-sm font-semibold text-midnight-900 hover:bg-neon-400 disabled:opacity-50 transition"
                  >
                    {actionState === "approve" ? "Approving..." : "Approve Agreement"}
                  </button>
                  <button
                    onClick={() => {
                      setShowApprovalForm(false);
                      setLandlordSignature("");
                    }}
                    className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="rounded-2xl border border-white/10 p-6 bg-white/5">
          <div className="flex flex-wrap gap-3">
            {/* Raise Dispute */}
            {isActive && escrowStatus === EscrowStatus.Held && (
              <button
                onClick={handleRaiseDispute}
                className="rounded-lg border border-amber-500/30 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-950/20 transition"
              >
                ⚠️ Raise Dispute
              </button>
            )}

            {/* View Evidence */}
            <Link
              to={`/agreements/${agreement._id}/evidence`}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 transition"
            >
              📸 View Evidence Vault
            </Link>

            {/* Back Link */}
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 transition"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementDetailPage;
