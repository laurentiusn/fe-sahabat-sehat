import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[]; // Role apa saja yang boleh masuk (misal: ['admin'])
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 1. Cek Login: Kalau tidak ada token, lempar ke Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Cek Role: Kalau role tidak sesuai, lempar ke halaman Unauthorized atau Login
  // (Di sini kita lempar ke login aja biar simpel)
  if (role && !allowedRoles.includes(role)) {
    // Opsional: Bisa buat halaman khusus <Unauthorized />
    return <Navigate to="/login" replace />; 
  }

  // 3. Lolos: Tampilkan halaman yang diminta (Outlet)
  return <Outlet />;
}