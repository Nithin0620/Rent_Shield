import { Link } from "react-router-dom";
import { RentalAgreement, EscrowStatus } from "../types/agreement";
import useAuth from "../hooks/useAuth";

const DisputeQuickAction = ({ agreement }: { agreement: RentalAgreement }) => {
  const { user } = useAuth();
  const canRaise =
    (user?.role === "tenant" || user?.role === "landlord") &&
    agreement.escrow?.status === EscrowStatus.Held;

  if (!canRaise) return null;

  return <Link to={`/disputes/${agreement._id}/create`}>Raise dispute</Link>;
};

export default DisputeQuickAction;
