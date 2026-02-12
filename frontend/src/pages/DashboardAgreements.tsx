import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EscrowStatusBadge from "../components/dashboard/EscrowStatusBadge";
import Skeleton from "../components/ui/Skeleton";
import { AgreementWithEscrow, EscrowStatus } from "../types/agreement";
import { getMyAgreements } from "../services/agreementService";
import { mockAgreements } from "../services/mockData";
import { useToast } from "../components/ui/ToastProvider";

const DashboardAgreements = () => {
  const [agreements, setAgreements] = useState<AgreementWithEscrow[]>([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyAgreements();
        setAgreements(data);
      } catch {
        setAgreements(mockAgreements);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSimulatePay = (id: string) => {
    setAgreements((prev) =>
      prev.map((item) =>
        item.agreement._id === id
          ? {
              ...item,
              escrow: item.escrow
                ? { ...item.escrow, escrowStatus: EscrowStatus.Locked, webhookVerified: true }
                : item.escrow
            }
          : item
      )
    );
    push("Deposit marked as paid (simulation).", "success");
  };

  const handleConfirmRelease = (id: string) => {
    setAgreements((prev) =>
      prev.map((item) =>
        item.agreement._id === id
          ? {
              ...item,
              escrow: item.escrow
                ? { ...item.escrow, escrowStatus: EscrowStatus.Released }
                : item.escrow
            }
          : item
      )
    );
    push("Release confirmed (simulation).", "success");
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
    return <p className="text-slate-300">No agreements yet.</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">My Agreements</h2>
      <div className="grid gap-4">
        {agreements.map(({ agreement, escrow }) => (
          <div key={agreement._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{agreement.propertyId.title}</h3>
                <p className="text-sm text-slate-300">Landlord: {agreement.landlordId.name}</p>
              </div>
              {escrow && <EscrowStatusBadge status={escrow.escrowStatus} />}
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-3">
              <p>Agreement: {agreement.agreementStatus}</p>
              <p>Deposit: ₹{agreement.depositAmount}</p>
              <p>Escrow: {escrow?.escrowStatus}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to={`/agreements/${agreement._id}`}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
              >
                View Details
              </Link>
              {escrow?.escrowStatus === EscrowStatus.Unpaid && (
                <button
                  onClick={() => handleSimulatePay(agreement._id)}
                  className="rounded-full bg-neon-500 px-4 py-2 text-sm font-semibold text-midnight-900"
                >
                  Pay Deposit
                </button>
              )}
              {escrow?.escrowStatus === EscrowStatus.ReleaseRequested && (
                <button
                  onClick={() => handleConfirmRelease(agreement._id)}
                  className="rounded-full bg-neon-500 px-4 py-2 text-sm font-semibold text-midnight-900"
                >
                  Confirm Release
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardAgreements;
