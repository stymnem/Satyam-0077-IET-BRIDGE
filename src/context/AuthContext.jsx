import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "@/api/axios"; // <-- make sure this exists and uses VITE_API_BASE or /api

const AuthCtx = createContext(null);

function parseUserFromToken(token) {
  try {
    const d = jwtDecode(token) || {};
    const roleClaim =
      (Array.isArray(d.roles) ? d.roles[0] : d.roles) ??
      d.role ??
      d["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      "Alumni";

    return {
      id: d.nameid ?? d.sub ?? "",
      email: d.email ?? "",
      name: d.name ?? "",
      role: String(roleClaim).trim(),
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // attach token on each request
  useEffect(() => {
    const reqId = api.interceptors.request.use((config) => {
      const t = localStorage.getItem("token");
      if (t) config.headers.Authorization = `Bearer ${t}`;
      return config;
    });
    return () => api.interceptors.request.eject(reqId);
  }, []);

  // boot: read token from storage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    const u = parseUserFromToken(token);
    setUser(u);
    setLoading(false);
  }, []);

  async function login({ email, password }) {
    const body = {
      // send a couple aliases to match common backends
      email,
      username: email,
      userName: email,
      password,
    };
    const res = await api.post("/auth/login", body);

    const token =
      res.data?.token ||
      res.data?.accessToken ||
      res.data?.jwt ||
      res.data?.data?.token;

    if (!token) throw new Error("Login succeeded but no token returned");

    localStorage.setItem("token", token);
    setUser(parseUserFromToken(token));
    return true;
  }

  async function register({ fullName, email, password, role = "Alumni" }) {
    const body = { fullName, name: fullName, email, password, role };
    const res = await api.post("/auth/register", body);

    // if your backend returns a token on register, you can auto-login:
    const token =
      res.data?.token ||
      res.data?.accessToken ||
      res.data?.jwt ||
      res.data?.data?.token;

    if (token) {
      localStorage.setItem("token", token);
      setUser(parseUserFromToken(token));
    }
    return res.data;
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  const value = { user, setUser, loading, login, logout, register };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
