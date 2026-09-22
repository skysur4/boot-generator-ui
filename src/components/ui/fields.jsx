import React from "react";
import { IconEye, IconEyeOff, IconLock, IconGrip, IconX } from "./icons";

let uid = 0;
const nextId = () => `f${++uid}`;

/* ── 공통 라벨 ───────────────────────────────────────────── */
export function FieldLabel({ children, required, tag, tagTone = "", title }) {
    return (
        <span className="f-label" title={title}>
            {children}
            {required && <span className="f-req">*</span>}
            {tag && <span className={`f-tag ${tagTone ? `f-tag-${tagTone}` : ""}`}>{tag}</span>}
        </span>
    );
}

export function Field({ label, required, tag, tagTone, hint, children, className = "" }) {
    return (
        <div className={className}>
            {label && <FieldLabel required={required} tag={tag} tagTone={tagTone}>{label}</FieldLabel>}
            {children}
            {hint && <div className="f-hint">{hint}</div>}
        </div>
    );
}

/* ── 텍스트 ──────────────────────────────────────────────── */
export function TextField({ label, value, onChange, required, hint, tag, tagTone, ui, disabled, placeholder }) {
    return (
        <Field label={label} required={required} hint={hint} tag={tag} tagTone={tagTone}>
            <input
                type="text"
                className={`input ${ui ? "input-ui" : ""}`}
                value={value ?? ""}
                disabled={disabled}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
            />
        </Field>
    );
}

/**
 * 숫자 필드. 원본이 문자열이면 문자열로 되돌려준다.
 * 샘플 JSON 의 localPort 가 "8081" (문자열)인데
 * createEmptyProject 는 8081 (숫자)로 만들어 타입이 갈리던 문제를 막는다.
 */
export function NumberField({ label, value, onChange, hint, disabled, width }) {
    const wasString = typeof value === "string";
    return (
        <Field label={label} hint={hint}>
            <input
                type="text"
                inputMode="numeric"
                className="input"
                style={width ? { maxWidth: width } : undefined}
                value={value ?? ""}
                disabled={disabled}
                onChange={(e) => {
                    const raw = e.target.value;
                    if (raw !== "" && !/^-?\d*$/.test(raw)) return;
                    if (raw === "") return onChange(wasString ? "" : null);
                    onChange(wasString ? raw : Number(raw));
                }}
            />
        </Field>
    );
}

/* ── 여러 줄 텍스트 ──────────────────────────────────────── */
export function TextAreaField({ label, value, onChange, hint, rows = 3, placeholder, disabled }) {
    return (
        <Field label={label} hint={hint}>
            <textarea
                className="input textarea input-ui"
                rows={rows}
                value={value ?? ""}
                placeholder={placeholder}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
            />
        </Field>
    );
}

/* ── 슬라이더 (0~100 같은 정수 구간) ─────────────────────── */
export function RangeField({
    label, value, onChange, hint,
    min = 0, max = 100, step = 1, unit = "", marks = [],
}) {
    const current = Number.isFinite(Number(value)) ? Number(value) : min;
    return (
        <Field label={label} hint={hint}>
            <div className="range-row">
                <input
                    type="range"
                    className="range"
                    min={min}
                    max={max}
                    step={step}
                    value={current}
                    onChange={(e) => onChange(Number(e.target.value))}
                />
                <input
                    className="input range-num"
                    inputMode="numeric"
                    value={current}
                    onChange={(e) => {
                        const raw = e.target.value;
                        if (raw !== "" && !/^\d*$/.test(raw)) return;
                        const n = raw === "" ? min : Number(raw);
                        onChange(Math.min(max, Math.max(min, n)));
                    }}
                />
                {unit && <span className="range-unit">{unit}</span>}
            </div>
            {marks.length > 0 && (
                <div className="range-marks">
                    {marks.map((m) => (
                        <button
                            key={m.value}
                            type="button"
                            className={`range-mark ${current === m.value ? "on" : ""}`}
                            onClick={() => onChange(m.value)}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            )}
        </Field>
    );
}

/* ── 비밀값 ──────────────────────────────────────────────── */
export function SecretField({ label, value, onChange, hint, disabled }) {
    const [shown, setShown] = React.useState(false);
    return (
        <Field label={label} hint={hint}>
            <div className="secret">
                <input
                    type={shown ? "text" : "password"}
                    className="input"
                    value={value ?? ""}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                />
                <button
                    type="button"
                    className="eye"
                    onClick={() => setShown((s) => !s)}
                    aria-label={shown ? "값 가리기" : "값 보기"}
                    title={shown ? "값 가리기" : "값 보기"}
                >
                    {shown ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                </button>
            </div>
        </Field>
    );
}

/* ── 세그먼트(단일 선택) ─────────────────────────────────── */
export function SegmentedField({
    label, value, options, onChange, name,
    disabledOptions = [], disabledTitle, hint, tag, tagTone,
}) {
    const group = React.useMemo(() => name || nextId(), [name]);
    return (
        <Field label={label} hint={hint} tag={tag} tagTone={tagTone}>
            <div className="segbar">
                {options.map((option) => {
                    const id = `${group}-${option}`;
                    const blocked = disabledOptions.includes(option);
                    return (
                        <React.Fragment key={option}>
                            <input
                                type="radio"
                                id={id}
                                name={group}
                                checked={value === option}
                                disabled={blocked}
                                onChange={() => onChange(option)}
                            />
                            <label htmlFor={id} title={blocked ? disabledTitle : undefined}>{option}</label>
                        </React.Fragment>
                    );
                })}
            </div>
        </Field>
    );
}

/* ── 칩(단일 선택) ───────────────────────────────────────── */
export function ChipRadioField({ label, value, options, onChange, name, hint }) {
    const group = React.useMemo(() => name || nextId(), [name]);
    return (
        <Field label={label} hint={hint}>
            <div className="chipset">
                {options.map((option) => (
                    <label key={option} className={`chip ${value === option ? "on" : ""}`}>
                        <input
                            type="radio"
                            name={group}
                            checked={value === option}
                            onChange={() => onChange(option)}
                        />
                        <span className="chip-dot" />
                        {option}
                    </label>
                ))}
            </div>
        </Field>
    );
}

/* ── 토글 ────────────────────────────────────────────────── */
export function Toggle({ name, desc, checked, onChange, locked, lockTitle }) {
    const lockedClass = locked ? `locked ${checked ? "locked-on" : "locked-off"}` : "";
    return (
        <label className={`tog ${lockedClass}`} title={lockTitle}>
            <input
                type="checkbox"
                checked={!!checked}
                disabled={locked}
                onChange={(e) => !locked && onChange(e.target.checked)}
            />
            <span className="sw" />
            <span className="tog-text">
                <span className="tog-name">{name}</span>
                {desc && <span className="tog-sub">{desc}</span>}
            </span>
            {locked && <IconLock size={11} className="tog-lock" />}
        </label>
    );
}

/* ── 리스트 행 ───────────────────────────────────────────── */
export function ListRow({ children, onRemove, removeLabel = "삭제" }) {
    return (
        <div className="lrow">
            <span className="grip" aria-hidden="true"><IconGrip size={14} /></span>
            {children}
            {onRemove && (
                <button type="button" className="x-btn" onClick={onRemove} aria-label={removeLabel} title={removeLabel}>
                    <IconX size={14} />
                </button>
            )}
        </div>
    );
}
