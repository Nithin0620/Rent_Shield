import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import EvidenceUpload from "../components/EvidenceUpload";
import { AgreementStatus } from "../types/agreement";
import { EvidenceGroupedResponse } from "../types/evidence";
import { EvidenceType } from "../types/evidenceEnums";
import { getMyAgreements } from "../services/agreementService";
import { getAgreementEvidence, verifyEvidence } from "../services/evidenceService";
import useAuth from "../hooks/useAuth";
import { useToast } from "../components/ui/ToastProvider";
import Spinner from "../components/ui/Spinner";

const AgreementEvidencePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [agreement, setAgreement] = useState<any>(null);
  const [evidenceData, setEvidenceData] = useState<EvidenceGroupedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [integrityMap, setIntegrityMap] = useState<Record<string, boolean>>({});
  const { push } = useToast();

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const agreements = await getMyAgreements();
      const match = agreements.find((item) => item._id === id) || null;
      setAgreement(match);
      const evidence = await getAgreementEvidence(id);
      setEvidenceData(evidence);
    } catch {
      setMessage("Unable to load evidence.");
      push("Unable to load evidence.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, push]);

  const canUpload = useMemo(() => {
    if (!agreement || !user) return false;
    const isParty =
      agreement.tenantId._id === user.id ||
      agreement.landlordId._id === user.id;
    return isParty && agreement.status === AgreementStatus.Active;
  }, [agreement, user]);

  const handleVerify = async (evidenceId: string) => {
    setVerifyingId(evidenceId);
    setMessage(null);
    try {
      const result = await verifyEvidence(evidenceId);
      setIntegrityMap((prev) => ({ ...prev, [evidenceId]: result.integrity }));
      push(result.integrity ? "Evidence verified." : "Evidence mismatch detected.", result.integrity ? "success" : "error");
    } catch {
      setMessage("Integrity check failed.");
      push("Integrity check failed.", "error");
    } finally {
      setVerifyingId(null);
    }
  };

  const renderEvidence = (type: EvidenceType, label: string) => {
    const items = evidenceData?.grouped?.[type] || [];
    return (
      <section className="card" style={{ marginBottom: 16 }}>
        <h3>{label}</h3>
        {items.length === 0 ? (
          <p className="muted">No evidence uploaded.</p>
        ) : (
          <div className="list">
            {items.map((item) => (
              <article key={item._id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <p className="muted">Uploaded by {item.uploadedBy.name}</p>
                    <p className="muted">{new Date(item.uploadedAt).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleVerify(item._id)}
                    disabled={verifyingId === item._id}
                  >
                    {verifyingId === item._id ? "Verifying..." : "Verify Integrity"}
                  </button>
                </div>
                {item.mimeType.startsWith("video") ? (
                  <video src={item.fileUrl} controls style={{ width: "100%", borderRadius: 12 }} />
                ) : (
                  <img src={item.fileUrl} alt="evidence" style={{ width: "100%", borderRadius: 12 }} />
                )}
                {integrityMap[item._id] !== undefined && (
                  <p className="muted">
                    {integrityMap[item._id] ? "✔ Verified" : "✖ Tampered"}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <section className="card">
      <h1>Agreement evidence</h1>
      {message && <p className="muted">{message}</p>}
      {loading ? (
        <div className="flex items-center gap-3 text-slate-300">
          <Spinner />
          <span>Loading...</span>
        </div>
      ) : !agreement ? (
        <p className="muted">Agreement not found.</p>
      ) : (
        <>
          <p className="muted">Property: {agreement.propertyId.title}</p>
          <p className="muted">Status: {agreement.status}</p>
          <EvidenceUpload
            agreementId={agreement._id}
            disabled={!canUpload}
            onUploaded={loadData}
          />
          {renderEvidence(EvidenceType.MoveIn, "Move-in evidence")}
          {renderEvidence(EvidenceType.MoveOut, "Move-out evidence")}
          {renderEvidence(EvidenceType.DamageProof, "Damage proof")}
          <section className="card">
            <h3>Evidence timeline</h3>
            {evidenceData?.evidence?.length ? (
              <div style={{ borderLeft: "2px solid #e5e7eb", paddingLeft: 16 }}>
                {evidenceData.evidence.map((item) => (
                  <div key={item._id} style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600 }}>{new Date(item.uploadedAt).toLocaleString()}</div>
                    <div className="muted">
                      {item.uploadedBy.name} • {item.type.replace("_", " ")}
                    </div>
                    {item.mimeType.startsWith("video") ? (
                      <video
                        src={item.fileUrl}
                        controls
                        style={{ width: "100%", borderRadius: 12, marginTop: 8 }}
                      />
                    ) : (
                      <img
                        src={item.fileUrl}
                        alt="evidence"
                        style={{ width: "100%", borderRadius: 12, marginTop: 8 }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No timeline entries yet.</p>
            )}
          </section>
        </>
      )}
    </section>
  );
};

export default AgreementEvidencePage;
