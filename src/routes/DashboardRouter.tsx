import { useAuth } from "@/context/AuthContext";
import AdminDashboard from "@/pages/AdminDashboard";
import AlumniDashboard from "@/pages/AlumniDashboard";

export default function DashboardRouter() {
  const { user } = useAuth();
  return user?.role === "Admin" ? <AdminDashboard /> : <AlumniDashboard />;
}
