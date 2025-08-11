import * as React from "react";
import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/context/ThemeContext";

export function Toaster(props) {
  const { theme = "light" } = useTheme();
  return <SonnerToaster theme={theme} {...props} />;
}
