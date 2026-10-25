"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("qreet_theme_preference");
      if (saved === "dark") {
        setTheme("dark");
        document.documentElement.classList.remove("light-theme");
        document.documentElement.removeAttribute("data-theme");
      } else {
        setTheme("light");
        document.documentElement.classList.add("light-theme");
        document.documentElement.setAttribute("data-theme", "light");
      }
    } catch {
      // default light
    }
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("qreet_theme_preference", next);
      if (next === "light") {
        document.documentElement.classList.add("light-theme");
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        document.documentElement.classList.remove("light-theme");
        document.documentElement.removeAttribute("data-theme");
      }
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn-ghost w-full justify-center text-xs mb-2 flex items-center gap-2"
      title="Toggle Light / Dark mode locally"
    >
      <span>{theme === "dark" ? "☀️" : "🌙"}</span>
      <span>{theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
    </button>
  );
}
