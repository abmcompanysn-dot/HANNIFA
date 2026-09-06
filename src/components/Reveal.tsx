import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "is-in" : ""} ${className}`}
      style={{ ...style, ["--rv-delay" as string]: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** Cormorant title revealed line by line through a mask */
export function MaskLines({
  lines,
  className = "",
  baseDelay = 0,
}: {
  lines: ReactNode[];
  className?: string;
  baseDelay?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  return (
    <div ref={ref} className={`${inView ? "is-in" : ""} ${className}`}>
      {lines.map((line, i) => (
        <span
          key={i}
          className="mask-line"
          style={{ ["--rv-delay" as string]: `${baseDelay + i * 130}ms` }}
        >
          <span>{line}</span>
        </span>
      ))}
    </div>
  );
}
