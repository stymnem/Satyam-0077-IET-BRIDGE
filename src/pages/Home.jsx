import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Rocket,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

/**
 * IETBRIDGE – Public Home page (Alumni System)
 * - Inline SVG logo
 * - Realtime light/dark theme toggle (localStorage)
 * - Alumni-focused copy
 * - Sign In -> /login, Sign Up -> /register
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <HeroBackdrop />
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge>Official IET Alumni Community</Badge>

            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight text-white drop-shadow">
              Reconnect. Mentor. Hire. Grow.
            </h1>
            <p className="mt-4 text-white/90 text-lg max-w-prose">
              IETBRIDGE is the home for IET Pune alumni and students to network,
              share opportunities, organise reunions, and give back through
              mentorship and hiring. Your bridge to people and possibilities.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl bg-white text-blue-700 font-semibold px-5 py-3 hover:bg-blue-50 transition"
              >
                Sign Up
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/40 text-white px-5 py-3 hover:bg-white/10 transition"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Quick highlights */}
          <div className="relative">
            <div className="rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20 shadow-2xl p-5">
              <div className="grid grid-cols-2 gap-4">
                <InfoPill
                  title="Alumni Directory"
                  subtitle="Find people, cohorts"
                />
                <InfoPill title="Mentorship" subtitle="Guide & get guidance" />
                <InfoPill
                  title="Jobs & Referrals"
                  subtitle="Open roles, help alumni"
                />
                <InfoPill title="Events & Reunions" subtitle="Stay connected" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="max-w-7xl mx-auto px-4 py-14 md:py-18">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="People-first networking"
            text="Search alumni by batch, program, city, or company and start meaningful conversations."
            cta={{ label: "Explore network", to: "/login" }}
          />
          <FeatureCard
            icon={<Rocket className="h-6 w-6" />}
            title="Career & opportunities"
            text="Share openings, get referrals, and support each other through interviews and transitions."
            cta={{ label: "See opportunities", to: "/login" }}
          />
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Mentor the next cohort"
            text="Offer time for resume reviews, AMAs, or mini-workshops and make a real impact."
            cta={{ label: "Become a mentor", to: "/register" }}
          />
        </div>
      </section>

      {/* KPI band */}
      <section className="bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <Stat kpi="10k+" label="Alumni & students" />
          <Stat kpi="100+" label="Annual openings shared" />
          <Stat kpi="50+" label="Mentors volunteering" />
          <Stat kpi="Across 20+" label="Countries represented" />
        </div>
      </section>

      {/* About/Why strip */}
      <section className="max-w-7xl mx-auto px-4 py-14 md:py-18 grid md:grid-cols-2 gap-10 items-center">
        <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold">Why IETBRIDGE</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Built by and for the IET community, the platform helps you stay
            close to people who uplift you— classmates, seniors, juniors and
            faculty—so giving and getting help becomes second nature.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/login"
              className="inline-flex items-center rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium"
            >
              Browse community
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center rounded-lg border px-4 py-2 font-medium"
            >
              Create account
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Bullet title="Batch & department filters" />
          <Bullet title="Private messaging with controls" />
          <Bullet title="Opt-in mentoring slots" />
          <Bullet title="City chapters & meetups" />
        </div>
      </section>

      {/* CTA */}
      <section className="relative">
        <GradientBand />
        <div className="max-w-7xl mx-auto px-4 py-14 md:py-20 text-center text-white">
          <h3 className="text-3xl font-bold">Ready to begin?</h3>
          <p className="mt-3 text-white/90 max-w-2xl mx-auto">
            Join the IET Pune alumni network—share opportunities, reconnect with
            friends, and mentor the next generation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link
              to="/register"
              className="rounded-xl bg-white text-indigo-700 font-semibold px-5 py-3 hover:bg-violet-50 transition"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-white/40 text-white px-5 py-3 hover:bg-white/10 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ---------- components ---------- */
function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useThemeToggle();
  return (
    <nav className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/60 dark:bg-black/40 border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 font-extrabold tracking-tight"
        >
          <LogoIET className="h-7 w-auto" />
          <span className="sr-only">IETBRIDGE</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink> {/* FIXED */}
          <Link
            to="/register"
            className="inline-flex items-center rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center rounded-lg border px-4 py-2 hover:bg-muted"
          >
            Sign In
          </Link>
          <ThemeSwitch onClick={toggle} theme={theme} />
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white/80 dark:bg-black/60 backdrop-blur">
          <div className="px-4 py-3 flex flex-col gap-3 text-sm font-medium">
            <Link to="/" onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link to="/about" onClick={() => setOpen(false)}>
              About
            </Link>
            <Link to="/contact" onClick={() => setOpen(false)}>
              Contact
            </Link>{" "}
            {/* FIXED */}
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="inline-flex items-center rounded-lg bg-blue-600 text-white px-4 py-2"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="inline-flex items-center rounded-lg border px-4 py-2"
            >
              Sign In
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                toggle();
              }}
              className="inline-flex items-center rounded-lg border px-4 py-2"
            >
              Toggle {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function ThemeSwitch({ onClick, theme }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-muted"
      title="Toggle theme"
    >
      {theme === "dark" ? "Light" : "Dark"} mode
    </button>
  );
}

function useThemeToggle() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, toggle };
}

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
        <line
          x1="14"
          y1="24"
          x2="14"
          y2="16"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="32"
          y1="24"
          x2="32"
          y2="12"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="50"
          y1="24"
          x2="50"
          y2="16"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      <span className="font-black tracking-tight text-lg">
        IET<span className="text-blue-600 dark:text-blue-400">BRIDGE</span>
      </span>
    </div>
  );
}

function HeroBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-600 via-blue-700 to-indigo-800" />
  );
}
function GradientBand() {
  return (
    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600" />
  );
}

function Badge({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3 py-1 text-xs uppercase tracking-wide ring-1 ring-white/20">
      {children}
    </div>
  );
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-foreground/80 hover:text-foreground transition-colors"
    >
      {children}
    </Link>
  );
}

function InfoPill({ title, subtitle }) {
  return (
    <div className="rounded-xl bg-white/10 text-white ring-1 ring-white/15 p-4 flex flex-col">
      <div className="flex items-center gap-2 font-semibold">{title}</div>
      <span className="mt-1 text-sm text-white/90">{subtitle}</span>
    </div>
  );
}

function FeatureCard({ icon, title, text, cta }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-700 dark:text-blue-300">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      {cta && (
        <Link
          to={cta.to}
          className="mt-4 inline-flex items-center text-blue-700 dark:text-blue-300 hover:underline"
        >
          {cta.label}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      )}
    </div>
  );
}

function Stat({ kpi, label }) {
  return (
    <div className="rounded-xl bg-background border p-6">
      <div className="text-2xl font-bold">{kpi}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function Bullet({ title }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border p-4">
      <div className="mt-1 h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{title}</span>
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-muted/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-3 font-extrabold tracking-tight">
            <LogoIET className="h-7" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            The alumni system for IET Pune — stay connected with your community
            and open doors for each other.
          </p>
        </div>
        <div>
          <h4 className="font-semibold">Links</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:underline">
                Events
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:underline">
                Jobs
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Reach Us</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> +91 82638 59466
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> info@ietpune.com
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> A-401, 4th floor, Manikchand
              Galleria, Swastik Society, Model Colony, Pune 411018
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="max-w-7xl mx-auto px-4 py-6 text-xs text-muted-foreground flex justify-between">
          <span>© {new Date().getFullYear()} IETBRIDGE</span>
          <span>Made with ❤️ in Pune</span>
        </div>
      </div>
    </footer>
  );
}
