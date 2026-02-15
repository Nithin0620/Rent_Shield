import { useEffect, useState } from "react";
import Skeleton from "../components/ui/Skeleton";
import useAuth from "../hooks/useAuth";
import { useToast } from "../components/ui/ToastProvider";
import { createProperty, getMyProperties } from "../services/propertyService";
import { Property } from "../types/property";

const DashboardProperties = () => {
  const { user } = useAuth();
  const { push } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: "", address: "", rent: "", deposit: "" });

  if (user?.role !== "landlord") {
    return <p className="text-slate-300">This section is available to landlords only.</p>;
  }

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyProperties();
        setProperties(data);
      } catch {
        push("Unable to load properties.", "error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [push]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const property = await createProperty({
        title: form.title,
        address: form.address,
        rent: Number(form.rent),
        depositAmount: Number(form.deposit)
      });
      setProperties((prev) => [...prev, property]);
      setForm({ title: "", address: "", rent: "", deposit: "" });
      setIsOpen(false);
      push("Property added.", "success");
    } catch {
      push("Failed to add property.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Properties</h2>
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-neon-500 px-4 py-2 text-sm font-semibold text-midnight-900"
        >
          Add Property
        </button>
      </div>

      {loading ? (
        <Skeleton className="h-24" />
      ) : !properties.length ? (
        <p className="text-slate-300">No properties yet.</p>
      ) : (
        <div className="grid gap-4">
          {properties.map((property) => (
            <div key={property._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold text-white">{property.title}</h3>
              <p className="text-sm text-slate-300">{property.address}</p>
              <p className="mt-2 text-sm text-slate-300">Rent: ₹{property.rent}</p>
              <p className="text-sm text-slate-300">Deposit: ₹{property.depositAmount}</p>
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-midnight-900 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white">Add Property</h3>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-400"
                placeholder="Title"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-400"
                placeholder="Address"
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
              />
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-400"
                placeholder="Rent"
                value={form.rent}
                onChange={(event) => setForm({ ...form, rent: event.target.value })}
              />
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-400"
                placeholder="Deposit"
                value={form.deposit}
                onChange={(event) => setForm({ ...form, deposit: event.target.value })}
              />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="rounded-full bg-neon-500 px-4 py-2 text-sm font-semibold text-midnight-900 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardProperties;
