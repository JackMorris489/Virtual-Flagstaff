import Link from "next/link";
import { useSfx } from "../hooks";

export default function PixelButton({
  href,
  onClick,
  onMouseEnter,
  onPointerEnter,
  onFocus,
  children,
  ariaLabel,
  type = "button",
}: {
  href?: string;
  onClick?: () => void;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onPointerEnter?: React.PointerEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  children: React.ReactNode;
  ariaLabel?: string;
  type?: "button" | "submit";
}) {
  const {playClickSfx, playHoverSfx} = useSfx();

  const base = (
    <span
      className="relative block select-none rounded-none border-[4px] border-white px-6 py-4 text-center text-sm uppercase tracking-widest transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-white/60 active:translate-y-[2px]"
      style={{
        textRendering: "optimizeLegibility",
        boxShadow: "0 0 0 0 #000, 6px 6px 0 0 #ffffff, 8px 8px 0 0 #4ade80",
      }}
    >
      {/* pixel-corner accents */}
      <span className="pointer-events-none absolute -left-2 -top-2 h-2 w-2 bg-white" />
      <span className="pointer-events-none absolute -right-2 -top-2 h-2 w-2 bg-white" />
      <span className="pointer-events-none absolute -left-2 -bottom-2 h-2 w-2 bg-white" />
      <span className="pointer-events-none absolute -right-2 -bottom-2 h-2 w-2 bg-white" />
      <span className="relative z-10">{children}</span>
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        className="outline-none"
        onClick={onClick as any}
        onMouseEnter={playHoverSfx as any}
        onPointerEnter={playHoverSfx as any}
        onFocus={playHoverSfx as any}
      >
        {base}
      </Link>
    );
  }

  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={playHoverSfx}
      onPointerEnter={playHoverSfx}
      onFocus={playHoverSfx}
      type={type}
      className="outline-none"
    >
      {base}
    </button>
  );
}
