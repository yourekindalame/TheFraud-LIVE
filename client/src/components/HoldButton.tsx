import React, { useEffect, useMemo, useRef, useState } from "react";

export function HoldButton({
  seconds = 5,
  className,
  children,
  onConfirm,
  disabled
}: {
  seconds?: number;
  className?: string;
  children: React.ReactNode;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  const durationMs = seconds * 1000;
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const holdingRef = useRef(false);
  const confirmedRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);

  const pct = useMemo(() => Math.max(0, Math.min(100, progress * 100)), [progress]);

  const stop = () => {
    setHolding(false);
    setProgress(0);
    startRef.current = null;
    holdingRef.current = false;
    pointerIdRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  const tick = (t: number) => {
    if (!holdingRef.current) return;
    if (startRef.current === null) startRef.current = t;
    const elapsed = t - startRef.current;
    const p = Math.min(1, elapsed / durationMs);
    setProgress(p);
    if (p >= 1) {
      if (confirmedRef.current) return;
      confirmedRef.current = true;
      stop();
      onConfirm();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const begin = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    // Only left-click for mouse pointers; allow touch/pen.
    if (e.pointerType === "mouse" && e.button !== 0) return;

    // Prevent long-press context menu / text selection.
    e.preventDefault();

    confirmedRef.current = false;
    setHolding(true);
    setProgress(0);
    startRef.current = null;
    holdingRef.current = true;
    pointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  return (
    <div>
      <button
        className={className || "btn"}
        onPointerDown={begin}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={stop}
        onContextMenu={(e) => {
          if (holdingRef.current) e.preventDefault();
        }}
        disabled={disabled}
        style={{
          position: "relative",
          overflow: "hidden",
          touchAction: "none"
        }}
      >
        <span className="holdBtnFill" aria-hidden="true" style={{ width: `${pct}%`, opacity: holding ? 1 : 0 }} />
        <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      </button>
      {holding && (
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
          Keep holding…
        </div>
      )}
    </div>
  );
}

