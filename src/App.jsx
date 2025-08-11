// src/App.jsx
import React, { Suspense } from "react";
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

// Public pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Unauthorized from "@/pages/Unauthorized";

// Protected pages
import MyRsvps from "@/pages/MyRsvps";
import Profile from "@/pages/Profile";
import Education from "@/pages/Education";
import ProfessionalExperience from "@/pages/ProfessionalExperience";
import Events from "@/pages/Events";
import Jobs from "@/pages/Jobs";
import Messages from "@/pages/Messages";

// lazy Announcements if you want; or import directly
const Announcements = React.lazy(() => import("@/pages/Announcements"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p className="p-4">Loading…</p>}>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <Toaster position="top-right" richColors />
              <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Protected */}
                <Route element={<PrivateOutlet />}>
                  <Route element={<LayoutOutlet />}>
                    {/* Removed the index redirect so / stays public Home */}
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

                    {/* Keep RSVPs and Announcements INSIDE the layout */}
                    <Route path="rsvps" element={<MyRsvps />} />
                    <Route path="announcements" element={<Announcements />} />
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </Suspense>
    </QueryClientProvider>
  );
}
