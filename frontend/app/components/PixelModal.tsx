import { useEffect, useRef } from "react";
import { useSfx } from "../hooks";

export default function PixelModal({
  open,
  title,
  onClose,
  children,
  initialFocusRef,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  initialFocusRef?: React.RefObject<HTMLElement>;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const hasFocused = useRef(false);

  const {playClickSfx, playHoverSfx} = useSfx();

  useEffect(() => {
    // When closed, reset so next open can focus again
    if (!open) {
      hasFocused.current = false;
      return;
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Focus exactly once per open
    if (!hasFocused.current) {
      hasFocused.current = true;
      setTimeout(() => initialFocusRef?.current?.focus(), 0);
    }

    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, initialFocusRef]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 grid place-items-center bg-black/70"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-[min(38rem,92vw)] rounded-none border-[4px] border-white bg-black p-5 text-white shadow-[6px_6px_0_0_#ffffff,8px_8px_0_0_#4ade80]">
        {/* pixel corners */}
        <span className="pointer-events-none absolute -left-2 -top-2 h-2 w-2 bg-white" />
        <span className="pointer-events-none absolute -right-2 -top-2 h-2 w-2 bg-white" />
        <span className="pointer-events-none absolute -left-2 -bottom-2 h-2 w-2 bg-white" />
        <span className="pointer-events-none absolute -right-2 -bottom-2 h-2 w-2 bg-white" />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs sm:text-sm">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-none border-[3px] border-white px-2 py-1 text-[10px] uppercase tracking-widest"
            onMouseEnter={playHoverSfx}
            onPointerEnter={playHoverSfx}
            onFocus={playHoverSfx}
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}