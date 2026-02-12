import { useMemo } from "react";
import { useParams } from "react-router-dom";
import EscrowStatusBadge from "../components/dashboard/EscrowStatusBadge";
import { mockAgreements } from "../services/mockData";
import { EscrowStatus } from "../types/agreement";
import { useToast } from "../components/ui/ToastProvider";

const AgreementDetailPage = () => {
  const { id } = useParams();
  const { push } = useToast();

  const agreement = useMemo(
    () => mockAgreements.find((item) => item.agreement._id === id),
    [id]
  );

  if (!agreement) {
    return <p className="p-6 text-slate-300">Agreement not found.</p>;
  }

  const escrowStatus = agreement.escrow?.escrowStatus || EscrowStatus.Unpaid;

  return (
    <div className="min-h-screen bg-midnight-900 p-6">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">{agreement.agreement.propertyId.title}</h1>
            <p className="text-sm text-slate-300">{agreement.agreement.propertyId.address}</p>
          </div>
          <EscrowStatusBadge status={escrowStatus} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Agreement</p>
            <p className="mt-2 text-sm text-slate-300">Tenant: {agreement.agreement.tenantId.name}</p>
            <p className="text-sm text-slate-300">Dates: {agreement.agreement.startDate} → {agreement.agreement.endDate}</p>
            <p className="text-sm text-slate-300">Deposit: ₹{agreement.agreement.depositAmount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Escrow</p>
            <p className="mt-2 text-sm text-slate-300">Status: {escrowStatus}</p>
            <p className="text-sm text-slate-300">Evidence count: 4</p>
            <p className="text-sm text-slate-300">Dispute status: none</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => push("Release requested (simulation).", "success")}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200"
          >
            Request Release
          </button>
          <button
            onClick={() => push("Dispute raised (simulation).", "error")}
            className="rounded-full bg-neon-500 px-4 py-2 text-sm font-semibold text-midnight-900"
          >
            Raise Dispute
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgreementDetailPage;
