import { EscrowStatus } from "../../types/agreement";

const statusMap: Record<EscrowStatus, string> = {
  "awaiting-payment": "bg-slate-200 text-slate-700",
  held: "bg-blue-100 text-blue-700",
  released: "bg-emerald-100 text-emerald-700",
  disputed: "bg-red-100 text-red-700",
  "refund-processing": "bg-yellow-100 text-yellow-700"
};

const EscrowStatusBadge = ({ status }: { status: EscrowStatus }) => {
  const labels: Record<EscrowStatus, string> = {
    "awaiting-payment": "Awaiting Payment",
    held: "Held",
    released: "Released",
    disputed: "Disputed",
    "refund-processing": "Refund Processing"
  };
  
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMap[status]}`}>
      {labels[status]}
    </span>
  );
};

export default EscrowStatusBadge;
