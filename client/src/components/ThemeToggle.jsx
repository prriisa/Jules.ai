import { Moon, Sun } from "lucide-react";
import { useTheme } from "../app/theme/useTheme.js";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={theme === "dark"}
      className="theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${nextTheme} mode`}
      type="button"
    >
      {theme === "dark" ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
      <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
