"use client";

import { useRef, useEffect, useState, ReactNode } from "react";

interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: "fade-in-up" | "fade-in-down" | "slide-in-left" | "slide-in-right" | "scale-in" | "flip-in";
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function AnimateOnScroll({
  children,
  animation = "fade-in-up",
  delay = 0,
  duration = 600,
  className = "",
  once = true,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) observer.unobserve(element);
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "none"
          : animation === "fade-in-up"
          ? "translateY(30px)"
          : animation === "fade-in-down"
          ? "translateY(-30px)"
          : animation === "slide-in-left"
          ? "translateX(-30px)"
          : animation === "slide-in-right"
          ? "translateX(30px)"
          : animation === "scale-in"
          ? "scale(0.9)"
          : animation === "flip-in"
          ? "perspective(400px) rotateY(-10deg)"
          : "none",
      }}
    >
      {children}
    </div>
  );
}

export function StaggerChildren({
  children,
  staggerDelay = 100,
  animation = "fade-in-up",
  className = "",
}: {
  children: ReactNode[];
  staggerDelay?: number;
  animation?: AnimateOnScrollProps["animation"];
  className?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <AnimateOnScroll key={i} animation={animation} delay={i * staggerDelay}>
          {child}
        </AnimateOnScroll>
      ))}
    </div>
  );
}
