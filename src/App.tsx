import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/auth/Login"; // Sesuaikan path
import DashboardPasien from "@/pages/pasien/DashboardPasien";
import MonitoringMandiri from "@/pages/pasien/MonitoringMandiri";
import CatatanHarian from "@/pages/pasien/CatatanHarian";
import ProtectedRoute from "@/components/ProtectedRoute"; // Import Satpam
import ListObat from "./pages/pasien/ListObat";
import TipsHidup from "./pages/pasien/TipsHidup";

function App() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES (Bisa diakses siapa saja) --- */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Redirect root ke login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* --- AREA PASIEN (Hanya Role 'pasien') --- */}
      <Route element={<ProtectedRoute allowedRoles={['pasien']} />}>
          <Route path="/dashboard-pasien" element={<DashboardPasien />} />
          <Route path="/list-obat" element={<ListObat />} />
          <Route path="/monitoring-mandiri" element={<MonitoringMandiri />} />
          <Route path="/catatan-harian" element={<CatatanHarian />} />
          <Route path="/tips-hidup" element={<TipsHidup />} />
          {/* Route lain khusus pasien nanti ditaruh di sini */}
          {/* <Route path="/obat" element={<JadwalObat />} /> */}
      </Route>

      {/* --- AREA ADMIN (Hanya Role 'admin') --- */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
          <Route path="/admin/dashboard" element={<div>Dashboard Admin (Protected)</div>} />
      </Route>

      {/* --- CATCH ALL (404) --- */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;