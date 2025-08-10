import React from "react";
import { useAuth } from "@/context/AuthContext";
import AdminDashboard from "@/pages/AdminDashboard";
import AlumniDashboard from "@/pages/AlumniDashboard";

export default function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return <p className="p-4">Loading user…</p>;

  const role = String(user.role || "").toLowerCase();

  if (role === "admin") return <AdminDashboard />;
  if (role === "alumni") return <AlumniDashboard />;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Unknown role</h2>
      <pre className="mt-2 rounded bg-muted p-2">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}
