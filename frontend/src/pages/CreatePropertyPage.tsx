import { FormEvent, useState } from "react";
import { createProperty } from "../services/propertyService";
import { useToast } from "../components/ui/ToastProvider";

const CreatePropertyPage = () => {
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [rent, setRent] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { push } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await createProperty({ title, address, rent, depositAmount });
      setMessage("Property created successfully.");
      push("Property created.", "success");
      setTitle("");
      setAddress("");
      setRent(0);
      setDepositAmount(0);
    } catch {
      setMessage("Failed to create property.");
      push("Failed to create property.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h1>Create property</h1>
      <form className="form-grid" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Rent"
          value={rent}
          onChange={(event) => setRent(Number(event.target.value))}
          min={0}
          required
        />
        <input
          type="number"
          placeholder="Deposit amount"
          value={depositAmount}
          onChange={(event) => setDepositAmount(Number(event.target.value))}
          min={0}
          required
        />
        {message && <span className="muted">{message}</span>}
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create property"}
        </button>
      </form>
    </section>
  );
};

export default CreatePropertyPage;
