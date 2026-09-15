import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/ko.js";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { IconSearch, IconLock, IconPlus } from "./ui/icons";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale("ko");

const TEMPLATE = "template";

function relative(value) {
    if (!value) return "-";
    const d = dayjs(value);
    return d.isValid() ? d.tz("Asia/Seoul").fromNow() : "-";
}

function summarize(profile) {
    if (!profile) return "";
    const backends = Array.isArray(profile.projects) ? profile.projects.length : 0;
    const parts = [`${backends} backend`];
    if (profile.gateway) parts.push("+gateway");
    if (profile.notification) parts.push("+notifier");
    return parts.join(" · ");
}

export default function ProfileList({ selected, profiles, dirtyNames = [], onSelect, addProfile }) {
    const [query, setQuery] = React.useState("");

    const entries = React.useMemo(() => {
        const all = Object.entries(profiles || {});
        const q = query.trim().toLowerCase();
        if (!q) return all;
        return all.filter(([name, profile]) =>
            name.toLowerCase().includes(q) ||
            String(profile?.description ?? "").toLowerCase().includes(q)
        );
    }, [profiles, query]);

    return (
        <div className="h-full flex flex-col">
            <div className="rail-head">
                <div className="flex items-center justify-between mb-[9px]">
                    <h2 className="rail-label">Profiles</h2>
                    <span className="count-pill">{Object.keys(profiles || {}).length}</span>
                </div>
                <div className="search">
                    <IconSearch size={14} />
                    <input
                        value={query}
                        placeholder="프로필 검색…"
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {entries.length === 0 && (
                    <div className="empty" style={{ marginTop: 8 }}>
                        {query ? "검색 결과 없음" : "프로필 없음"}
                    </div>
                )}

                {entries.map(([name, profile]) => {
                    const isTemplate = name === TEMPLATE;
                    const dirty = dirtyNames.includes(name);
                    return (
                        <button
                            key={name}
                            type="button"
                            className={`pitem ${name === selected ? "active" : ""}`}
                            onClick={() => onSelect(name)}
                        >
                            <div className="flex items-center gap-[6px] mb-[3px]">
                                <span className={`dot ${dirty ? "dot-dirty" : "dot-clean"}`} />
                                <span className="pitem-name">{name}</span>
                                {isTemplate && <IconLock size={12} style={{ color: "var(--fg-3)", marginLeft: "auto", flexShrink: 0 }} />}
                            </div>
                            <div className="pitem-desc">{profile?.description || "-"}</div>
                            <div className="pitem-meta">
                                {isTemplate ? "읽기 전용" : summarize(profile)} · {relative(profile?.editedAt)}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="p-[10px] border-t" style={{ borderColor: "var(--line-soft)" }}>
                <button type="button" className="btn btn-dashed btn-block" onClick={addProfile}>
                    <IconPlus size={15} />새 프로필
                </button>
            </div>
        </div>
    );
}
