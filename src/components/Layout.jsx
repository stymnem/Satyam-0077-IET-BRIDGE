import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
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

// Logo + Brand
function LogoIET({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 64 32" className="h-7 w-16" aria-hidden="true">
        <path
          d="M2 24 C 16 4, 48 4, 62 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line x1="14" y1="24" x2="14" y2="16" stroke="currentColor" strokeWidth="2" />
        <line x1="32" y1="24" x2="32" y2="12" stroke="currentColor" strokeWidth="2" />
        <line x1="50" y1="24" x2="50" y2="16" stroke="currentColor" strokeWidth="2" />
      </svg>
      <span className="font-black tracking-tight text-lg text-gray-900 dark:text-foreground">
        IET<span className="text-blue-600 dark:text-blue-400">BRIDGE</span>
      </span>
    </div>
  );
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
      { name: "Announcements", href: "/announcements", icon: Megaphone, key: "announcements" },
      { name: "Events", href: "/events", icon: Calendar, key: "events" },
      { name: "RSVPs", href: "/rsvps", icon: Users, key: "rsvps" },
      { name: "Jobs", href: "/jobs", icon: Briefcase, key: "jobs" },
      { name: "Messages", href: "/messages", icon: MessageCircle, key: "messages" },
      { name: "Education", href: "/education", icon: GraduationCap, key: "education" },
      { name: "Experience", href: "/professional-experience", icon: Briefcase, key: "experience" },
    ],
    []
  );

  // Role-based filter
  const navigation = useMemo(() => {
    const role = (user?.role || "").toLowerCase();
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
    return allNav;
  }, [user?.role, allNav]);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  // Handle navigation clicks
  const handleNavClick = (href, key) => {
    if (key === "messages") {
      // Navigate and force refresh
      window.location.href = href;
    } else {
      navigate(href);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r flex flex-col">
          <div className="p-4 flex flex-col items-start gap-2">
            <LogoIET className="h-7 w-auto" />
          </div>
          <nav className="mt-2 pb-4 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    handleNavClick(item.href, item.key);
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
          <div className="flex flex-col items-start gap-2 px-4 pt-5">
            <LogoIET className="h-7 w-auto" />
          </div>
          <nav className="mt-6 flex-1 px-2 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href, item.key)}
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
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-background border-b px-4 justify-between items-center">
          {/* Mobile menu button */}
          <button
            className="lg:hidden border rounded p-1"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          {/* Right section */}
          <div className="ml-auto flex items-center space-x-4">
            <Link
              to="/"
              className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              Contact
            </Link>
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {/* User info */}
            <div className="hidden sm:block text-sm text-right">
              <p className="font-medium leading-tight truncate max-w-[180px]">
                {user?.fullName}
              </p>
              <p className="text-muted-foreground leading-tight truncate max-w-[180px]">
                {user?.role}
              </p>
            </div>
            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout("/")}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
