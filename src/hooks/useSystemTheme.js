import { useEffect, useState } from "react";

export function useSystemTheme() {
    // 1. Helper function to check if the browser window prefers dark mode
    const getSystemPreference = () => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    };

    const [isDark, setIsDark] = useState(getSystemPreference);

    useEffect(() => {
        const root = window.document.documentElement;
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        // 2. Define handler to update state when window preferences change live
        const handleChange = (e) => {
            setIsDark(e.matches);
        };

        // 3. Apply the correct Tailwind class to the HTML tag
        if (isDark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        // 4. Listen for system/window theme changes while the user is on the site
        mediaQuery.addEventListener("change", handleChange);

        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [isDark]);

    return { isDark };
}