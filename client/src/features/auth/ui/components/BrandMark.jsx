import { Link } from "react-router-dom";

export default function BrandMark({ compact = false, inverted = false }) {
  return (
    <Link
      className={`inline-flex items-center gap-2.5 no-underline ${inverted ? "text-white" : "text-ink"}`}
      to="/"
      aria-label="Jules home"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-jules text-canvas">
        <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" fill="none" aria-hidden="true">
          <path d="M12 2.8 13.9 10l7.3 2-7.3 2L12 21.2 10.1 14 2.8 12l7.3-2L12 2.8Z" fill="currentColor" />
          <circle cx="18.7" cy="5.3" r="1.25" fill="currentColor" opacity=".7" />
        </svg>
      </span>
      {!compact && <span className="font-display text-[22px] font-semibold tracking-[-0.04em]">jules</span>}
    </Link>
  );
}
