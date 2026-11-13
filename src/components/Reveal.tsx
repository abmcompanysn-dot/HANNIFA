import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/** early : l'élément est déjà affiché bien avant d'entrer à l'écran (les
 * photos des modèles ne doivent jamais apparaître sous les yeux). */
export function useInView<T extends HTMLElement>(threshold = 0.15, early = false) {
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
      { threshold: early ? 0 : threshold, rootMargin: early ? "0px 0px 900px 0px" : "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, early]);

  return { ref, inView };
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  style,
  early = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
  early?: boolean;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15, early);
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "is-in" : ""} ${className}`}
      style={{ ...style, ["--rv-delay" as string]: `${early ? 0 : delay}ms` }}
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
