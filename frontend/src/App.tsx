import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TenantDashboard from "./pages/TenantDashboard";
import LandlordDashboard from "./pages/LandlordDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PropertiesPage from "./pages/PropertiesPage";
import CreatePropertyPage from "./pages/CreatePropertyPage";
import MyPropertiesPage from "./pages/MyPropertiesPage";
import AgreementCreatePage from "./pages/AgreementCreatePage";
import MyAgreementsPage from "./pages/MyAgreementsPage";
import LandlordAgreementsPage from "./pages/LandlordAgreementsPage";
import AgreementEvidencePage from "./pages/AgreementEvidencePage";
import DisputeCreatePage from "./pages/DisputeCreatePage";
import DisputeDetailPage from "./pages/DisputeDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

const App = () => {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            element={<ProtectedRoute allowedRoles={["tenant", "landlord", "admin"]} />}
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/agreements" element={<MyAgreementsPage />} />
            <Route path="/agreements/:id/evidence" element={<AgreementEvidencePage />} />
            <Route path="/disputes/:agreementId" element={<DisputeDetailPage />} />
            <Route path="/disputes/:agreementId/create" element={<DisputeCreatePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["tenant"]} />}>
            <Route path="/dashboard/tenant" element={<TenantDashboard />} />
            <Route path="/agreements/new" element={<AgreementCreatePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["landlord"]} />}>
            <Route path="/dashboard/landlord" element={<LandlordDashboard />} />
            <Route path="/properties/new" element={<CreatePropertyPage />} />
            <Route path="/properties/me" element={<MyPropertiesPage />} />
            <Route path="/agreements/pending" element={<LandlordAgreementsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
