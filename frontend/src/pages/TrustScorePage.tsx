import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import TrustScoreBadge from "../components/TrustScoreBadge";
import Spinner from "../components/ui/Spinner";

interface TrustScoreBreakdown {
  successfulAgreements: number;
  disputesWon: number;
  disputesLost: number;
  onGoingDisputes: number;
  evidenceSubmitted: number;
  paymentDelay: number;
}

const TrustScorePage = () => {
  const { user } = useAuth();
  const [breakdown, setBreakdown] = useState<TrustScoreBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading breakdown data
    // In real app, this would come from an API
    setTimeout(() => {
      setBreakdown({
        successfulAgreements: 12,
        disputesWon: 2,
        disputesLost: 0,
        onGoingDisputes: 0,
        evidenceSubmitted: 15,
        paymentDelay: 0,
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading || !breakdown) {
    return (
      <div className="min-h-screen bg-midnight-900 p-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  const totalScore = user?.trustScore || 0;
  const maxScore = 100;

  const factors = [
    {
      label: "Successful Agreements",
      value: breakdown.successfulAgreements,
      icon: "✓",
      color: "green",
      impact: "Positive",
      description: "Completed agreements without disputes",
    },
    {
      label: "Disputes Won",
      value: breakdown.disputesWon,
      icon: "🏆",
      color: "blue",
      impact: "Positive",
      description: "Disputes resolved in your favor",
    },
    {
      label: "Disputes Lost",
      value: breakdown.disputesLost,
      icon: "⚠️",
      color: "red",
      impact: "Negative",
      description: "Disputes resolved against you",
    },
    {
      label: "Ongoing Disputes",
      value: breakdown.onGoingDisputes,
      icon: "⏳",
      color: "amber",
      impact: "Neutral",
      description: "Currently under review",
    },
    {
      label: "Evidence Submitted",
      value: breakdown.evidenceSubmitted,
      icon: "📸",
      color: "purple",
      impact: "Positive",
      description: "Supporting documents uploaded",
    },
    {
      label: "Payment Delays",
      value: breakdown.paymentDelay,
      icon: "💳",
      color: "slate",
      impact: breakdown.paymentDelay === 0 ? "Positive" : "Negative",
      description: "Late or missed deposits",
    },
  ];

  return (
    <div className="min-h-screen bg-midnight-900 p-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Trust Score</h1>
          <p className="text-slate-400">Your reputation on RentShield</p>
        </div>

        {/* Main Score Card */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 mb-8">
          <div className="text-center">
            <p className="text-slate-400 mb-4">Your Trust Score</p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div>
                <p className="text-6xl font-bold text-white">{totalScore}</p>
                <p className="text-slate-400">out of {maxScore}</p>
              </div>
              <TrustScoreBadge score={totalScore} size="lg" />
            </div>

            {/* Score Bar */}
            <div className="w-full bg-white/10 rounded-full h-3 mb-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  totalScore >= 80
                    ? "bg-green-500"
                    : totalScore >= 60
                      ? "bg-blue-500"
                      : totalScore >= 40
                        ? "bg-amber-500"
                        : "bg-red-500"
                }`}
                style={{ width: `${(totalScore / maxScore) * 100}%` }}
              />
            </div>

            <p className="text-slate-400 text-sm">
              {totalScore >= 80
                ? "Excellent reliability and trust"
                : totalScore >= 60
                  ? "Good track record"
                  : totalScore >= 40
                    ? "Fair standing - improve by completing agreements smoothly"
                    : "Low score - focus on clean agreements and dispute resolution"}
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Score Breakdown</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {factors.map((factor) => (
              <div
                key={factor.label}
                className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">{factor.label}</p>
                    <p className="text-3xl font-bold text-white">{factor.value}</p>
                  </div>
                  <span className="text-2xl">{factor.icon}</span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-300">{factor.description}</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      factor.impact === "Positive"
                        ? "bg-green-500/20 text-green-400"
                        : factor.impact === "Negative"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-slate-500/20 text-slate-400"
                    }`}
                  >
                    {factor.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it Works */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">How Trust Score Works</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-green-400">+</span> Increases Score
              </h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>✓ Completing agreements successfully</li>
                <li>✓ Submitting supporting evidence</li>
                <li>✓ Paying deposits on time</li>
                <li>✓ Winning disputes with strong evidence</li>
                <li>✓ Maintaining communication consistency</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-red-400">−</span> Decreases Score
              </h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>✗ Losing disputes</li>
                <li>✗ Delayed or missed payments</li>
                <li>✗ Disputed escrow releases</li>
                <li>✗ Abandoned agreements</li>
                <li>✗ Lack of documentation</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-400">
              💡 <strong>Pro Tip:</strong> Your trust score impacts your ability to create agreements and negotiate dispute resolutions. Maintain a high score by completing agreements smoothly and providing clear evidence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustScorePage;
