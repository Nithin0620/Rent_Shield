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

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute allowedRoles={["tenant", "landlord"]} />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="agreements" element={<DashboardAgreements />} />
          <Route element={<ProtectedRoute allowedRoles={["landlord"]} />}>
            <Route path="properties" element={<DashboardProperties />} />
          </Route>
        </Route>
        <Route path="/agreements/:id" element={<AgreementDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
