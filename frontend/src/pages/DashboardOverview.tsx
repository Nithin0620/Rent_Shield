import { useEffect, useState } from "react";
import Skeleton from "../components/ui/Skeleton";
import { AgreementWithEscrow, EscrowStatus } from "../types/agreement";
import { getMyAgreements } from "../services/agreementService";
import { mockAgreements } from "../services/mockData";

const DashboardOverview = () => {
  const [agreements, setAgreements] = useState<AgreementWithEscrow[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const activeCount = agreements.filter((item) => item.agreement.agreementStatus === "active").length;
  const unpaid = agreements.filter((item) => item.escrow?.escrowStatus === EscrowStatus.Unpaid).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Overview</p>
        <h1 className="text-2xl font-semibold text-white">Your RentShield Snapshot</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Agreements", value: agreements.length },
          { label: "Active Agreements", value: activeCount },
          { label: "Unpaid Escrows", value: unpaid }
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview;
