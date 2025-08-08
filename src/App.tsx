import React, { Suspense } from "react"; // 🆕 import React (for Suspense)
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import PrivateRoute from "@/routes/PrivateRoute";
import DashboardRouter from "@/routes/DashboardRouter";
import MyRsvps from "@/pages/MyRsvps";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import Education from "@/pages/Education";
import ProfessionalExperience from "@/pages/ProfessionalExperience";
import Events from "@/pages/Events";
import Jobs from "@/pages/Jobs";
import Messages from "@/pages/Messages";
import Unauthorized from "@/pages/Unauthorized";

/* ------------------------------------------------------------------ */
/* React-Query setup                                                  */
/* ------------------------------------------------------------------ */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/* ------------------------------------------------------------------ */
/* Small wrappers to expose an <Outlet /> for nested routes           */
/* ------------------------------------------------------------------ */
function PrivateOutlet() {
  return (
    <PrivateRoute>
      <Outlet />
    </PrivateRoute>
  );
}

function LayoutOutlet() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                */
/* ------------------------------------------------------------------ */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p className="p-4">Loading…</p>}>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <Toaster position="top-right" richColors />

              <Routes>
                {/* ---------- Public ---------- */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* ---------- Protected ---------- */}
                <Route element={<PrivateOutlet />}>
                  <Route element={<LayoutOutlet />}>
                    <Route
                      index
                      element={<Navigate to="dashboard" replace />}
                    />
                    <Route path="dashboard" element={<DashboardRouter />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="education" element={<Education />} />
                    <Route
                      path="professional-experience"
                      element={<ProfessionalExperience />}
                    />
                    <Route path="events" element={<Events />} />
                    <Route path="jobs" element={<Jobs />} />
                    <Route path="messages" element={<Messages />} />
                  </Route>
                  <Route path="rsvps" element={<MyRsvps />} />
                </Route>

                {/* ---------- Fallback ---------- */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </Suspense>
    </QueryClientProvider>
  );
}
