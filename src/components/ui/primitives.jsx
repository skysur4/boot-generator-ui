import React from "react";
import { IconChevronDown, IconPlus } from "./icons";

/* ── 배지 ────────────────────────────────────────────────── */
export function Badge({ tone = "", mono, role, xs, children, title, className = "" }) {
    const cls = [
        "badge",
        tone ? `badge-${tone}` : "",
        mono ? "badge-mono" : "",
        role ? "badge-role" : "",
        xs ? "badge-xs" : "",
        className,
    ].filter(Boolean).join(" ");
    return <span className={cls} title={title}>{children}</span>;
}

/* ── 카드 ────────────────────────────────────────────────── */
export function Card({ children, style, className = "" }) {
    return <div className={`card ${className}`} style={style}>{children}</div>;
}

export function CardHead({ icon, title, hint, actions }) {
    return (
        <div className="card-head">
            {icon && <span className="card-ico">{icon}</span>}
            <h3 className="card-title">{title}</h3>
            {hint && <span className="card-hint" style={{ marginLeft: "auto" }}>{hint}</span>}
            {actions && <span style={{ marginLeft: hint ? 6 : "auto", display: "flex", gap: 6 }}>{actions}</span>}
        </div>
    );
}

export function CardBody({ children, className = "" }) {
    return <div className={`card-body ${className}`}>{children}</div>;
}

/* ── 섹션 헤더 ───────────────────────────────────────────── */
export function SectionHead({ icon, title, desc, path, tone = "" }) {
    return (
        <div className={`section-head ${tone ? `tone-${tone}` : ""}`}>
            {icon && <span className="section-ico">{icon}</span>}
            <h2 className="section-title">{title}</h2>
            {desc && <span className="section-desc">{desc}</span>}
            {path && <span className="section-path">{path}</span>}
        </div>
    );
}

/* ── 서브그룹 라벨 ───────────────────────────────────────── */
export function SubGroup({ icon, children, count, optional, action, note }) {
    return (
        <>
            <div className="subgroup">
                {icon}
                <span>{children}</span>
                {count !== undefined && <span className="sg-cnt">{count}</span>}
                {optional && <span className="sg-opt">선택</span>}
                {action && <span className="sg-act">{action}</span>}
            </div>
            {note && <div className="subgroup-note">{note}</div>}
        </>
    );
}

/* ── 아코디언 ────────────────────────────────────────────── */
export function Accordion({ open, onToggle, idx, name, desc, summary, tone = "", children }) {
    return (
        <div className={`acc ${open ? "open" : ""} ${tone ? `tone-${tone}` : ""}`}>
            <button type="button" className="acc-head" onClick={onToggle} aria-expanded={open}>
                <span className="acc-idx">{idx}</span>
                <span style={{ minWidth: 0, flexShrink: 0 }}>
                    <span className="acc-name" style={{ display: "block" }}>{name}</span>
                    {desc && <span className="acc-desc" style={{ display: "block" }}>{desc}</span>}
                </span>
                {summary && <span className="acc-summary">{summary}</span>}
                <IconChevronDown size={16} className="acc-caret" />
            </button>
            {open && <div className="acc-body">{children}</div>}
        </div>
    );
}

/* ── 기타 ────────────────────────────────────────────────── */
export function EmptyBox({ icon, children }) {
    return (
        <div className="empty">
            {icon && <div style={{ opacity: .5, marginBottom: 7, display: "flex", justifyContent: "center" }}>{icon}</div>}
            {children}
        </div>
    );
}

export function AddButton({ onClick, children, block, sm = true }) {
    return (
        <button
            type="button"
            className={`btn ${sm ? "btn-sm" : ""} btn-dashed ${block ? "btn-block" : ""}`}
            onClick={onClick}
        >
            <IconPlus size={sm ? 13 : 15} />
            {children}
        </button>
    );
}

export function Note({ icon, warn, children }) {
    return (
        <div className={`note ${warn ? "note-warn" : ""}`}>
            {icon}
            <div>{children}</div>
        </div>
    );
}
