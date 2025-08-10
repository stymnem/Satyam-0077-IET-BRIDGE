import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Menu, X, ChevronRight, Copy } from "lucide-react";

/** Contact – IETBRIDGE (frontend-only, with webmail fallbacks) */
export default function Contact() {
  const mapSrc =
    "https://www.google.com/maps?q=A-401%2C%204th%20floor%2C%20Manikchand%20Galleria%2C%20Swastik%20Society%2C%20Model%20Colony%2C%20Pune%20411018&output=embed";

  const [values, setValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    website: "", // honeypot
  });

  const [showWebMail, setShowWebMail] = useState(false);
  const [links, setLinks] = useState({
    mailto: "",
    gmail: "",
    outlook: "",
    yahoo: "",
  });

  const onChange = (e) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const buildMailLinks = ({ to, subject, body }) => {
    const toE = encodeURIComponent(to);
    const su = encodeURIComponent(subject);
    const bo = encodeURIComponent(body);
    return {
      mailto: `mailto:${toE}?subject=${su}&body=${bo}`,
      gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${toE}&su=${su}&body=${bo}`,
      outlook: `https://outlook.office.com/mail/deeplink/compose?to=${toE}&subject=${su}&body=${bo}`,
      yahoo: `https://compose.mail.yahoo.com/?to=${toE}&subject=${su}&body=${bo}`,
    };
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (values.website) return; // honeypot

    if (!values.fullName.trim()) return alert("Please enter your name.");
    if (!/\S+@\S+\.\S+/.test(values.email))
      return alert("Enter a valid email.");
    if (!values.message.trim()) return alert("Message is required.");

    const to = "info@ietpune.com";
    const subject = `IETBRIDGE Enquiry: ${values.subject.trim() || "General"}`;
    const body = `
Name: ${values.fullName.trim()}
Email: ${values.email.trim()}
Phone: ${values.phone.trim()}

Message:
${values.message.trim()}
`.trim();

    const built = buildMailLinks({ to, subject, body });
    setLinks(built);

    // Try to open default mail app
    window.location.href = built.mailto;

    // Show webmail options as a visible fallback
    setShowWebMail(true);
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch {
      alert("Copy failed. Long-press or Ctrl/Cmd+C manually.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

   {/* Hero */}
<section className="relative">
  <HeroBackdrop />
  <div className="max-w-7xl mx-auto px-4 py-14 md:py-20 text-gray-900 dark:text-white">
    <p className="text-gray-600 dark:text-white/80 text-xs uppercase tracking-wider">
      Contact
    </p>
    <h1 className="mt-2 text-4xl md:text-5xl font-extrabold drop-shadow">
      Reach IET Pune via IETBRIDGE
    </h1>
    <p className="mt-3 text-gray-700 dark:text-white/90 max-w-3xl">
      Send an enquiry or use the official phone and email. You can also
      locate the institute on the map below.
    </p>
  </div>
</section>


      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Enquiry form</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Submit to open your default mail app. If nothing opens, use
            Gmail/Outlook/Yahoo below.
          </p>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4" noValidate>
            {/* honeypot */}
            <input
              type="text"
              name="website"
              className="hidden"
              value={values.website}
              onChange={onChange}
              tabIndex="-1"
              autoComplete="off"
            />

            <Field label="Full name">
              <input
                name="fullName"
                value={values.fullName}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-md border bg-background"
                placeholder="Your name"
                required
              />
            </Field>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Email">
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  placeholder="you@example.com"
                  required
                />
              </Field>
              <Field label="Phone (optional)">
                <input
                  name="phone"
                  value={values.phone}
                  onChange={onChange}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  placeholder="+91 …"
                />
              </Field>
            </div>

            <Field label="Subject">
              <input
                name="subject"
                value={values.subject}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-md border bg-background"
                placeholder="Subject"
              />
            </Field>

            <Field label="Message">
              <textarea
                name="message"
                value={values.message}
                onChange={onChange}
                rows={5}
                className="w-full px-3 py-2 rounded-md border bg-background"
                placeholder="How can we help?"
                required
              />
            </Field>

            <div className="flex flex-wrap gap-3 items-center">
              <button
                type="submit"
                className="inline-flex items-center rounded-lg bg-blue-600 text-white px-5 py-2.5 hover:bg-blue-700"
              >
                Open email to send
              </button>
              <Link
                to="/register"
                className="inline-flex items-center rounded-lg border px-5 py-2.5"
              >
                Join the community <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </form>

          {/* Fallbacks */}
          {showWebMail && (
            <div className="mt-6 rounded-xl border bg-muted/40 p-4">
              <p className="text-sm font-medium">Nothing opened?</p>
              <p className="text-sm text-muted-foreground">
                Choose your email service to continue in a new tab:
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  href={links.gmail}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg border px-4 py-2 hover:bg-muted"
                >
                  Open in Gmail
                </a>
                <a
                  href={links.outlook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg border px-4 py-2 hover:bg-muted"
                >
                  Open in Outlook
                </a>
                <a
                  href={links.yahoo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg border px-4 py-2 hover:bg-muted"
                >
                  Open in Yahoo Mail
                </a>
                <button
                  onClick={() => copy("info@ietpune.com")}
                  className="inline-flex items-center rounded-lg border px-4 py-2 hover:bg-muted"
                  title="Copy email address"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy email
                </button>
                <button
                  onClick={() =>
                    copy(
                      `To: info@ietpune.com\nSubject: IETBRIDGE Enquiry: ${
                        values.subject.trim() || "General"
                      }\n\n${values.message.trim()}`
                    )
                  }
                  className="inline-flex items-center rounded-lg border px-4 py-2 hover:bg-muted"
                  title="Copy full message"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy full message
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Official contact + Map */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Official details</h3>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <a href="tel:+918263859466" className="hover:underline">
                +91 82638 59466
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a href="mailto:info@ietpune.com" className="hover:underline">
                info@ietpune.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              A-401, 4th floor, Manikchand Galleria, Swastik Society, Model
              Colony, Pune 411018
            </li>
          </ul>

          <div className="mt-4 aspect-video w-full rounded-xl overflow-hidden ring-1 ring-border bg-muted">
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
      </section>

      <Footer />
    </div>
  );
}

/* ---- small building blocks (same style as your Home page) ---- */
function Field({ label, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

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
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
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
        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
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
    const v = localStorage.getItem("theme");
    if (v === "light" || v === "dark") return v;
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
  return {
    theme,
    toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
  };
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
          <span>Made By GP</span>
        </div>
      </div>
    </footer>
  );
}
