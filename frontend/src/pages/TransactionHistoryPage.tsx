import { useEffect, useState } from "react";
import { AgreementWithEscrow } from "../types/agreement";
import { getMyAgreements } from "../services/agreementService";

const TransactionHistoryPage = () => {
  const [agreements, setAgreements] = useState<AgreementWithEscrow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyAgreements();
        setAgreements(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <section className="card">
        <p className="muted">Loading transactions...</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h1>Transaction history</h1>
      {agreements.length === 0 ? (
        <p className="muted">No transactions yet.</p>
      ) : (
        <div className="list">
          {agreements.map(({ agreement, escrow }) => (
            <article key={agreement._id} className="card">
              <h3>{agreement.propertyId.title}</h3>
              <p className="muted">{agreement.propertyId.address}</p>
              {escrow?.transactionLogs?.length ? (
                <ul>
                  {escrow.transactionLogs.map((log, index) => (
                    <li key={`${log.event}-${index}`}>
                      <strong>{log.event}</strong> — {new Date(log.createdAt).toLocaleString()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No logs yet.</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default TransactionHistoryPage;
