import { useLayoutEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import gsap from "gsap";
import BrandMark from "./BrandMark.jsx";
import ThemeToggle from "../../../../components/ThemeToggle.jsx";

export default function AuthLayout({ children }) {
  const layoutRef = useRef(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(".auth-visual", { opacity: 0.65, scale: 1.035 }, {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "power2.out"
      });
      gsap.fromTo(".auth-hero-brand", { opacity: 0, y: -10 }, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        delay: 0.1,
        ease: "power2.out"
      });
      gsap.fromTo(".auth-hero-copy > *", { opacity: 0, y: 18 }, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.09,
        delay: 0.22,
        ease: "power3.out"
      });
      gsap.fromTo(".auth-card", { opacity: 0, y: 16 }, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        delay: 0.2,
        ease: "power3.out"
      });
    }, layoutRef);

    return () => context.revert();
  }, []);

  return (
    <main className="min-h-screen bg-canvas text-ink transition-colors duration-300 dark:bg-canvas dark:text-ink" ref={layoutRef}>
      <div className="mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative hidden min-h-screen overflow-hidden bg-sage px-14 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
          <div className="auth-visual absolute inset-0">
            <img
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1800&q=85"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#101916]/90 via-[#20352b]/75 to-[#16211f]/90" />
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_78%_22%,rgba(226,237,214,.34),transparent_24%),radial-gradient(circle_at_10%_92%,rgba(163,194,163,.25),transparent_36%)]" />
          </div>
          <div className="auth-hero-brand relative z-10">
            <BrandMark inverted />
          </div>
          <div className="relative z-10 max-w-[510px] pb-8">
            <div className="auth-hero-copy mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-2 text-[11px] font-medium tracking-wide text-white/80 backdrop-blur-md">
              <Sparkles size={13} className="text-[#dce8d1]" />
              A calmer kind of intelligence
            </div>
            <div className="auth-hero-copy">
              <h1 className="font-display text-[48px] font-medium leading-[1.06] tracking-[-0.05em] xl:text-[62px]">
                A little more
                <br />
                <span className="text-[#cbd9c3]">wonder. A lot</span>
                <br />
                more possibility.
              </h1>
              <p className="mt-6 max-w-[360px] text-[15px] leading-7 text-white/68">
                Think it through, dream it up, or just see where a good question takes you.
              </p>
              <div className="mt-11 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.09] px-4 py-3.5 shadow-2xl shadow-black/10 backdrop-blur-xl">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d7e2ce]/15 text-[#d7e2ce]">
                  <Sparkles size={17} />
                </span>
                <span>
                  <span className="block text-[12px] font-medium text-white">Curiosity, meet clarity</span>
                  <span className="mt-0.5 block text-[10px] text-white/55">A thoughtful space, just for you.</span>
                </span>
              </div>
            </div>
          </div>
          <p className="relative z-10 text-[10px] tracking-wide text-white/40">A fresh perspective is a question away.</p>
        </section>

        <section className="flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:px-14 lg:py-7 xl:px-20">
          <div className="flex items-center justify-between">
            <div className="lg:hidden">
              <BrandMark />
            </div>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center py-12">
            <div className="auth-card w-full max-w-[410px]">{children}</div>
          </div>
          <footer className="flex justify-center gap-2 pb-2 text-[10px] text-ink-faint">
            <span>Made for curious minds</span>
            <span aria-hidden="true">·</span>
            <span>Take it at your pace</span>
          </footer>
        </section>
      </div>
    </main>
  );
}
