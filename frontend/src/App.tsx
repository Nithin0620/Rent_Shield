import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import DashboardAgreements from "./pages/DashboardAgreements";
import DashboardProperties from "./pages/DashboardProperties";
import AgreementDetailPage from "./pages/AgreementDetailPage";
import AgreementEvidencePage from "./pages/AgreementEvidencePage";
import AgreementCreatePage from "./pages/AgreementCreatePage";
import AdminDashboard from "./pages/AdminDashboard";
import ViewAllAgreementsPage from "./pages/ViewAllAgreementsPage";
import PropertiesPage from "./pages/PropertiesPage";
import CreatePropertyPage from "./pages/CreatePropertyPage";
import EscrowStatusPage from "./pages/EscrowStatusPage";
import DisputesPage from "./pages/DisputesPage";
import DisputeDetailPage from "./pages/DisputeDetailPage";
import DisputeCreatePage from "./pages/DisputeCreatePage";
import EvidenceVaultPage from "./pages/EvidenceVaultPage";
import TrustScorePage from "./pages/TrustScorePage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes - Tenant/Landlord */}
      <Route element={<ProtectedRoute allowedRoles={["tenant", "landlord"]} />}>
        {/* Dashboard Layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="agreements" element={<DashboardAgreements />} />
          <Route element={<ProtectedRoute allowedRoles={["landlord"]} />}>
            <Route path="properties" element={<DashboardProperties />} />
          </Route>
        </Route>

        {/* Main Pages */}
        <Route path="/agreements" element={<ViewAllAgreementsPage />} />
        <Route path="/agreements/create" element={<AgreementCreatePage />} />
        <Route path="/agreements/:id" element={<AgreementDetailPage />} />
        <Route path="/agreements/:id/evidence" element={<AgreementEvidencePage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/create" element={<CreatePropertyPage />} />
        <Route path="/escrow" element={<EscrowStatusPage />} />
        <Route path="/disputes" element={<DisputesPage />} />
        <Route path="/disputes/:id" element={<DisputeDetailPage />} />
        <Route path="/disputes/:agreementId/create" element={<DisputeCreatePage />} />
        <Route path="/evidence" element={<EvidenceVaultPage />} />
        <Route path="/trust" element={<TrustScorePage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
