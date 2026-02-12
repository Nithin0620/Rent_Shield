import { EscrowStatus } from "../../types/agreement";

const statusMap: Record<EscrowStatus, string> = {
  unpaid: "bg-slate-200 text-slate-700",
  locked: "bg-blue-100 text-blue-700",
  release_requested: "bg-yellow-100 text-yellow-700",
  disputed: "bg-red-100 text-red-700",
  released: "bg-emerald-100 text-emerald-700"
};

const EscrowStatusBadge = ({ status }: { status: EscrowStatus }) => {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMap[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
};

export default EscrowStatusBadge;
