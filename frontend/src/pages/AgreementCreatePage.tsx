import { FormEvent, useEffect, useState } from "react";
import { getAllProperties } from "../services/propertyService";
import { createAgreement } from "../services/agreementService";
import { Property } from "../types/property";
import { useToast } from "../components/ui/ToastProvider";

const AgreementCreatePage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { push } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllProperties();
        setProperties(data);
      } catch {
        setMessage("Unable to load properties.");
        push("Unable to load properties.", "error");
      }
    };

    load();
  }, [push]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await createAgreement({ propertyId, startDate, endDate });
      setMessage("Agreement created and pending landlord approval.");
      push("Agreement created.", "success");
      setPropertyId("");
      setStartDate("");
      setEndDate("");
    } catch {
      setMessage("Failed to create agreement.");
      push("Failed to create agreement.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h1>Create agreement</h1>
      <p className="muted">Select a property and rental dates.</p>
      <form className="form-grid" onSubmit={handleSubmit}>
        <select value={propertyId} onChange={(event) => setPropertyId(event.target.value)} required>
          <option value="">Select property</option>
          {properties.map((property) => (
            <option key={property._id} value={property._id}>
              {property.title} - {property.address}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          required
        />
        <input
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          required
        />
        {message && <span className="muted">{message}</span>}
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Create agreement"}
        </button>
      </form>
    </section>
  );
};

export default AgreementCreatePage;
