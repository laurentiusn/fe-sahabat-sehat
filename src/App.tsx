import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/auth/Login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      
      {/* Nanti tambah halaman Dashboard Admin di sini */}
      {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
    </Routes>
  );
}

export default App;