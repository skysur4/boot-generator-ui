import React from "react";
import { IconCheck, IconWarn } from "./ui/icons";

export default function ToastAlert({ isOpen, message, tone = "ok", onClose }) {
    React.useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [isOpen, message, onClose]);

    return (
        <div className={`toast ${isOpen ? "on" : ""}`} role="status" aria-live="polite">
            <span className={`toast-ico ${tone === "error" ? "err" : ""}`}>
                {tone === "error" ? <IconWarn size={11} /> : <IconCheck size={11} />}
            </span>
            <span>{message}</span>
        </div>
    );
}
