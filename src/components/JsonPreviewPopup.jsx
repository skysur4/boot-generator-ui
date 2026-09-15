import React from "react";
import { maskSecrets } from "../config/rules";
import { IconCode, IconX } from "./ui/icons";

export default function JsonPreviewPopup({ open, profile, title = "JSON Preview", onClose }) {
    const [showSecrets, setShowSecrets] = React.useState(false);
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        if (!open) { setShowSecrets(false); setCopied(false); }
    }, [open]);

    React.useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const json = React.useMemo(() => {
        const source = profile ?? {};
        return JSON.stringify(showSecrets ? source : maskSecrets(source), null, 2);
    }, [profile, showSecrets]);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(profile ?? {}, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            setCopied(false);
        }
    };

    return (
        <>
            <div className={`scrim ${open ? "on" : ""}`} onClick={onClose} />
            <aside className={`drawer ${open ? "on" : ""}`} aria-hidden={!open}>
                <div className="drawer-head">
                    <IconCode size={16} style={{ color: "var(--fg-3)", flexShrink: 0 }} />
                    <h3 style={{ fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {title}
                    </h3>
                    <button
                        type="button"
                        className="btn btn-sm"
                        style={{ marginLeft: "auto" }}
                        onClick={() => setShowSecrets((s) => !s)}
                    >
                        {showSecrets ? "비밀값 가리기" : "비밀값 표시"}
                    </button>
                    <button type="button" className="btn btn-sm" onClick={copy}>
                        {copied ? "복사됨" : "복사"}
                    </button>
                    <button type="button" className="btn btn-icon btn-ghost" onClick={onClose} aria-label="닫기">
                        <IconX size={15} />
                    </button>
                </div>
                <div className="drawer-body">
                    <pre>{json}</pre>
                </div>
            </aside>
        </>
    );
}
