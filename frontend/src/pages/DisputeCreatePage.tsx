import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createDispute } from "../services/disputeService";
import { getMyAgreements } from "../services/agreementService";
import { EscrowStatus } from "../types/agreement";
import { useToast } from "../components/ui/ToastProvider";

const DisputeCreatePage = () => {
  const { agreementId } = useParams();
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [escrowStatus, setEscrowStatus] = useState<EscrowStatus | null>(null);
  const navigate = useNavigate();
  const { push } = useToast();

  useEffect(() => {
    const loadEscrow = async () => {
      if (!agreementId) return;
      try {
        const agreements = await getMyAgreements();
        const match = agreements.find((item) => item._id === agreementId);
        setEscrowStatus(match?.escrow?.status || null);
      } catch {
        setMessage("Unable to load escrow status.");
        push("Unable to load escrow status.", "error");
      }
    };

    loadEscrow();
  }, [agreementId, push]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!agreementId) return;
    if (escrowStatus !== EscrowStatus.Held) {
      setMessage("Dispute can only be raised when escrow is held.");
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      await createDispute(agreementId, reason);
      push("Dispute created.", "success");
      navigate(`/disputes/${agreementId}`);
    } catch {
      setMessage("Unable to raise dispute.");
      push("Unable to raise dispute.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h1>Raise dispute</h1>
      <p className="muted">Provide a clear reason for the dispute.</p>
      {escrowStatus && <p className="muted">Escrow status: {escrowStatus}</p>}
      <form className="form-grid" onSubmit={handleSubmit}>
        <textarea
          rows={5}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Describe the issue and evidence details"
          required
        />
        {message && <span className="muted">{message}</span>}
        <button type="submit" disabled={loading || escrowStatus !== EscrowStatus.Held}>
          {loading ? "Submitting..." : "Raise dispute"}
        </button>
      </form>
    </section>
  );
};

export default DisputeCreatePage;
