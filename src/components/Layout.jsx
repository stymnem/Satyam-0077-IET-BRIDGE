import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Button } from "../components/ui/button";
import {
  LogOut,
  User,
  Home,
  Calendar,
  Briefcase,
  MessageCircle,
  GraduationCap,
  Moon,
  Sun,
  Menu,
  Users,
  Megaphone,
} from "lucide-react";
import { useMemo, useState } from "react";

function initials(name = "") {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "U";
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Full catalog
  const allNav = useMemo(
    () => [
      { name: "Dashboard", href: "/dashboard", icon: Home, key: "dashboard" },
      { name: "Profile", href: "/profile", icon: User, key: "profile" },
      {
        name: "Announcements",
        href: "/announcements",
        icon: Megaphone,
        key: "announcements",
      },
      { name: "Events", href: "/events", icon: Calendar, key: "events" },
      { name: "RSVPs", href: "/rsvps", icon: Users, key: "rsvps" },
      { name: "Jobs", href: "/jobs", icon: Briefcase, key: "jobs" },
      {
        name: "Messages",
        href: "/messages",
        icon: MessageCircle,
        key: "messages",
      },
      {
        name: "Education",
        href: "/education",
        icon: GraduationCap,
        key: "education",
      },
      {
        name: "Experience",
        href: "/professional-experience",
        icon: Briefcase,
        key: "experience",
      },
    ],
    []
  );

  // Role-based filter
  const navigation = useMemo(() => {
    const role = (user?.role || "").toLowerCase(); // "admin" | "alumni" | ...
    if (role === "admin") {
      const allow = new Set([
        "dashboard",
        "announcements",
        "events",
        "rsvps",
        "jobs",
        "messages",
      ]);
      return allNav.filter((i) => allow.has(i.key));
    }
    // Alumni (or others) get everything
    return allNav;
  }, [user?.role, allNav]);

  // Active matcher (exact or parent)
  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const avatar = initials(user?.fullName);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div
        className={`lg:hidden fixed inset-0 z-50 ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-black/20"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
        <div className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r flex flex-col">
          <div className="p-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center text-sm">
              {avatar}
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">
                IETBRIGE Portal
              </h1>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
          </div>
          <nav className="mt-2 pb-4 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-card border-r">
          <div className="flex items-center gap-3 px-4 pt-5">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center text-sm font-semibold">
              {avatar}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight truncate">
                IETBRIGE Portal
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {user?.role}
              </p>
            </div>
          </div>

          <nav className="mt-6 flex-1 px-2 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-background border-b">
          <button
            className="px-4 border-r lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {/* Placeholder for breadcrumbs/search if you add later */}
            </div>

            <div className="ml-4 flex items-center md:ml-6 space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              <div className="hidden sm:block text-sm text-right">
                <p className="font-medium leading-tight truncate max-w-[180px]">
                  {user?.fullName}
                </p>
                <p className="text-muted-foreground leading-tight truncate max-w-[180px]">
                  {user?.role}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
