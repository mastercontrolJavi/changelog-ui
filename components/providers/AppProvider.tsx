"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CommandPalette from "@/components/CommandPalette";
import ShortcutsOverlay from "@/components/ShortcutsOverlay";
import ToastStack from "@/components/ToastStack";

export type Theme = "dark" | "light";
export type Density = "comfortable" | "compact";

export type Toast = { id: number; message: string; tone: "info" | "success" };

type AppContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  density: Density;
  toggleDensity: () => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  shortcutsOpen: boolean;
  setShortcutsOpen: (open: boolean) => void;
  toasts: Toast[];
  toast: (message: string, tone?: Toast["tone"]) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

/** True when the event target is a place where a bare letter is real typing. */
export function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return false;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    el.isContentEditable
  );
}

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [density, setDensity] = useState<Density>("comfortable");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  /* Read what the bootstrap script already applied, so React state and the DOM
     agree without a second paint. */
  useEffect(() => {
    const root = document.documentElement;
    setTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark");
    setDensity(
      root.getAttribute("data-density") === "compact" ? "compact" : "comfortable",
    );
  }, []);

  const applyTheme = useCallback((next: Theme) => {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("cl:theme", next);
    } catch {
      /* storage blocked — the in-memory value still applies for this session */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(document.documentElement.getAttribute("data-theme") === "light"
      ? "dark"
      : "light");
  }, [applyTheme]);

  const toggleDensity = useCallback(() => {
    const next: Density =
      document.documentElement.getAttribute("data-density") === "compact"
        ? "comfortable"
        : "compact";
    setDensity(next);
    document.documentElement.setAttribute("data-density", next);
    try {
      localStorage.setItem("cl:density", next);
    } catch {
      /* non-fatal */
    }
  }, []);

  const toast = useCallback((message: string, tone: Toast["tone"] = "info") => {
    const id = ++toastId.current;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  /* Global shortcuts. Sequence keys (g h / g s) use a short-lived prefix so
     they never collide with single-key shortcuts. */
  useEffect(() => {
    let prefix: string | null = null;
    let prefixTimer: number | undefined;

    const clearPrefix = () => {
      prefix = null;
      window.clearTimeout(prefixTimer);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;

      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }

      if (event.key === "Escape") {
        clearPrefix();
        return;
      }

      if (isTypingTarget(event.target) || event.altKey || mod) return;

      if (prefix === "g") {
        const key = event.key.toLowerCase();
        clearPrefix();
        if (key === "h") {
          event.preventDefault();
          window.location.assign("/");
          return;
        }
        if (key === "s") {
          event.preventDefault();
          window.location.assign("/studio");
          return;
        }
        return;
      }

      if (event.key === "g") {
        prefix = "g";
        prefixTimer = window.setTimeout(clearPrefix, 1200);
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        setShortcutsOpen((open) => !open);
        return;
      }

      if (event.key.toLowerCase() === "t") {
        event.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(prefixTimer);
    };
  }, [toggleTheme]);

  /* Lock the page behind any open overlay. */
  useEffect(() => {
    const locked = paletteOpen || shortcutsOpen;
    document.body.classList.toggle("no-scroll", locked);
    return () => document.body.classList.remove("no-scroll");
  }, [paletteOpen, shortcutsOpen]);

  const value = useMemo<AppContextValue>(
    () => ({
      theme,
      toggleTheme,
      density,
      toggleDensity,
      paletteOpen,
      setPaletteOpen,
      shortcutsOpen,
      setShortcutsOpen,
      toasts,
      toast,
    }),
    [
      theme,
      toggleTheme,
      density,
      toggleDensity,
      paletteOpen,
      shortcutsOpen,
      toasts,
      toast,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <CommandPalette />
      <ShortcutsOverlay />
      <ToastStack />
    </AppContext.Provider>
  );
}
