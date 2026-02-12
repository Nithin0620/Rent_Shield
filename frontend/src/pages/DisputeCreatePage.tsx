import { FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createDispute } from "../services/disputeService";

const DisputeCreatePage = () => {
  const { agreementId } = useParams();
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!agreementId) return;
    setLoading(true);
    setMessage(null);

    try {
      await createDispute(agreementId, reason);
      navigate(`/disputes/${agreementId}`);
    } catch {
      setMessage("Unable to raise dispute.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h1>Raise dispute</h1>
      <p className="muted">Provide a clear reason for the dispute.</p>
      <form className="form-grid" onSubmit={handleSubmit}>
        <textarea
          rows={5}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Describe the issue and evidence details"
          required
        />
        {message && <span className="muted">{message}</span>}
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Raise dispute"}
        </button>
      </form>
    </section>
  );
};

export default DisputeCreatePage;
