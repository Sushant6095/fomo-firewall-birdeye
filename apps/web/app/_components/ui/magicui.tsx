"use client";

/**
 * MagicUI / 21st.dev component bundle for FOMO Firewall.
 * All components rely only on framer-motion and react — no extra deps.
 * Each component respects prefers-reduced-motion where motion is involved.
 */

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useScroll,
  type Variants
} from "framer-motion";

function cx(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(" ");
}

/* ──────────────────────────────────────────────────────────────────────
 * 1. NumberTicker — animated counter that runs once when in view
 * ────────────────────────────────────────────────────────────────────── */
export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  decimalPlaces = 0,
  className = "",
  prefix = "",
  suffix = ""
}: {
  value: number;
  direction?: "up" | "down";
  delay?: number;
  decimalPlaces?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  React.useEffect(() => {
    if (!isInView) return;
    if (reduced) {
      if (ref.current) {
        ref.current.textContent = `${prefix}${value.toLocaleString(undefined, {
          maximumFractionDigits: decimalPlaces,
          minimumFractionDigits: decimalPlaces
        })}${suffix}`;
      }
      return;
    }
    const id = setTimeout(() => {
      motionValue.set(direction === "down" ? 0 : value);
    }, delay * 1000);
    return () => clearTimeout(id);
  }, [motionValue, value, delay, isInView, direction, reduced, prefix, suffix, decimalPlaces]);

  React.useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (!ref.current) return;
      ref.current.textContent = `${prefix}${Number(latest).toLocaleString(
        undefined,
        {
          maximumFractionDigits: decimalPlaces,
          minimumFractionDigits: decimalPlaces
        }
      )}${suffix}`;
    });
    return unsubscribe;
  }, [springValue, prefix, suffix, decimalPlaces]);

  return (
    <span
      ref={ref}
      className={cx("inline-block tabular-nums", className)}
    >
      {prefix}0{suffix}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 2. Marquee — infinite horizontal scroll with pause on hover
 * ────────────────────────────────────────────────────────────────────── */
export function Marquee({
  children,
  className = "",
  pauseOnHover = true,
  reverse = false,
  durationSec = 30,
  vertical = false
}: {
  children: React.ReactNode;
  className?: string;
  pauseOnHover?: boolean;
  reverse?: boolean;
  durationSec?: number;
  vertical?: boolean;
}) {
  return (
    <div
      className={cx(
        "group flex overflow-hidden [--gap:1rem]",
        vertical ? "flex-col" : "flex-row",
        className
      )}
      style={{ "--duration": `${durationSec}s` } as React.CSSProperties}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden={i === 1}
          className={cx(
            "flex shrink-0 justify-around gap-[var(--gap)]",
            vertical
              ? reverse
                ? "animate-marquee-vertical-reverse"
                : "animate-marquee-vertical"
              : reverse
                ? "animate-marquee-reverse"
                : "animate-marquee-horizontal",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            !vertical && "flex-row"
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 3. AnimatedList — items pop in newest-first, then settle
 * ────────────────────────────────────────────────────────────────────── */
export function AnimatedList({
  children,
  delay = 1000,
  className = ""
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const childArray = React.useMemo(
    () => React.Children.toArray(children),
    [children]
  );

  React.useEffect(() => {
    if (reduced) {
      setIndex(childArray.length);
      return;
    }
    if (index < childArray.length) {
      const id = setTimeout(() => setIndex((i) => i + 1), delay / 6);
      return () => clearTimeout(id);
    }
  }, [index, childArray.length, delay, reduced]);

  return (
    <div className={cx("flex flex-col items-stretch gap-3", className)}>
      <AnimatePresence>
        {childArray.slice(0, index).map((child, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.92, y: -16 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { type: "spring", stiffness: 350, damping: 40 }
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 4. BentoGrid + BentoCard — asymmetric responsive grid
 * ────────────────────────────────────────────────────────────────────── */
export function BentoGrid({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "grid w-full auto-rows-[18rem] grid-cols-3 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  name,
  className = "",
  background,
  Icon,
  description,
  href,
  cta,
  highlight = false
}: {
  name: string;
  className?: string;
  background?: React.ReactNode;
  Icon?: React.ComponentType<{ className?: string }>;
  description: string;
  href?: string;
  cta?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cx(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]",
        highlight && "border-error/40 hover:shadow-[0_0_30px_rgba(255,77,46,0.2)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0">{background}</div>
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
        {Icon ? (
          <Icon className="h-10 w-10 origin-left transform-gpu text-on-surface-variant transition-all duration-300 ease-in-out group-hover:scale-75" />
        ) : null}
        <h3 className="text-xl font-semibold text-on-surface">{name}</h3>
        <p className="max-w-lg text-on-surface-variant">{description}</p>
      </div>
      {href && cta ? (
        <div className="pointer-events-auto absolute bottom-0 z-10 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <a
            href={href}
            className="text-sm font-semibold text-tertiary underline-offset-4 hover:underline"
          >
            {cta} →
          </a>
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-on-surface/[.03]" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 5. MagicCard — soft spotlight that tracks the cursor
 * ────────────────────────────────────────────────────────────────────── */
export function MagicCard({
  children,
  className = "",
  gradientSize = 200,
  gradientColor = "#262626",
  gradientOpacity = 0.8
}: {
  children: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
}) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }
  function handleMouseLeave() {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cx(
        "group relative flex size-full overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container text-on-surface",
        className
      )}
    >
      <div className="relative z-10 w-full">{children}</div>
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) =>
              `radial-gradient(${gradientSize}px circle at ${x}px ${y}px, ${gradientColor}${Math.round(
                gradientOpacity * 255
              )
                .toString(16)
                .padStart(2, "0")}, transparent 100%)`
          )
        }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 6. OrbitingCircles — circular orbit of icons
 * ────────────────────────────────────────────────────────────────────── */
export function OrbitingCircles({
  className = "",
  children,
  reverse = false,
  duration = 20,
  delay = 10,
  radius = 80,
  path = true
}: {
  className?: string;
  children: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
}) {
  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="pointer-events-none absolute inset-0 size-full"
        >
          <circle
            className="stroke-on-surface-variant/20"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            strokeDasharray="4 4"
          />
        </svg>
      )}
      <div
        style={{
          "--duration": duration,
          "--radius": radius,
          "--delay": -delay,
          animationDirection: reverse ? "reverse" : "normal"
        } as React.CSSProperties}
        className={cx(
          "absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container/40 [animation-delay:calc(var(--delay)*1000ms)]",
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 7. AnimatedBeam — animated path between two refs
 * ────────────────────────────────────────────────────────────────────── */
export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = Math.random() * 3 + 4,
  delay = 0,
  pathColor = "#52525b",
  pathWidth = 2,
  pathOpacity = 0.4,
  gradientStartColor = "#10B981",
  gradientStopColor = "#34D399",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}) {
  const id = React.useId();
  const [path, setPath] = React.useState("");
  const [box, setBox] = React.useState({ w: 0, h: 0 });

  React.useEffect(() => {
    const update = () => {
      const c = containerRef.current?.getBoundingClientRect();
      const a = fromRef.current?.getBoundingClientRect();
      const b = toRef.current?.getBoundingClientRect();
      if (!c || !a || !b) return;
      setBox({ w: c.width, h: c.height });
      const x1 = a.left - c.left + a.width / 2 + startXOffset;
      const y1 = a.top - c.top + a.height / 2 + startYOffset;
      const x2 = b.left - c.left + b.width / 2 + endXOffset;
      const y2 = b.top - c.top + b.height / 2 + endYOffset;
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2 - curvature;
      setPath(`M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`);
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset]);

  return (
    <svg
      fill="none"
      width={box.w}
      height={box.h}
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none absolute left-0 top-0 transform-gpu"
      viewBox={`0 0 ${box.w} ${box.h}`}
    >
      <path d={path} stroke={pathColor} strokeWidth={pathWidth} strokeOpacity={pathOpacity} strokeLinecap="round" />
      <path d={path} strokeWidth={pathWidth} stroke={`url(#${id})`} strokeOpacity="1" strokeLinecap="round" />
      <defs>
        <motion.linearGradient
          className="transform-gpu"
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
          animate={{
            x1: reverse ? ["90%", "-10%"] : ["10%", "110%"],
            x2: reverse ? ["100%", "0%"] : ["0%", "100%"],
            y1: ["0%", "0%"],
            y2: ["0%", "0%"]
          }}
          transition={{
            delay,
            duration,
            ease: [0.16, 1, 0.3, 1],
            repeat: Infinity,
            repeatDelay: 0
          }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 8. Meteors — falling diagonal streaks for hero
 * ────────────────────────────────────────────────────────────────────── */
export function Meteors({ number = 20 }: { number?: number }) {
  const items = React.useMemo(
    () =>
      Array.from({ length: number }, (_, i) => ({
        id: i,
        left: Math.floor(Math.random() * 100),
        delay: Math.random() * 3,
        duration: 4 + Math.random() * 6
      })),
    [number]
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((m) => (
        <span
          key={m.id}
          className="absolute top-1/2 left-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-[9999px] bg-tertiary shadow-[0_0_0_1px_rgba(34,211,238,0.1)] before:absolute before:top-1/2 before:h-px before:w-[50px] before:-translate-y-1/2 before:bg-gradient-to-r before:from-tertiary before:to-transparent before:content-['']"
          style={{
            left: `${m.left}%`,
            animationDelay: `${m.delay}s`,
            animationDuration: `${m.duration}s`
          }}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 9. Particles — interactive floating dots (mouse parallax)
 * ────────────────────────────────────────────────────────────────────── */
export function Particles({
  className = "",
  quantity = 50,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#10B981"
}: {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  refresh?: boolean;
  color?: string;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = React.useRef<HTMLDivElement>(null);
  const context = React.useRef<CanvasRenderingContext2D | null>(null);
  const circles = React.useRef<Array<{
    x: number; y: number; translateX: number; translateY: number;
    size: number; alpha: number; targetAlpha: number; dx: number; dy: number; magnetism: number;
  }>>([]);
  const mouse = React.useRef({ x: 0, y: 0 });
  const canvasSize = React.useRef({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
    }
    initCanvas();
    if (!reduced) animate();
    window.addEventListener("resize", initCanvas);
    return () => {
      window.removeEventListener("resize", initCanvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  function initCanvas() {
    resizeCanvas();
    drawParticles();
  }

  function resizeCanvas() {
    if (!canvasContainerRef.current || !canvasRef.current || !context.current) return;
    circles.current.length = 0;
    canvasSize.current.w = canvasContainerRef.current.offsetWidth;
    canvasSize.current.h = canvasContainerRef.current.offsetHeight;
    canvasRef.current.width = canvasSize.current.w * dpr;
    canvasRef.current.height = canvasSize.current.h * dpr;
    canvasRef.current.style.width = `${canvasSize.current.w}px`;
    canvasRef.current.style.height = `${canvasSize.current.h}px`;
    context.current.scale(dpr, dpr);
  }

  function circleParams() {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const translateX = 0;
    const translateY = 0;
    const pSize = Math.floor(Math.random() * 2) + size;
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.2;
    const dy = (Math.random() - 0.5) * 0.2;
    const magnetism = 0.1 + Math.random() * 4;
    return { x, y, translateX, translateY, size: pSize, alpha, targetAlpha, dx, dy, magnetism };
  }

  function drawCircle(c: ReturnType<typeof circleParams>, update = false) {
    if (!context.current) return;
    const { x, y, translateX, translateY, size: s, alpha } = c;
    context.current.translate(translateX, translateY);
    context.current.beginPath();
    context.current.arc(x, y, s, 0, 2 * Math.PI);
    context.current.fillStyle = `${color}${Math.round(alpha * 255)
      .toString(16)
      .padStart(2, "0")}`;
    context.current.fill();
    context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!update) circles.current.push(c);
  }

  function drawParticles() {
    clearContext();
    for (let i = 0; i < quantity; i += 1) {
      const c = circleParams();
      drawCircle(c);
    }
  }

  function clearContext() {
    if (context.current) {
      context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
    }
  }

  function animate() {
    clearContext();
    circles.current.forEach((c, i) => {
      const edge = [
        c.x + c.translateX - c.size,
        canvasSize.current.w - c.x - c.translateX - c.size,
        c.y + c.translateY - c.size,
        canvasSize.current.h - c.y - c.translateY - c.size
      ];
      const closest = edge.reduce((a, b) => Math.min(a, b));
      const remap = parseFloat((closest / 20).toFixed(2));
      if (remap > 1) {
        c.alpha += 0.02;
        if (c.alpha > c.targetAlpha) c.alpha = c.targetAlpha;
      } else {
        c.alpha = c.targetAlpha * remap;
      }
      c.x += c.dx;
      c.y += c.dy;
      c.translateX += (mouse.current.x / (staticity / c.magnetism) - c.translateX) / ease;
      c.translateY += (mouse.current.y / (staticity / c.magnetism) - c.translateY) / ease;
      if (
        c.x < -c.size ||
        c.x > canvasSize.current.w + c.size ||
        c.y < -c.size ||
        c.y > canvasSize.current.h + c.size
      ) {
        circles.current.splice(i, 1);
        drawCircle(circleParams());
      } else {
        drawCircle({ ...c, x: c.x, y: c.y, translateX: c.translateX, translateY: c.translateY, alpha: c.alpha }, true);
      }
    });
    window.requestAnimationFrame(animate);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouse.current = { x, y };
  }

  return (
    <div
      ref={canvasContainerRef}
      className={cx("pointer-events-none absolute inset-0", className)}
      onMouseMove={handleMouseMove}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 10. Ripple — concentric expanding circles
 * ────────────────────────────────────────────────────────────────────── */
export function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className = ""
}: {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "pointer-events-none absolute inset-0 select-none [mask-image:linear-gradient(to_bottom,white,transparent)]",
        className
      )}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 animate-ripple rounded-full border border-tertiary/30 bg-tertiary/5 shadow-xl [transform:translate(-50%,-50%)]"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animationDelay,
              borderStyle: i === numCircles - 1 ? "dashed" : "solid",
              borderColor: `rgba(34, 211, 238, ${0.25 + (i / numCircles) * 0.2})`
            }}
          />
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 11. ShineBorder — rotating gradient border
 * ────────────────────────────────────────────────────────────────────── */
export function ShineBorder({
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  color = ["#34D399", "#10B981", "#84CC16"],
  className = "",
  children
}: {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: string | string[];
  className?: string;
  children: React.ReactNode;
}) {
  const colors = Array.isArray(color) ? color : [color];
  return (
    <div
      style={
        {
          "--border-radius": `${borderRadius}px`,
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          "--color": colors.join(",")
        } as React.CSSProperties
      }
      className={cx(
        "relative grid min-h-[40px] w-fit min-w-[40px] place-items-center rounded-[var(--border-radius)] bg-transparent text-on-surface",
        "before:absolute before:inset-0 before:rounded-[var(--border-radius)] before:p-[var(--border-width)]",
        "before:[background:linear-gradient(var(--color))_border-box]",
        "before:[background-size:300%_300%]",
        "before:animate-shine",
        "before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
        "before:[mask-composite:exclude]",
        "before:pointer-events-none",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 12. SparklesText — tiny floating sparkles around a word
 * ────────────────────────────────────────────────────────────────────── */
export function SparklesText({
  text,
  className = "",
  sparkleCount = 10,
  colors = { first: "#10B981", second: "#34D399" }
}: {
  text: string;
  className?: string;
  sparkleCount?: number;
  colors?: { first: string; second: string };
}) {
  const [sparkles, setSparkles] = React.useState<Array<{
    id: string;
    createdAt: number;
    color: string;
    size: number;
    style: React.CSSProperties;
  }>>([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSparkles((prev) => {
        const now = Date.now();
        const updated = prev.filter((s) => now - s.createdAt < 1000);
        if (updated.length < sparkleCount) {
          updated.push({
            id: Math.random().toString(36),
            createdAt: now,
            color: Math.random() > 0.5 ? colors.first : colors.second,
            size: 8 + Math.random() * 8,
            style: {
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              zIndex: 2,
              opacity: 0,
              transform: `scale(0)`
            }
          });
        }
        return updated;
      });
    }, 220);
    return () => clearInterval(interval);
  }, [sparkleCount, colors.first, colors.second]);

  return (
    <span className={cx("relative inline-block", className)}>
      {sparkles.map((s) => (
        <motion.svg
          key={s.id}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: 180 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          width={s.size}
          height={s.size}
          viewBox="0 0 24 24"
          fill={s.color}
          className="pointer-events-none absolute"
          style={s.style}
        >
          <path d="M12 0L13.5 9L24 12L13.5 15L12 24L10.5 15L0 12L10.5 9z" />
        </motion.svg>
      ))}
      <span className="relative z-10">{text}</span>
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 13. AnimatedShinyText — shimmer that travels across text
 * ────────────────────────────────────────────────────────────────────── */
export function AnimatedShinyText({
  children,
  className = "",
  shimmerWidth = 100
}: {
  children: React.ReactNode;
  className?: string;
  shimmerWidth?: number;
}) {
  return (
    <span
      style={{ "--shimmer-width": `${shimmerWidth}px` } as React.CSSProperties}
      className={cx(
        "mx-auto inline-block max-w-md text-on-surface-variant",
        "animate-shiny-text bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shimmer-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",
        "bg-gradient-to-r from-transparent via-on-surface/80 via-50% to-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 14. AnimatedGradientText — moving multi-color gradient text
 * ────────────────────────────────────────────────────────────────────── */
export function AnimatedGradientText({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline animate-gradient bg-gradient-to-r from-[#34D399] via-[#84CC16] via-[#10B981] to-[#34D399] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent",
        className
      )}
      style={{ "--bg-size": "300%" } as React.CSSProperties}
    >
      {children}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 15. DotPattern (component) — SVG dot grid background
 * ────────────────────────────────────────────────────────────────────── */
export function DotPattern({
  width = 16,
  height = 16,
  glow = false,
  className = ""
}: {
  width?: number;
  height?: number;
  glow?: boolean;
  className?: string;
}) {
  const id = React.useId();
  return (
    <svg
      aria-hidden="true"
      className={cx(
        "pointer-events-none absolute inset-0 h-full w-full fill-on-surface-variant/30",
        className
      )}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={0} y={0}>
          <circle cx={1} cy={1} r={1} className={glow ? "fill-tertiary/40" : "fill-on-surface-variant/15"} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 16. AnimatedGridPattern (component) — flickering grid
 * ────────────────────────────────────────────────────────────────────── */
export function AnimatedGridPattern({
  width = 40,
  height = 40,
  className = "",
  numSquares = 50
}: {
  width?: number;
  height?: number;
  className?: string;
  numSquares?: number;
}) {
  const id = React.useId();
  const squares = React.useMemo(
    () =>
      Array.from({ length: numSquares }, () => ({
        x: Math.floor(Math.random() * 30),
        y: Math.floor(Math.random() * 30),
        delay: Math.random() * 6
      })),
    [numSquares]
  );
  return (
    <svg
      aria-hidden="true"
      className={cx(
        "pointer-events-none absolute inset-0 h-full w-full fill-transparent stroke-on-surface-variant/10",
        className
      )}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse">
          <path d={`M ${width} 0 L 0 0 0 ${height}`} fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      {squares.map((s, i) => (
        <rect
          key={i}
          width={width}
          height={height}
          x={s.x * width}
          y={s.y * height}
          fill="currentColor"
          className="animate-grid-flicker"
          style={{ animationDelay: `${s.delay}s` }}
        />
      ))}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 17. iPhone15Pro — SVG phone-mock frame wrapping arbitrary content
 * ────────────────────────────────────────────────────────────────────── */
export function IPhone15Pro({
  className = "",
  children
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cx("relative mx-auto", className)} style={{ width: 320, height: 640 }}>
      <div className="absolute inset-0 rounded-[44px] border-[3px] border-[#1a1a1a] bg-black shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(255,255,255,0.05)]">
        <div className="absolute left-1/2 top-2 z-30 flex h-7 w-32 -translate-x-1/2 items-center justify-center rounded-full bg-black">
          <div className="h-2 w-2 rounded-full bg-[#1a1a1a]" />
        </div>
        <div className="absolute inset-2 overflow-hidden rounded-[36px] bg-surface">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 18. AnimatedSubscribeButton — three-state press button
 * ────────────────────────────────────────────────────────────────────── */
export function AnimatedSubscribeButton({
  subscribed,
  setSubscribed,
  className = "",
  initialText = "Connect",
  changeText = "Connected ✓"
}: {
  subscribed: boolean;
  setSubscribed: (v: boolean) => void;
  className?: string;
  initialText?: React.ReactNode;
  changeText?: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      {subscribed ? (
        <motion.button
          key="changeText"
          type="button"
          onClick={() => setSubscribed(false)}
          className={cx(
            "relative flex h-10 w-fit items-center justify-center overflow-hidden rounded-md border border-success/40 bg-success/10 px-6 text-success",
            className
          )}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
        >
          {changeText}
        </motion.button>
      ) : (
        <motion.button
          key="initialText"
          type="button"
          onClick={() => setSubscribed(true)}
          className={cx(
            "relative flex h-10 w-fit cursor-pointer items-center justify-center rounded-md border border-primary/40 bg-primary px-6 text-on-primary",
            className
          )}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
        >
          {initialText}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 19. WordRotate — cycles through words
 * ────────────────────────────────────────────────────────────────────── */
export function WordRotate({
  words,
  duration = 2500,
  framerProps = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.25, ease: "easeOut" }
  },
  className = ""
}: {
  words: string[];
  duration?: number;
  framerProps?: Variants & { transition?: object };
  className?: string;
}) {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), duration);
    return () => clearInterval(id);
  }, [words, duration]);
  return (
    <span className="overflow-hidden inline-block">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          {...(framerProps as object)}
          className={cx("inline-block", className)}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 20. BlurFade — fade + blur in on scroll-into-view
 * ────────────────────────────────────────────────────────────────────── */
export function BlurFade({
  children,
  className = "",
  delay = 0,
  duration = 0.4,
  yOffset = 6
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: "blur(6px)", y: yOffset }}
      animate={
        inView || reduced
          ? { opacity: 1, filter: "blur(0px)", y: 0 }
          : { opacity: 0, filter: "blur(6px)", y: yOffset }
      }
      transition={{ duration, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 21. TypingAnimation — types text character-by-character
 * ────────────────────────────────────────────────────────────────────── */
export function TypingAnimation({
  text,
  duration = 50,
  className = ""
}: {
  text: string;
  duration?: number;
  className?: string;
}) {
  const [out, setOut] = React.useState("");
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    if (i < text.length) {
      const id = setTimeout(() => {
        setOut((prev) => prev + text.charAt(i));
        setI((c) => c + 1);
      }, duration);
      return () => clearTimeout(id);
    }
  }, [i, text, duration]);
  return <span className={className}>{out || " "}</span>;
}

/* ──────────────────────────────────────────────────────────────────────
 * 22. RetroGrid — perspective grid floor for hero
 * ────────────────────────────────────────────────────────────────────── */
export function RetroGrid({
  className = "",
  angle = 65
}: {
  className?: string;
  angle?: number;
}) {
  return (
    <div
      className={cx(
        "pointer-events-none absolute inset-0 size-full overflow-hidden opacity-50 [perspective:200px]",
        className
      )}
      style={{ "--grid-angle": `${angle}deg` } as React.CSSProperties}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div
          className="animate-grid"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(34,211,238,0.18) 1px, transparent 0), linear-gradient(to bottom, rgba(34,211,238,0.18) 1px, transparent 0)",
            backgroundSize: "60px 60px",
            backgroundRepeat: "repeat",
            height: "300vh",
            width: "600vw",
            marginLeft: "-50%",
            transformOrigin: "100% 0 0",
            inset: 0,
            position: "absolute"
          }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent to-90%" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 23. Spotlight — gradient spotlight that follows cursor
 * ────────────────────────────────────────────────────────────────────── */
export function Spotlight({
  className = "",
  fill = "rgba(34, 211, 238, 0.35)"
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg
      className={cx(
        "pointer-events-none absolute z-[1] h-[169%] w-[138%] animate-spotlight opacity-0 lg:w-[84%]",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter)">
        <ellipse cx="1924.71" cy="273.501" rx="1924.71" ry="273.501" transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)" fill={fill}></ellipse>
      </g>
      <defs>
        <filter id="filter" x="0.860352" y="0.838989" width="3785.16" height="2840.26" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8"></feGaussianBlur>
        </filter>
      </defs>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 24. PulsatingButton — single critical-state CTA only (one per page!)
 * ────────────────────────────────────────────────────────────────────── */
export function PulsatingButton({
  children,
  pulseColor = "rgba(255,77,46,0.6)",
  duration = 1.6,
  className = "",
  onClick
}: {
  children: React.ReactNode;
  pulseColor?: string;
  duration?: number;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "relative inline-flex items-center justify-center rounded-full bg-error px-5 py-2 text-sm font-semibold text-on-error",
        className
      )}
      style={{ "--pulse-color": pulseColor, "--duration": `${duration}s` } as React.CSSProperties}
    >
      <div className="relative z-10 flex items-center gap-2">{children}</div>
      <div className="pointer-events-none absolute inset-0 size-full animate-pulse-ring rounded-full bg-inherit" />
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * 25. ScrollProgress — bar at top of page tied to scroll position
 * ────────────────────────────────────────────────────────────────────── */
export function ScrollProgress({ className = "" }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 50,
    restDelta: 0.001
  });
  return (
    <motion.div
      className={cx(
        "pointer-events-none fixed inset-x-0 top-0 z-[200] h-[2px] origin-left bg-gradient-to-r from-tertiary via-primary to-error",
        className
      )}
      style={{ scaleX }}
    />
  );
}
