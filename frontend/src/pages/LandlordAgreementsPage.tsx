import { useEffect, useState } from "react";
import { AgreementStatus, RentalAgreement } from "../types/agreement";
import { approveAgreement, getMyAgreements } from "../services/agreementService";

const LandlordAgreementsPage = () => {
  const [agreements, setAgreements] = useState<RentalAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadAgreements = async () => {
    setLoading(true);
    try {
      const data = await getMyAgreements();
      setAgreements(data.filter((item) => item.status === AgreementStatus.Pending));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgreements();
  }, []);

  const handleApprove = async (agreement: RentalAgreement) => {
    setProcessingId(agreement._id);
    setMessage(null);
    try {
      await approveAgreement(agreement._id, agreement.landlordId._id?.toString() || "");
      await loadAgreements();
    } catch {
      setMessage("Unable to approve agreement.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="card">
      <h1>Pending agreements</h1>
      {message && <p className="muted">{message}</p>}
      {loading ? (
        <p className="muted">Loading agreements...</p>
      ) : agreements.length === 0 ? (
        <p className="muted">No pending agreements.</p>
      ) : (
        <div className="list">
          {agreements.map((item) => (
            <article key={item._id} className="card">
              <h3>{item.propertyId.title}</h3>
              <p className="muted">{item.propertyId.address}</p>
              <p>Tenant: {item.tenantId.name}</p>
              <p>Deposit: ${item.escrow?.depositAmount || 0}</p>
              <button
                onClick={() => handleApprove(item)}
                disabled={processingId === item._id}
              >
                {processingId === item._id ? "Approving..." : "Approve"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default LandlordAgreementsPage;
