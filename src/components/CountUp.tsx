"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 1200;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function CountUp({
  value,
  className,
  style,
}: {
  value: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDisplay(0);
          const start = performance.now();
          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / DURATION_MS, 1);
            setDisplay(Math.round(easeOutCubic(progress) * value));
            if (progress < 1) rafId = requestAnimationFrame(tick);
          }
          rafId = requestAnimationFrame(tick);
        } else if (entry.intersectionRatio === 0) {
          setDisplay(0);
        }
      },
      { threshold: [0, 0.1] },
    );

    observer.observe(el);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [value]);

  return (
    <span ref={ref} className={className} style={style}>
      {display}
    </span>
  );
}
