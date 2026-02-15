interface TrustScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

const TrustScoreBadge = ({ score, size = "md" }: TrustScoreBadgeProps) => {
  const getTrustLevel = (score: number) => {
    if (score >= 80) return { label: "High Trust", color: "bg-green-500/20 text-green-400 border-green-500/30" };
    if (score >= 60) return { label: "Medium Trust", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    return { label: "Low Trust", color: "bg-red-500/20 text-red-400 border-red-500/30" };
  };

  const { label, color } = getTrustLevel(score);
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border ${color} ${sizeClasses[size]} font-medium`}
      title={`Trust Score: ${score}/100 - ${label}`}
    >
      <span className="w-2 h-2 rounded-full bg-current"></span>
      <span>{score}</span>
    </span>
  );
};

export default TrustScoreBadge;
