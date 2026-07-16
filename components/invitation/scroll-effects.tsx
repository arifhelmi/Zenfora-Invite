"use client";

import { useEffect } from "react";

export function InvitationScrollEffects() {
  useEffect(() => {
    const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-cultural-theme] [data-invitation-reveal]"));
    const roots = Array.from(new Set(panels.map((panel) => panel.closest<HTMLElement>("[data-cultural-theme]")).filter(Boolean)));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      panels.forEach((panel) => panel.classList.add("is-visible"));
      return;
    }

    roots.forEach((root) => root?.classList.add("motion-ready"));
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        entry.target.classList.toggle("is-motion-active", entry.isIntersecting);
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      }),
      { threshold: 0.12, rootMargin: "10% 0px -8%" },
    );

    panels.forEach((panel) => observer.observe(panel));
    return () => {
      observer.disconnect();
      roots.forEach((root) => root?.classList.remove("motion-ready"));
    };
  }, []);

  return null;
}
