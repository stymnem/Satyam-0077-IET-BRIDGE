// src/pages/About.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Rocket,
  GraduationCap,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  ChevronRight,
  Briefcase,
  CalendarDays,
  Share2,
} from "lucide-react";

/**
 * About – IETBRIDGE (Alumni System for IET Pune)
 * - Same navbar + theme toggle + inline logo as Home
 * - Real Google Map embed for the Model Colony address
 * - Compact “Ways to contribute” grid with dual CTAs
 */
export default function About() {
  const mapSrc =
    "https://www.google.com/maps?q=A-401%2C%204th%20floor%2C%20Manikchand%20Galleria%2C%20Swastik%20Society%2C%20Model%20Colony%2C%20Pune%20411018&output=embed";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative">
        <HeroBackdrop />
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-white">
          <p className="text-white/80 text-xs uppercase tracking-wider">
            About
          </p>
          <h1 className="mt-2 text-4xl md:text-5xl font-extrabold leading-tight drop-shadow">
            The Alumni System for the IET Pune Community
          </h1>
          <p className="mt-4 text-white/90 max-w-3xl">
            IETBRIDGE keeps alumni, students, and faculty connected—so
            mentorship, referrals, reunions and opportunities flow easily across
            batches, departments and cities.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl bg-white text-blue-700 font-semibold px-5 py-3 hover:bg-blue-50 transition"
            >
              Join the community
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl border border-white/40 text-white px-5 py-3 hover:bg-white/10 transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Who we are / IET context */}
      <section className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10 items-start">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold">Who we are</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            A people-first alumni network for IET Pune—built to help you find
            classmates, seniors, juniors and faculty; keep your profile updated;
            and stay close to the opportunities and friendships that started on
            campus.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Users className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400" />
              Directory by batch, department, location and company.
            </li>
            <li className="flex gap-2">
              <Rocket className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400" />
              Jobs, referrals and interview prep groups.
            </li>
            <li className="flex gap-2">
              <GraduationCap className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400" />
              Mentorship: AMAs, resume clinics, mock interviews.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold">IET Pune context</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Strong presence in Model Colony, Pune; guidance around the C-DAC
            ecosystem (C-CAT / Pre-CAT) and PG-oriented computing pathways. The
            alumni community complements this with mentorship and placements
            support.
          </p>
          <ul className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
            <InfoBadge
              icon={<BookOpen className="h-4 w-4" />}
              title="Pre-CAT (C-CAT) prep"
              subtitle="Structured guidance"
            />
            <InfoBadge
              icon={<GraduationCap className="h-4 w-4" />}
              title="PG-orientation"
              subtitle="Career-centric focus"
            />
            <InfoBadge
              icon={<Users className="h-4 w-4" />}
              title="Alumni strength"
              subtitle="Mentors & referrals"
            />
            <InfoBadge
              icon={<Rocket className="h-4 w-4" />}
              title="Placements mindset"
              subtitle="Industry-ready"
            />
          </ul>
        </div>
      </section>

      {/* Location + Ways to contribute */}
      <section className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-8">
        {/* Location & contact */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Location & contact</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            A-401, 4th floor, Manikchand Galleria, Swastik Society, Model
            Colony, Pune 411018
          </p>
          <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Model Colony, Pune
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> +91 82638 59466
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> info@ietpune.com
            </div>
          </div>
          {/* Real Google Map embed */}
          <div className="mt-6 aspect-video w-full rounded-xl overflow-hidden ring-1 ring-border bg-muted">
            <iframe
              title="IET Pune – Model Colony"
              src={mapSrc}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full border-0"
            />
          </div>
        </div>

        {/* Ways to contribute – compact grid + dual CTAs */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Ways to contribute</h3>
          <ul className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Briefcase className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400" />
              <span>Add your current role and city</span>
            </li>
            <li className="flex items-start gap-2">
              <Users className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400" />
              <span>Offer mentoring slots (or request one)</span>
            </li>
            <li className="flex items-start gap-2">
              <Share2 className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400" />
              <span>Share openings & referrals</span>
            </li>
            <li className="flex items-start gap-2">
              <CalendarDays className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400" />
              <span>Host a city meetup or reunion</span>
            </li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-lg border px-4 py-2 hover:bg-muted"
              title="Post a role, offer mentoring, or share an update"
            >
              Contribute now
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative">
        <GradientBand />
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold">
            Stay close to your people
          </h3>
          <p className="mt-3 text-white/90 max-w-2xl mx-auto">
            Whether you graduated this year or a decade ago, the right
            connection can change everything.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              to="/register"
              className="rounded-xl bg-white text-indigo-700 font-semibold px-5 py-3 hover:bg-violet-50 transition"
            >
              Join IETBRIDGE
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

/* ---------- shared components (same as Home) ---------- */

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
          <NavLink to="/login">Contact</NavLink>
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
            <Link to="/login" onClick={() => setOpen(false)}>
              Contact
            </Link>
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

function InfoBadge({ icon, title, subtitle }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border p-3">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/10 text-blue-700 dark:text-blue-300">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </li>
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
              <Link to="/login" className="hover:underline">
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
