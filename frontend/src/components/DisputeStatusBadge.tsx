import { DisputeStatus } from "../types/dispute";

const statusColors: Record<DisputeStatus, string> = {
  [DisputeStatus.Open]: "#f59e0b",
  [DisputeStatus.AiReviewed]: "#2563eb",
  [DisputeStatus.Resolved]: "#16a34a",
  [DisputeStatus.Rejected]: "#dc2626"
};

const labelMap: Record<DisputeStatus, string> = {
  [DisputeStatus.Open]: "OPEN",
  [DisputeStatus.AiReviewed]: "AI REVIEWED",
  [DisputeStatus.Resolved]: "RESOLVED",
  [DisputeStatus.Rejected]: "REJECTED"
};

const DisputeStatusBadge = ({ status }: { status: DisputeStatus }) => {
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

export default DisputeStatusBadge;
