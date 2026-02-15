import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProperty } from "../services/propertyService";
import { useToast } from "../components/ui/ToastProvider";

const CreatePropertyPage = () => {
  const navigate = useNavigate();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    propertyType: "flat" as "flat" | "pg" | "independent-house" | "co-living",
    furnishingType: "semi-furnished" as "furnished" | "semi-furnished" | "unfurnished",
    monthlyRent: 0,
    securityDeposit: 0,
    maintenanceCharges: 0,
    lockInPeriod: 12,
    noticePeriod: 30,
    petsAllowed: false,
    smokingAllowed: false,
    paintingDeductionClause: false,
    cleaningCharges: 0,
    defaultChecklistItems: [
      "Property cleaned thoroughly",
      "Walls painted/damage repaired",
      "All fixtures and fittings working",
      "Keys and documents returned"
    ],
    damageDefinitionNote: "",
    regionSpecificClause: ""
  });

  const [checklistInput, setChecklistInput] = useState("");

  const addChecklistItem = () => {
    if (checklistInput.trim()) {
      setForm({
        ...form,
        defaultChecklistItems: [...form.defaultChecklistItems, checklistInput]
      });
      setChecklistInput("");
    }
  };

  const removeChecklistItem = (index: number) => {
    setForm({
      ...form,
      defaultChecklistItems: form.defaultChecklistItems.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await createProperty(form);
      push("Property created successfully.", "success");
      navigate("/dashboard-properties");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create property.";
      push(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Add New Property</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8"
        >
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-white/20">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Property Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400"
                required
              />
              <input
                type="text"
                placeholder="Full Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400"
                required
              />
              <input
                type="text"
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400"
                required
              />
              <input
                type="text"
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400"
                required
              />
              <input
                type="text"
                placeholder="Pincode"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400"
                required
              />

              <select
                value={form.propertyType}
                onChange={(e) => setForm({ ...form, propertyType: e.target.value as any })}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white appearance-none cursor-pointer"
              >
                <option value="flat">Flat</option>
                <option value="pg">PG</option>
                <option value="independent-house">Independent House</option>
                <option value="co-living">Co-living</option>
              </select>

              <select
                value={form.furnishingType}
                onChange={(e) => setForm({ ...form, furnishingType: e.target.value as any })}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white appearance-none cursor-pointer"
              >
                <option value="furnished">Furnished</option>
                <option value="semi-furnished">Semi-furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>
          </div>

          {/* Financial Details */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-white/20">
              Financial Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="Monthly Rent"
                value={form.monthlyRent}
                onChange={(e) => setForm({ ...form, monthlyRent: Number(e.target.value) })}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400"
                min="0"
                required
              />
              <input
                type="number"
                placeholder="Security Deposit"
                value={form.securityDeposit}
                onChange={(e) => setForm({ ...form, securityDeposit: Number(e.target.value) })}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400"
                min="0"
                required
              />
              <input
                type="number"
                placeholder="Maintenance Charges"
                value={form.maintenanceCharges}
                onChange={(e) => setForm({ ...form, maintenanceCharges: Number(e.target.value) })}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400"
                min="0"
              />
              <input
                type="number"
                placeholder="Lock-in Period (months)"
                value={form.lockInPeriod}
                onChange={(e) => setForm({ ...form, lockInPeriod: Number(e.target.value) })}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400"
                min="0"
                required
              />
              <input
                type="number"
                placeholder="Notice Period (days)"
                value={form.noticePeriod}
                onChange={(e) => setForm({ ...form, noticePeriod: Number(e.target.value) })}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400"
                min="0"
                required
              />
              <input
                type="number"
                placeholder="Cleaning Charges"
                value={form.cleaningCharges}
                onChange={(e) => setForm({ ...form, cleaningCharges: Number(e.target.value) })}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400"
                min="0"
              />
            </div>
          </div>

          {/* Property Rules */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-white/20">
              Property Rules
            </h2>
            <div className="space-y-3">
              <label className="flex items-center text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.petsAllowed}
                  onChange={(e) => setForm({ ...form, petsAllowed: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span className="ml-3">Pets Allowed</span>
              </label>
              <label className="flex items-center text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.smokingAllowed}
                  onChange={(e) => setForm({ ...form, smokingAllowed: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span className="ml-3">Smoking Allowed</span>
              </label>
              <label className="flex items-center text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.paintingDeductionClause}
                  onChange={(e) => setForm({ ...form, paintingDeductionClause: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span className="ml-3">Painting Deduction Clause</span>
              </label>
            </div>
          </div>

          {/* Damage Definition & Region Clause */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-white/20">
              Agreement Notes
            </h2>
            <div className="space-y-4">
              <textarea
                placeholder="Damage Definition Note (e.g., minor wear and tear covered by deposit)"
                value={form.damageDefinitionNote}
                onChange={(e) => setForm({ ...form, damageDefinitionNote: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400"
                rows={3}
              />
              <textarea
                placeholder="Region-Specific Clause (e.g., tenant responsibility for local taxes)"
                value={form.regionSpecificClause}
                onChange={(e) => setForm({ ...form, regionSpecificClause: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400"
                rows={3}
              />
            </div>
          </div>

          {/* Checklist */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-white/20">
              Default Exit Checklist
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add checklist item"
                  value={checklistInput}
                  onChange={(e) => setChecklistInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addChecklistItem())}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="px-6 py-3 bg-neon-500 text-midnight-900 font-semibold rounded-xl hover:bg-neon-600"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {form.defaultChecklistItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                    <span className="text-white">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(idx)}
                      className="text-red-400 hover:text-red-300 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6 border-t border-white/10">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-neon-500 text-midnight-900 font-semibold rounded-full hover:bg-neon-600 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Property"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 border border-white/20 text-white font-semibold rounded-full hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePropertyPage;
