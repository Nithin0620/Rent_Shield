import { FormEvent, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createAgreement } from "../services/agreementService";
import { getPropertyById } from "../services/propertyService";
import { useToast } from "../components/ui/ToastProvider";
import { Property } from "../types/property";

const AgreementCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { push } = useToast();

  const propertyId = searchParams.get("propertyId");
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    tenantSignature: "",
    agreedToTerms: false
  });

  useEffect(() => {
    if (!propertyId) {
      setFetchError("No property selected");
      return;
    }

    const fetchProperty = async () => {
      try {
        const prop = await getPropertyById(propertyId);
        setProperty(prop);
      } catch (error) {
        setFetchError("Failed to load property details");
        console.error(error);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const calculateDuration = () => {
    if (!form.startDate || !form.endDate) return 0;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return months;
  };

  const duration = calculateDuration();
  const escrowFeePercentage = 1.5;
  const escrowFeeAmount = property ? (property.securityDeposit * escrowFeePercentage) / 100 : 0;
  const totalPayable = property ? property.securityDeposit + escrowFeeAmount : 0;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!property) {
      push("Property not loaded", "error");
      return;
    }

    if (!form.tenantSignature.trim()) {
      push("Please provide your digital signature", "error");
      return;
    }

    if (!form.agreedToTerms) {
      push("You must agree to the terms", "error");
      return;
    }

    setLoading(true);

    try {
      const agreement = await createAgreement({
        propertyId: property._id,
        startDate: form.startDate,
        endDate: form.endDate,
        tenantSignature: form.tenantSignature
      });

      push("Agreement created successfully. Awaiting landlord approval.", "success");
      navigate(`/agreements/${agreement._id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create agreement.";
      push(message, "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchError) {
    return (
      <div className="min-h-screen bg-midnight-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{fetchError}</h1>
          <button
            onClick={() => navigate("/browse-properties")}
            className="px-8 py-3 bg-neon-500 text-midnight-900 font-semibold rounded-full hover:bg-neon-600"
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-midnight-900 p-6 flex items-center justify-center">
        <div className="text-white">Loading property details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Create Rental Agreement</h1>
        <p className="text-slate-300 mb-8">Fill in the agreement details to proceed. Escrow will be held neutrally by RentShield.</p>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
          {/* SECTION 1: Property Summary */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6 pb-3 border-b border-white/20">
              Property Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-lg">
              <div>
                <p className="text-slate-400 text-sm">Property Title</p>
                <p className="text-white text-lg font-semibold">{property.title}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Property Type</p>
                <p className="text-white text-lg font-semibold capitalize">{property.propertyType}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Location</p>
                <p className="text-white text-lg font-semibold">
                  {property.city}, {property.state}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Furnishing</p>
                <p className="text-white text-lg font-semibold capitalize">{property.furnishingType}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Landlord</p>
                <p className="text-white text-lg font-semibold">
                  {typeof property.landlordId === "string"
                    ? property.landlordId
                    : property.landlordId.name}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Trust Score</p>
                <p className="text-neon-400 text-lg font-semibold">
                  {typeof property.landlordId === "string" ? "N/A" : property.landlordId.trustScore || "100"}/100
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: Agreement Terms */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6 pb-3 border-b border-white/20">
              Agreement Terms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">Move-In Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Move-Out Date (Lease End)</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white"
                  required
                />
              </div>
            </div>

            {form.startDate && form.endDate && (
              <div className="mt-4 p-4 bg-white/10 rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Lease Duration</p>
                    <p className="text-neon-400 font-semibold text-lg">{duration} months</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Lock-In Period</p>
                    <p className="text-neon-400 font-semibold text-lg">{property.lockInPeriod} months</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Notice Period</p>
                    <p className="text-neon-400 font-semibold text-lg">{property.noticePeriod} days</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Deposit & Escrow */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6 pb-3 border-b border-white/20">
              Deposit & Escrow Breakdown
            </h2>
            <div className="space-y-3 bg-white/5 p-6 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-white">Security Deposit</span>
                <span className="text-neon-400 font-semibold">₹{property.securityDeposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white">RentShield Escrow Fee ({escrowFeePercentage}%)</span>
                <span className="text-neon-400 font-semibold">₹{escrowFeeAmount.toFixed(0)}</span>
              </div>
              <div className="h-px bg-white/20"></div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-white font-semibold">Total Payable (by tenant)</span>
                <span className="text-neon-500 font-semibold">₹{totalPayable.toFixed(0)}</span>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                ℹ️ Funds are held neutrally by RentShield. Neither party can access them unilaterally. Release happens via predefined rules or dispute verdict.
              </p>
            </div>
          </div>

          {/* SECTION 4: Rules & Restrictions */}
          {(property.petsAllowed ||
            property.smokingAllowed ||
            property.paintingDeductionClause ||
            property.damageDefinitionNote ||
            property.regionSpecificClause) && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6 pb-3 border-b border-white/20">
                Property Rules & Clauses
              </h2>
              <div className="space-y-4 bg-white/5 p-6 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.petsAllowed && (
                    <div className="p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                      <p className="text-emerald-400 font-semibold text-sm">✓ Pets Allowed</p>
                    </div>
                  )}
                  {property.smokingAllowed && (
                    <div className="p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                      <p className="text-emerald-400 font-semibold text-sm">✓ Smoking Allowed</p>
                    </div>
                  )}
                  {property.paintingDeductionClause && (
                    <div className="p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
                      <p className="text-orange-400 font-semibold text-sm">⚠️ Painting Deduction Applies</p>
                    </div>
                  )}
                </div>

                {property.damageDefinitionNote && (
                  <div>
                    <p className="text-slate-400 text-sm font-semibold mb-2">Damage Definition</p>
                    <p className="text-slate-300 text-sm bg-white/5 p-3 rounded-lg">{property.damageDefinitionNote}</p>
                  </div>
                )}

                {property.regionSpecificClause && (
                  <div>
                    <p className="text-slate-400 text-sm font-semibold mb-2">Region-Specific Clause</p>
                    <p className="text-slate-300 text-sm bg-white/5 p-3 rounded-lg">{property.regionSpecificClause}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 5: Exit Checklist */}
          {property.defaultChecklistItems.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6 pb-3 border-b border-white/20">
                Exit Checklist (Pre-Agreed Conditions)
              </h2>
              <div className="space-y-2 bg-white/5 p-6 rounded-lg">
                <p className="text-slate-300 text-sm mb-4">
                  These conditions will be verified at move-out to prevent surprise deductions:
                </p>
                {property.defaultChecklistItems.map((item, idx) => (
                  <div key={idx} className="flex items-center text-slate-300 text-sm">
                    <div className="w-5 h-5 rounded border border-neon-500 mr-3 flex items-center justify-center">
                      <span className="text-neon-500 text-xs">✓</span>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: Digital Signature & Agreement */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6 pb-3 border-b border-white/20">
              Digital Signature & Declaration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Your Full Name (Digital Signature)</label>
                <input
                  type="text"
                  placeholder="Type your full name"
                  value={form.tenantSignature}
                  onChange={(e) => setForm({ ...form, tenantSignature: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400"
                  required
                />
                <p className="text-xs text-slate-400 mt-2">
                  This serves as your digital signature confirming your acceptance of the agreement terms.
                </p>
              </div>

              <label className="flex items-start text-white cursor-pointer mt-6">
                <input
                  type="checkbox"
                  checked={form.agreedToTerms}
                  onChange={(e) => setForm({ ...form, agreedToTerms: e.target.checked })}
                  className="w-5 h-5 rounded mt-1"
                  required
                />
                <span className="ml-3 text-sm">
                  I confirm that I have read and agree to all the agreement terms, including:
                  <ul className="ml-4 mt-2 space-y-1 text-xs text-slate-300">
                    <li>• Monthly rent of ₹{property.monthlyRent.toLocaleString()}</li>
                    <li>• Security deposit of ₹{property.securityDeposit.toLocaleString()}</li>
                    <li>• Escrow fee of ₹{escrowFeeAmount.toFixed(0)}</li>
                    <li>• Lock-in period of {property.lockInPeriod} months</li>
                    <li>• Notice period of {property.noticePeriod} days</li>
                    <li>• All property rules and clauses stated above</li>
                    <li>• Exit checklist items and conditions</li>
                  </ul>
                </span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-white/10">
            <button
              type="submit"
              disabled={loading || !form.agreedToTerms || !form.tenantSignature.trim()}
              className="flex-1 py-4 bg-neon-500 text-midnight-900 font-semibold rounded-full hover:bg-neon-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Creating Agreement..." : "Create & Sign Agreement"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-4 border border-white/20 text-white font-semibold rounded-full hover:bg-white/10 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgreementCreatePage;
