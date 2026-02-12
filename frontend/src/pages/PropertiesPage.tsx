import { useEffect, useState } from "react";
import { getAllProperties } from "../services/propertyService";
import { Property } from "../types/property";

const PropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllProperties();
        setProperties(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <section className="card">
      <h1>All properties</h1>
      {loading ? (
        <p className="muted">Loading properties...</p>
      ) : (
        <div className="list">
          {properties.map((property) => (
            <article key={property._id} className="card">
              <h3>{property.title}</h3>
              <p className="muted">{property.address}</p>
              <p>Rent: ${property.rent}</p>
              <p>Deposit: ${property.depositAmount}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default PropertiesPage;
