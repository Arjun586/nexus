import { useSyncExternalStore } from "react";

type AppColorScheme = "light" | "dark";

const getAppColorScheme = (): AppColorScheme => {
  const root = document.documentElement;
  const dataTheme = root.getAttribute("data-theme");

  if (dataTheme === "dark" || root.classList.contains("dark")) {
    return "dark";
  }

  return "light";
};

const subscribeToAppColorScheme = (onStoreChange: () => void) => {
  const observer = new MutationObserver(onStoreChange);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });

  return () => observer.disconnect();
};

/** Resolves the app shell's light/dark mode for tldraw's colorScheme prop. */
const useAppColorScheme = (): AppColorScheme => {
  return useSyncExternalStore(
    subscribeToAppColorScheme,
    getAppColorScheme,
    () => "light",
  );
};

export default useAppColorScheme;
