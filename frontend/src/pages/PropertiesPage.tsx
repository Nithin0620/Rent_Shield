import { useEffect, useState } from "react";
import { getAllProperties } from "../services/propertyService";
import { Property } from "../types/property";
import useAuth from "../hooks/useAuth";
import CreateAgreementModal from "../components/CreateAgreementModal";
import Spinner from "../components/ui/Spinner";

const PropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { user } = useAuth();

  const loadProperties = async () => {
    try {
      const data = await getAllProperties();
      setProperties(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleAgreementSuccess = () => {
    setSelectedProperty(null);
    loadProperties();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-6 text-slate-300">
        <Spinner />
        <span>Loading properties...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-900 p-6">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-3xl font-semibold text-white mb-2">Available Properties</h1>
        <p className="text-slate-400 mb-6">Browse and create rental agreements</p>

        {properties.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-slate-300">No properties available yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div
                key={property._id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/8 transition"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">{property.title}</h3>
                  <p className="text-sm text-slate-400">{property.address}</p>
                </div>

                <div className="space-y-2 mb-4 rounded-lg bg-midnight-900 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Rent</span>
                    <span className="text-white font-medium">₹{property.rent?.toLocaleString() || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Security Deposit</span>
                    <span className="text-white font-medium">₹{property.depositAmount?.toLocaleString() || "N/A"}</span>
                  </div>
                  {(property as any).description && (
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-slate-300 text-xs">{(property as any).description}</p>
                    </div>
                  )}
                </div>

                {user?.role === "tenant" && (
                  <button
                    onClick={() => setSelectedProperty(property)}
                    className="w-full rounded-lg bg-neon-500 px-4 py-2 text-sm font-semibold text-midnight-900 hover:bg-neon-400 transition"
                  >
                    Create Agreement
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProperty && (
        <CreateAgreementModal
          propertyId={selectedProperty._id}
          propertyTitle={selectedProperty.title}
          rent={selectedProperty.rent || 0}
          deposit={selectedProperty.depositAmount || 0}
          onClose={() => setSelectedProperty(null)}
          onSuccess={handleAgreementSuccess}
        />
      )}
    </div>
  );
};

export default PropertiesPage;
