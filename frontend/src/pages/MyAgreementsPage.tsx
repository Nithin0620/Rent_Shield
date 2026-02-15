import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RentalAgreement, EscrowStatus } from "../types/agreement";
import DisputeQuickAction from "../components/DisputeQuickAction";
import { getMyAgreements } from "../services/agreementService";
import EscrowStatusBadge from "../components/EscrowStatusBadge";
import useAuth from "../hooks/useAuth";

const MyAgreementsPage = () => {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadAgreements = async () => {
    setLoading(true);
    try {
      const data = await getMyAgreements();
      setAgreements(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgreements();
  }, []);


  const isTenant = user?.role === "tenant";

  const content = useMemo(() => {
    if (!agreements.length) {
      return <p className="muted">No agreements yet.</p>;
    }

    return (
      <div className="list">
        {agreements.map((item) => {
          const escrowStatus = item.escrow?.status ?? EscrowStatus.AwaitingPayment;

          return (
            <article key={item._id} className="card">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>{item.propertyId.title}</h3>
                <EscrowStatusBadge status={escrowStatus} />
              </div>
              <p className="muted">{item.propertyId.address}</p>
              <p>Agreement status: {item.status}</p>
              <p>Deposit amount: ${item.escrow?.depositAmount || 0}</p>
              <p>Landlord: {item.landlordId.name}</p>
              <p>Payment verified: {item.escrow?.webhookVerified ? "Yes" : "No"}</p>
              <p>Escrow status: {escrowStatus}</p>
              {user?.role === "tenant" && (
                <p className="muted">Refund expected: 100% (subject to dispute resolution)</p>
              )}
              {user?.role === "landlord" && (
                <p className="muted">Expected payout: 0–100% (pending dispute resolution)</p>
              )}
              <Link to={`/agreements/${item._id}/evidence`}>View evidence timeline</Link>
              <DisputeQuickAction agreement={item} />
            </article>
          );
        })}
      </div>
    );
  }, [agreements, isTenant, user?.role]);

  return (
    <section className="card">
      <h1>My agreements</h1>
      {loading ? <p className="muted">Loading agreements...</p> : content}
    </section>
  );
};

export default MyAgreementsPage;
