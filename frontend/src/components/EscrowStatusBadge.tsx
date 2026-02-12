import { EscrowStatus } from "../types/agreement";

const statusColors: Record<EscrowStatus, string> = {
  [EscrowStatus.Unpaid]: "#9ca3af",
  [EscrowStatus.Locked]: "#2563eb",
  [EscrowStatus.ReleaseRequested]: "#f59e0b",
  [EscrowStatus.Released]: "#16a34a",
  [EscrowStatus.Disputed]: "#dc2626"
};

const labelMap: Record<EscrowStatus, string> = {
  [EscrowStatus.Unpaid]: "UNPAID",
  [EscrowStatus.Locked]: "LOCKED",
  [EscrowStatus.ReleaseRequested]: "RELEASE REQUESTED",
  [EscrowStatus.Released]: "RELEASED",
  [EscrowStatus.Disputed]: "DISPUTED"
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
