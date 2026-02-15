import { EscrowStatus } from "../types/agreement";

const statusColors: Record<EscrowStatus, string> = {
  [EscrowStatus.AwaitingPayment]: "#9ca3af",
  [EscrowStatus.Held]: "#2563eb",
  [EscrowStatus.Released]: "#16a34a",
  [EscrowStatus.Disputed]: "#dc2626",
  [EscrowStatus.RefundProcessing]: "#f59e0b"
};

const labelMap: Record<EscrowStatus, string> = {
  [EscrowStatus.AwaitingPayment]: "AWAITING PAYMENT",
  [EscrowStatus.Held]: "HELD",
  [EscrowStatus.Released]: "RELEASED",
  [EscrowStatus.Disputed]: "DISPUTED",
  [EscrowStatus.RefundProcessing]: "REFUND IN PROGRESS"
};

const EscrowStatusBadge = ({ status }: { status: EscrowStatus }) => {
  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        background: statusColors[status],
        color: "#fff",
        fontSize: "0.75rem",
        fontWeight: 600
      }}
    >
      {labelMap[status]}
    </span>
  );
};

export default EscrowStatusBadge;
