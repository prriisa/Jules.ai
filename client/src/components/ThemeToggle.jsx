import { useLayoutEffect, useRef } from "react"
import { Moon, Sun } from "lucide-react"
import gsap from "gsap"
import { useTheme } from "../app/theme/useTheme.js"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const nextTheme = theme === "dark" ? "light" : "dark"
  const iconRef = useRef(null)
  const previousTheme = useRef(theme)

  useLayoutEffect(() => {
    if (previousTheme.current === theme) return
    previousTheme.current = theme
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !iconRef.current) return
    const tween = gsap.fromTo(
      iconRef.current,
      { autoAlpha: 0, rotation: -70, scale: 0.72 },
      { autoAlpha: 1, rotation: 0, scale: 1, duration: 0.34, ease: "back.out(1.7)" }
    )
    return () => tween.kill()
  }, [theme])

  return (
    <button
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={theme === "dark"}
      className="theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${nextTheme} mode`}
      type="button"
    >
      <span className="grid place-items-center" ref={iconRef}>
        {theme === "dark" ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
      </span>
      <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  )
}
