import { FormEvent, useState } from "react";
import { createAgreement } from "../services/agreementService";
import { useToast } from "./ui/ToastProvider";

interface CreateAgreementModalProps {
  propertyId: string;
  propertyTitle: string;
  rent: number;
  deposit: number;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAgreementModal = ({
  propertyId,
  propertyTitle,
  rent,
  deposit,
  onClose,
  onSuccess
}: CreateAgreementModalProps) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tenantSignature, setTenantSignature] = useState("");
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      push("Please select both start and end dates", "error");
      return;
    }
    if (!tenantSignature.trim()) {
      push("Please enter your full name", "error");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      push("End date must be after start date", "error");
      return;
    }

    setLoading(true);
    try {
      await createAgreement({ propertyId, startDate, endDate, tenantSignature });
      push("Agreement created successfully!", "success");
      onSuccess();
      onClose();
    } catch (error) {
      push("Failed to create agreement", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-3xl border border-white/10 bg-midnight-900 p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-white">Create Agreement</h2>
          <p className="text-sm text-slate-400 mt-1">{propertyTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Property Details */}
          <div className="rounded-2xl border border-white/10 p-3 bg-white/5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Monthly Rent</span>
              <span className="text-white font-semibold">₹{rent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Security Deposit</span>
              <span className="text-white font-semibold">₹{deposit.toLocaleString()}</span>
            </div>
          </div>

          {/* Dates */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full rounded-lg bg-midnight-900 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full rounded-lg bg-midnight-900 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-500"
            />
          </div>

          {/* Tenant Signature */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Your Full Name</label>
            <input
              type="text"
              value={tenantSignature}
              onChange={(e) => setTenantSignature(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full rounded-lg bg-midnight-900 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-neon-500 px-4 py-2 text-sm font-semibold text-midnight-900 hover:bg-neon-400 disabled:opacity-60 transition"
            >
              {loading ? "Creating..." : "Create Agreement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAgreementModal;
