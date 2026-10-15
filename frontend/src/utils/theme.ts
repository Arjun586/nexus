import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "nexus-theme";

/**
 * Returns the currently active or saved theme.
 */
export const getTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

/**
 * Directly updates DOM classes and attributes for the given theme.
 */
export const applyThemeToDom = (theme: Theme) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  }
};

type ThemeListener = (theme: Theme) => void;
const listeners = new Set<ThemeListener>();

export const onThemeChange = (callback: ThemeListener) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

const notifyListeners = (theme: Theme) => {
  listeners.forEach((listener) => {
    try {
      listener(theme);
    } catch (e) {
      console.error(e);
    }
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("nexus-theme-change", { detail: theme }));
  }
};

/**
 * Fallback circular reveal animation when View Transitions API is not available
 */
const runFallbackThemeSpread = (
  x: number,
  y: number,
  endRadius: number,
  nextTheme: Theme,
) => {
  const overlay = document.createElement("div");
  overlay.className = "nexus-theme-fallback-overlay";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.zIndex = "999999";
  overlay.style.pointerEvents = "none";
  overlay.style.backgroundColor = nextTheme === "dark" ? "#0e0f14" : "#faf8ff";
  overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
  overlay.style.transition = "clip-path 650ms cubic-bezier(0.22, 1, 0.36, 1)";
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`;
  });

  setTimeout(() => {
    applyThemeToDom(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    notifyListeners(nextTheme);
    overlay.style.transition = "opacity 200ms ease-out";
    overlay.style.opacity = "0";
    setTimeout(() => {
      overlay.remove();
    }, 220);
  }, 500);
};

let isTransitioning = false;

/**
 * Toggles theme with an expanding circular wave animation originating from the button click point
 */
export const toggleThemeWithAnimation = (
  event?: React.MouseEvent | MouseEvent | null,
) => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (isTransitioning) return;

  const currentTheme = getTheme();
  const nextTheme: Theme = currentTheme === "dark" ? "light" : "dark";

  // Calculate originating coordinate (x, y)
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;

  if (event) {
    if (
      typeof event.clientX === "number" &&
      typeof event.clientY === "number" &&
      (event.clientX !== 0 || event.clientY !== 0)
    ) {
      x = event.clientX;
      y = event.clientY;
    } else if (
      event.currentTarget &&
      event.currentTarget instanceof HTMLElement
    ) {
      const rect = event.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
  }

  // Calculate maximum distance to cover all four screen corners
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const doc = document as Document & {
    startViewTransition?: (updateCallback: () => void) => {
      ready: Promise<void>;
      finished: Promise<void>;
    };
  };

  const hasViewTransition =
    typeof doc.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!hasViewTransition) {
    runFallbackThemeSpread(x, y, endRadius, nextTheme);
    return;
  }

  isTransitioning = true;

  try {
    const transition = doc.startViewTransition(() => {
      applyThemeToDom(nextTheme);
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      notifyListeners(nextTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      const anim = document.documentElement.animate(
        {
          clipPath,
        },
        {
          duration: 650,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );

      anim.onfinish = () => {
        isTransitioning = false;
      };
      anim.oncancel = () => {
        isTransitioning = false;
      };
    }).catch(() => {
      isTransitioning = false;
    });

    transition.finished.finally(() => {
      isTransitioning = false;
    });
  } catch {
    applyThemeToDom(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    notifyListeners(nextTheme);
    isTransitioning = false;
  }
};

/**
 * React hook to observe theme and trigger animated changes
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => getTheme());

  useEffect(() => {
    // Initial sync
    setTheme(getTheme());
    return onThemeChange((newTheme) => {
      setTheme(newTheme);
    });
  }, []);

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme: toggleThemeWithAnimation,
  };
};
