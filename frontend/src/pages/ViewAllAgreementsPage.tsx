import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import TrustScoreBadge from "../components/TrustScoreBadge";
import { RentalAgreement, EscrowStatus, AgreementStatus } from "../types/agreement";
import { getMyAgreements } from "../services/agreementService";
import { useToast } from "../components/ui/ToastProvider";
import useAuth from "../hooks/useAuth";

type FilterStatus = "all" | "pending" | "active" | "completed" | "disputed";
type FilterEscrow = "all" | "awaiting-payment" | "held" | "released" | "disputed";

const ViewAllAgreementsPage = () => {
  const [agreements, setAgreements] = useState<RentalAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterEscrow, setFilterEscrow] = useState<FilterEscrow>("all");
  const { push } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMyAgreements();
        setAgreements(data);
      } catch {
        push("Unable to load agreements", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [push]);

  const filteredAgreements = agreements.filter((item) => {
    // Search filter
    if (searchTerm && !item.propertyId.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filterStatus !== "all" && item.status !== filterStatus) {
      return false;
    }

    // Escrow filter
    if (filterEscrow !== "all" && item.escrow?.status !== filterEscrow) {
      return false;
    }

    return true;
  });

  const getCounterpartyName = (item: RentalAgreement): string => {
    if (user?.id === item.tenantId._id) {
      return item.landlordId.name;
    }
    return item.tenantId.name;
  };

  const getCounterpartyTrustScore = (item: RentalAgreement): number | undefined => {
    if (user?.id === item.tenantId._id) {
      return item.landlordId.trustScore;
    }
    return item.tenantId.trustScore;
  };

  const getStatusBadge = (status: string) => {
    const badgeMap: Record<string, { bg: string; text: string }> = {
      pending: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
      active: { bg: "bg-green-500/20", text: "text-green-400" },
      completed: { bg: "bg-blue-500/20", text: "text-blue-400" },
      disputed: { bg: "bg-red-500/20", text: "text-red-400" },
    };
    const style = badgeMap[status] || { bg: "bg-slate-500/20", text: "text-slate-400" };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${style.bg} ${style.text}`}>
        {status}
      </span>
    );
  };

  const getEscrowStatusBadge = (status: string) => {
    const badgeMap: Record<string, { bg: string; text: string; label: string }> = {
      "awaiting-payment": { bg: "bg-gray-500/20", text: "text-gray-400", label: "AWAITING PAYMENT" },
      "held": { bg: "bg-blue-500/20", text: "text-blue-400", label: "HELD" },
      "released": { bg: "bg-green-500/20", text: "text-green-400", label: "RELEASED" },
      "disputed": { bg: "bg-red-500/20", text: "text-red-400", label: "DISPUTED" },
    };
    const style = badgeMap[status] || badgeMap["awaiting-payment"];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight-900 p-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-900 p-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Agreements</h1>
          <p className="text-slate-400">Manage and track all your rental agreements</p>
        </div>

        {/* Filters Section */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
            <input
              type="text"
              placeholder="Property title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Agreement Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Escrow Status</label>
            <select
              value={filterEscrow}
              onChange={(e) => setFilterEscrow(e.target.value as FilterEscrow)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-500"
            >
              <option value="all">All</option>
              <option value="awaiting-payment">Awaiting Payment</option>
              <option value="held">Held</option>
              <option value="released">Released</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Count</label>
            <div className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white font-semibold">
              {filteredAgreements.length} Agreement{filteredAgreements.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Agreements Grid */}
        {filteredAgreements.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-slate-400 mb-4">No agreements match your filters.</p>
            {searchTerm || filterStatus !== "all" || filterEscrow !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterEscrow("all");
                }}
                className="rounded-lg bg-neon-500 px-4 py-2 text-sm font-semibold text-midnight-900 hover:bg-neon-400"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/properties"
                className="inline-block rounded-lg bg-neon-500 px-4 py-2 text-sm font-semibold text-midnight-900 hover:bg-neon-400"
              >
                Browse Properties
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAgreements.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition p-5"
              >
                <div className="grid gap-4 md:grid-cols-5 items-start mb-4">
                  {/* Property Info */}
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Property</p>
                    <p className="text-white font-semibold">{item.propertyId.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.propertyId.address}</p>
                  </div>

                  {/* Counterparty */}
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                      {user?.id === item.tenantId._id ? "Landlord" : "Tenant"}
                    </p>
                    <p className="text-white font-semibold">{getCounterpartyName(item)}</p>
                    {getCounterpartyTrustScore(item) !== undefined && (
                      <TrustScoreBadge score={getCounterpartyTrustScore(item)!} size="sm" />
                    )}
                  </div>

                  {/* Status Badges */}
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Status</p>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(item.status)}
                      {item.escrow && getEscrowStatusBadge(item.escrow.status)}
                    </div>
                  </div>

                  {/* Amounts */}
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Amounts</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-white">Deposit: <span className="font-semibold">₹{item.escrow?.depositAmount?.toLocaleString() || "N/A"}</span></p>
                      <p className="text-white">Rent: <span className="font-semibold">₹{item.propertyId.monthlyRent?.toLocaleString() || "N/A"}</span></p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Period</p>
                    <p className="text-white text-sm">
                      {new Date(item.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-white text-sm">
                      {new Date(item.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                  <Link
                    to={`/agreements/${item._id}`}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 transition"
                  >
                    View Details
                  </Link>

                  {item.escrow?.status === EscrowStatus.AwaitingPayment && user?.id === item.tenantId._id && (
                    <button
                      className="rounded-lg bg-neon-500 px-3 py-2 text-sm font-semibold text-midnight-900 hover:bg-neon-400 transition"
                    >
                      💳 Pay Deposit
                    </button>
                  )}

                  {item.status === "pending" && user?.id === item.landlordId._id && (
                    <>
                      <button className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 transition">
                        ✓ Approve
                      </button>
                      <button className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 transition">
                        ✗ Reject
                      </button>
                    </>
                  )}

                  {item.escrow?.status === "held" && (
                    <button className="rounded-lg border border-blue-500/30 px-3 py-2 text-sm font-medium text-blue-400 hover:bg-blue-950/20 transition">
                      Request Release
                    </button>
                  )}

                  {item.escrow?.status === "disputed" && (
                    <Link
                      to={`/disputes/${item._id}`}
                      className="rounded-lg border border-red-500/30 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-950/20 transition"
                    >
                      View Dispute
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllAgreementsPage;
