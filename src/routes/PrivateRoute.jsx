import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-4">Checking session…</p>;
  if (!user) return <Navigate to="/" replace />;
  return children;
}
