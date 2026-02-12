import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AgreementWithEscrow, EscrowStatus } from "../types/agreement";
import DisputeQuickAction from "../components/DisputeQuickAction";
import {
  confirmRelease,
  getMyAgreements,
  requestRelease
} from "../services/agreementService";
import EscrowStatusBadge from "../components/EscrowStatusBadge";
import useAuth from "../hooks/useAuth";

const MyAgreementsPage = () => {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<AgreementWithEscrow[]>([]);
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

  const handleRequestRelease = async (agreementId: string) => {
    setProcessingId(agreementId);
    setMessage(null);
    try {
      await requestRelease(agreementId);
      await loadAgreements();
    } catch {
      setMessage("Unable to request release.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmRelease = async (agreementId: string) => {
    setProcessingId(agreementId);
    setMessage(null);
    try {
      await confirmRelease(agreementId);
      await loadAgreements();
    } catch {
      setMessage("Unable to confirm release.");
    } finally {
      setProcessingId(null);
    }
  };


  const isTenant = user?.role === "tenant";

  const content = useMemo(() => {
    if (!agreements.length) {
      return <p className="muted">No agreements yet.</p>;
    }

    return (
      <div className="list">
        {agreements.map(({ agreement, escrow }) => {
          const escrowStatus = escrow?.escrowStatus ?? EscrowStatus.Unpaid;
          const canRequestRelease =
            escrowStatus === EscrowStatus.Locked &&
            (user?.role === "tenant" || user?.role === "landlord") &&
            escrow?.webhookVerified;
          const canConfirmRelease =
            escrowStatus === EscrowStatus.ReleaseRequested &&
            (user?.role === "tenant" || user?.role === "landlord");

          const tenantConfirmed = escrow?.releaseRequestedByTenant;
          const landlordConfirmed = escrow?.releaseRequestedByLandlord;

          const alreadyConfirmed =
            (user?.role === "tenant" && tenantConfirmed) ||
            (user?.role === "landlord" && landlordConfirmed);

          return (
            <article key={agreement._id} className="card">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>{agreement.propertyId.title}</h3>
                <EscrowStatusBadge status={escrowStatus} />
              </div>
              <p className="muted">{agreement.propertyId.address}</p>
              <p>Agreement status: {agreement.agreementStatus}</p>
              <p>Deposit amount: ${agreement.depositAmount}</p>
              <p>Landlord: {agreement.landlordId.name}</p>
              <p>Payment verified: {escrow?.webhookVerified ? "Yes" : "No"}</p>
              <p>Escrow status: {escrowStatus}</p>
              {user?.role === "tenant" && (
                <p className="muted">Refund expected: 100% (subject to dispute resolution)</p>
              )}
              {user?.role === "landlord" && (
                <p className="muted">Expected payout: 0–100% (pending dispute resolution)</p>
              )}
              <Link to={`/agreements/${agreement._id}/evidence`}>View evidence timeline</Link>
              <DisputeQuickAction agreement={{ agreement, escrow }} />

              <div className="form-grid">

                {canRequestRelease && (
                  <button
                    onClick={() => handleRequestRelease(agreement._id)}
                    disabled={processingId === agreement._id}
                  >
                    {processingId === agreement._id ? "Processing..." : "Request release"}
                  </button>
                )}

                {canConfirmRelease && (
                  <button
                    onClick={() => handleConfirmRelease(agreement._id)}
                    disabled={processingId === agreement._id || alreadyConfirmed}
                  >
                    {alreadyConfirmed
                      ? "Already confirmed"
                      : processingId === agreement._id
                      ? "Processing..."
                      : "Confirm release"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    );
  }, [agreements, isTenant, processingId, user?.role]);

  return (
    <section className="card">
      <h1>My agreements</h1>
      {message && <p className="muted">{message}</p>}
      {loading ? <p className="muted">Loading agreements...</p> : content}
    </section>
  );
};

export default MyAgreementsPage;
