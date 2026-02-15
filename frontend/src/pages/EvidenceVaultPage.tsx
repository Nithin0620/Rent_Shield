import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import { useToast } from "../components/ui/ToastProvider";
import { getMyAgreements } from "../services/agreementService";

interface Evidence {
  _id: string;
  agreementId: string;
  type: string;
  filename: string;
  uploadedAt: string;
  verificationHash?: string;
  uploadedBy: string;
}

interface AgreementGroup {
  agreementId: string;
  propertyTitle: string;
  evidence: Evidence[];
}

const EvidenceVaultPage = () => {
  const [groupedEvidence, setGroupedEvidence] = useState<AgreementGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const agreements = await getMyAgreements();
        const grouped: AgreementGroup[] = agreements.map(({ agreement }: any) => ({
          agreementId: agreement._id,
          propertyTitle: agreement.propertyId.title,
          evidence: agreement.evidence || [],
        }));
        setGroupedEvidence(grouped);
      } catch {
        push("Unable to load evidence", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [push]);

  const totalEvidence = groupedEvidence.reduce((sum, g) => sum + g.evidence.length, 0);

  const getEvidenceTypeColor = (type: string): string => {
    const typeMap: Record<string, string> = {
      receipt: "blue",
      photo: "purple",
      document: "slate",
      inspection: "green",
      communication: "amber",
      other: "gray",
    };
    return typeMap[type?.toLowerCase()] || "slate";
  };

  const getEvidenceTypeIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      receipt: "🧾",
      photo: "📸",
      document: "📄",
      inspection: "🔍",
      communication: "💬",
      other: "📦",
    };
    return iconMap[type?.toLowerCase()] || "📦";
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-midnight-900 p-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Evidence Vault</h1>
          <p className="text-slate-400">Secure storage of all agreement evidence and documents</p>
        </div>

        {/* Stats */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-8">
          <p className="text-sm text-slate-400">Total Evidence Uploaded</p>
          <p className="text-3xl font-bold text-white">{totalEvidence} Files</p>
        </div>

        {/* Evidence by Agreement */}
        {groupedEvidence.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-slate-400">No evidence uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedEvidence.map((group) => (
              <div key={group.agreementId}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">{group.propertyTitle}</h2>
                  <span className="text-sm text-slate-400">{group.evidence.length} File{group.evidence.length !== 1 ? "s" : ""}</span>
                </div>

                {group.evidence.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
                    <p>No evidence for this agreement</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {group.evidence.map((evidence) => (
                      <div
                        key={evidence._id}
                        className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition p-5"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <span className="text-2xl">{getEvidenceTypeIcon(evidence.type)}</span>
                            <div>
                              <p className="font-semibold text-white">{evidence.filename}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium capitalize bg-${getEvidenceTypeColor(evidence.type)}-500/20 text-${getEvidenceTypeColor(evidence.type)}-400`}
                                >
                                  {evidence.type}
                                </span>
                                <p className="text-xs text-slate-400">
                                  Uploaded {new Date(evidence.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {evidence.verificationHash && (
                            <div className="text-right">
                              <p className="text-xs text-slate-400">Verified ✓</p>
                              <button className="mt-2 rounded-lg border border-green-500/30 px-3 py-1 text-xs font-medium text-green-400 hover:bg-green-950/20 transition">
                                Verify Integrity
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EvidenceVaultPage;
