import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import api from "@/api/axios";
import type { User, LoginDto, RegisterDto } from "@/types";

/* --------------------------------------------------------------
 * Types
 * ------------------------------------------------------------ */
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (creds: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

/**
 * JWT payload can vary – we normalise it here.
 */
interface GenericJWTPayload {
  [key: string]: any; // fallback
  nameid?: string;
  unique_name?: string;
  email?: string;
  role?: string; // single role claim
  roles?: string[]; // array claim
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

/* --------------------------------------------------------------
 * Provider
 * ------------------------------------------------------------ */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- helpers ---------------- */
  const decodeToken = (raw: string): User => {
    const d = jwtDecode<GenericJWTPayload>(raw);

    // Normalise the role claim (single, array, or MS schema)
    const role = (d.role ??
      (Array.isArray(d.roles) ? d.roles[0] : undefined) ??
      d["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      "Alumni") as "Admin" | "Alumni";

    return {
      id: d.nameid ?? "", // adjust if your API uses another claim
      fullName: d.unique_name ?? d.email ?? "Unknown",
      email: d.email ?? "",
      role,
    };
  };

  /* ---------------- actions ---------------- */
  const login = async (creds: LoginDto) => {
    try {
      const { data } = await api.post<{ token: string }>("/auth/login", creds);
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(decodeToken(data.token));
      toast.success("Login successful");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Login failed");
      throw err;
    }
  };

  const register = async (payload: RegisterDto) => {
    try {
      await api.post("/auth/register", payload);
      toast.success("Registration successful – please log in.");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Registration failed");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.success("Logged out");
  };

  /* ---------------- init ---------------- */
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      try {
        setUser(decodeToken(stored));
        setToken(stored);
      } catch {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  /* ---------------- ctx ---------------- */
  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
