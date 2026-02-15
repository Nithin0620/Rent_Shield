import { useEffect, useState } from "react";
import { RentalAgreement } from "../types/agreement";
import { getMyAgreements } from "../services/agreementService";

const TransactionHistoryPage = () => {
  const [agreements, setAgreements] = useState<RentalAgreement[]>([]);
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
          {agreements.map((item: RentalAgreement) => (
            <article key={item._id} className="card">
              <h3>{item.propertyId.title}</h3>
              <p className="muted">{item.propertyId.address}</p>
              {item.escrow ? (
                <div>
                  <p>Escrow Status: <strong>{item.escrow.status}</strong></p>
                  <p>Deposit Amount: ₹{item.escrow.depositAmount.toLocaleString()}</p>
                  <p>Escrow Fee: ₹{item.escrow.escrowFeeAmount.toLocaleString()}</p>
                  <p>Total Payable: ₹{item.escrow.totalPayableAmount.toLocaleString()}</p>
                  {item.escrow.paidDate && (
                    <p>Paid Date: {new Date(item.escrow.paidDate).toLocaleString()}</p>
                  )}
                  {item.escrow.releasedDate && (
                    <p>Released Date: {new Date(item.escrow.releasedDate).toLocaleString()}</p>
                  )}
                </div>
              ) : (
                <p className="muted">No escrow information.</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default TransactionHistoryPage;
