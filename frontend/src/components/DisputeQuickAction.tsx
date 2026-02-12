import { Link } from "react-router-dom";
import { AgreementWithEscrow, EscrowStatus } from "../types/agreement";
import useAuth from "../hooks/useAuth";

const DisputeQuickAction = ({ agreement }: { agreement: AgreementWithEscrow }) => {
  const { user } = useAuth();
  const canRaise =
    (user?.role === "tenant" || user?.role === "landlord") &&
    agreement.escrow?.escrowStatus === EscrowStatus.ReleaseRequested;

  if (!canRaise) return null;

  return <Link to={`/disputes/${agreement.agreement._id}/create`}>Raise dispute</Link>;
};

export default DisputeQuickAction;
