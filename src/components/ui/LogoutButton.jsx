import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function LogoutButton() {
  const { logout } = useAuth();
  const nav = useNavigate();

  // function handleLogout() {
  //   logout();
  //   nav("/login", { replace: true });
  // }

  function handleLogout() {
    logout(); // clears token + user
    // nav("/", { replace: true }); // go to public Home
  }

  return (
    <button onClick={handleLogout} className="rounded border px-3 py-2">
      Logout
    </button>
  );
}
