import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ allowed, children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return allowed.includes(user.role) ? (
    children
  ) : (
    <Navigate to="/unauthorized" replace />
  );
}
