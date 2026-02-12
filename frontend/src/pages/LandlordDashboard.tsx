import { useEffect, useState } from "react";
import { AgreementStatus, AgreementWithEscrow } from "../types/agreement";
import { approveAgreement, getMyAgreements } from "../services/agreementService";

const LandlordDashboard = () => {
  const [agreements, setAgreements] = useState<AgreementWithEscrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadAgreements = async () => {
    setLoading(true);
    try {
      const data = await getMyAgreements();
      setAgreements(data.filter((item) => item.agreement.agreementStatus === AgreementStatus.Pending));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgreements();
  }, []);

  const handleApprove = async (agreementId: string) => {
    setProcessingId(agreementId);
    setMessage(null);
    try {
      await approveAgreement(agreementId);
      await loadAgreements();
    } catch {
      setMessage("Unable to approve agreement.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="card">
      <h1>Landlord dashboard</h1>
      <p className="muted">Pending agreements requiring approval.</p>
      {message && <p className="muted">{message}</p>}
      {loading ? (
        <p className="muted">Loading agreements...</p>
      ) : agreements.length === 0 ? (
        <p className="muted">No pending agreements.</p>
      ) : (
        <div className="list">
          {agreements.map(({ agreement }) => (
            <article key={agreement._id} className="card">
              <h3>{agreement.propertyId.title}</h3>
              <p className="muted">{agreement.propertyId.address}</p>
              <p>Tenant: {agreement.tenantId.name}</p>
              <p>Deposit: ${agreement.depositAmount}</p>
              <button
                onClick={() => handleApprove(agreement._id)}
                disabled={processingId === agreement._id}
              >
                {processingId === agreement._id ? "Approving..." : "Approve"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default LandlordDashboard;
