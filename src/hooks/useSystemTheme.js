import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "boot-generator-theme";   // 'light' | 'dark' | null(=시스템)

function systemPrefersDark() {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function readOverride() {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        return saved === "light" || saved === "dark" ? saved : null;
    } catch {
        return null;
    }
}

/**
 * 시스템 테마를 따르되 사용자가 수동으로 덮어쓸 수 있다.
 * <html> 에 .dark 클래스를 붙이고, index.css 의 @custom-variant 가 이를 받는다.
 */
export function useSystemTheme() {
    const [override, setOverride] = useState(readOverride);
    const [systemDark, setSystemDark] = useState(systemPrefersDark);

    // 시스템 설정 변화 추적
    useEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = (e) => setSystemDark(e.matches);
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
    }, []);

    const isDark = override ? override === "dark" : systemDark;

    // <html> 클래스 반영
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("dark", isDark);
        root.style.colorScheme = isDark ? "dark" : "light";
    }, [isDark]);

    const toggleTheme = useCallback(() => {
        const next = isDark ? "light" : "dark";
        setOverride(next);
        try { window.localStorage.setItem(STORAGE_KEY, next); } catch { /* 무시 */ }
    }, [isDark]);

    const useSystem = useCallback(() => {
        setOverride(null);
        try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* 무시 */ }
    }, []);

    return { isDark, toggleTheme, useSystem, isOverridden: override !== null };
}
