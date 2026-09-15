import React, { useState, useEffect } from "react";
import dayjs from "dayjs";

import ProfileList from "./components/ProfileList";
import ProfileDetail from "./components/ProfileDetail";
import JsonPreviewPopup from "./components/JsonPreviewPopup";
import ToastAlert from "./components/ToastAlert";
import { useSystemTheme } from "./hooks/useSystemTheme";
import { fetchProfiles, saveProfile, deleteProfile, generateProfile } from "./api";
import {
    IconLeaf, IconTrash, IconCommit, IconUpload, IconCode,
    IconSparkles, IconMoon, IconSun,
} from "./components/ui/icons";

const DEFAULT_PROFILE_NAME = "template";

export default function App() {
    const { isDark, toggleTheme } = useSystemTheme();

    const [profiles, setProfiles] = useState({});
    const [selected, setSelected] = useState("");
    const [editingProfile, setEditingProfile] = useState(null);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [toast, setToast] = useState({ open: false, message: "", tone: "ok" });

    const isTemplate = selected === DEFAULT_PROFILE_NAME;

    /* ── 초기 로드 ─────────────────────────────────────── */
    useEffect(() => { loadProfiles(); }, []);

    const loadProfiles = async () => {
        try {
            const data = await fetchProfiles();
            const map = data || {};
            setProfiles(map);

            const first = map[DEFAULT_PROFILE_NAME] ? DEFAULT_PROFILE_NAME : Object.keys(map)[0];
            if (first) {
                setSelected(first);
                setEditingProfile(JSON.parse(JSON.stringify(map[first])));
            }
        } catch (error) {
            console.error("프로필 로드 실패:", error);
            showToast("프로필을 불러오지 못했습니다", "error");
        }
    };

    const showToast = (message, tone = "ok") => setToast({ open: true, message, tone });

    /* ── 미저장 변경 여부 ──────────────────────────────── */
    const isDirty =
        !!selected &&
        !!editingProfile &&
        JSON.stringify(profiles[selected]) !== JSON.stringify(editingProfile);

    /* ── 선택 ──────────────────────────────────────────── */
    const handleSelect = (title) => {
        if (title === selected) return;
        if (isDirty && !window.confirm("커밋되지 않은 변경 내용이 있습니다. 이동하면 사라집니다. 계속할까요?")) return;

        setSelected(title);
        const target = profiles[title];
        setEditingProfile(target ? JSON.parse(JSON.stringify(target)) : null);
    };

    /* ── 새 프로필 ─────────────────────────────────────── */
    const handleNewProfile = () => {
        const template = profiles[DEFAULT_PROFILE_NAME];
        if (!template) {
            showToast("template 프로필이 없어 새로 만들 수 없습니다", "error");
            return;
        }
        const now = dayjs();
        const newTitle = `New_Profile_${now.unix()}`;
        const newProfile = JSON.parse(JSON.stringify(template));
        newProfile.editedAt = now.format("YYYY.MM.DD HH:mm:ss");
        newProfile.description = "새 프로필";

        setProfiles((prev) => ({ ...prev, [newTitle]: newProfile }));
        setSelected(newTitle);
        setEditingProfile(newProfile);
    };

    /* ── Commit / Push / Delete / Generate ─────────────── */
    const handleCommit = (profileName) => {
        if (profileName === DEFAULT_PROFILE_NAME) return showToast("template 은 수정할 수 없습니다", "error");
        try {
            setProfiles((prev) => ({ ...prev, [profileName]: editingProfile }));
            showToast("Commit completed");
            setPreviewOpen(true);
        } catch (error) {
            console.error("임시저장 실패:", error);
            showToast("Commit failed", "error");
        }
    };

    const handleSave = async (profileName) => {
        if (profileName === DEFAULT_PROFILE_NAME) return showToast("template 은 Push 할 수 없습니다", "error");
        try {
            if (isDirty) {
                if (!window.confirm("커밋되지 않은 변경 내용이 있습니다. 바로 저장하시겠습니까?")) {
                    return showToast("Push cancelled");
                }
                setProfiles((prev) => ({ ...prev, [profileName]: editingProfile }));
            }
            await saveProfile(profileName, editingProfile);
            showToast("Push completed");
        } catch (error) {
            console.error("Failed to save", error);
            showToast("Push failed", "error");
        }
    };

    const handleRemove = async (profileName) => {
        if (profileName === DEFAULT_PROFILE_NAME) return showToast("template 은 삭제할 수 없습니다", "error");
        if (!window.confirm(`${profileName} 프로필을 삭제하시겠습니까?`)) return showToast("Delete cancelled");

        try {
            await deleteProfile(profileName);
            setProfiles((prev) => {
                const { [profileName]: _removed, ...rest } = prev;
                return rest;
            });
            setSelected("");
            setEditingProfile(null);
            showToast("Delete completed");
        } catch (error) {
            console.error("Failed to remove", error);
            showToast("Delete failed", "error");
        }
    };

    const handleGenerate = async (profileName) => {
        try {
            if (isDirty) return showToast("변경 사항이 있습니다. Push 가 필요합니다", "error");
            await generateProfile(profileName);
            showToast("Generate completed");
        } catch (error) {
            console.error("Failed to generate", error);
            showToast("Generate failed", "error");
        }
    };

    /* ── 편집 ──────────────────────────────────────────── */
    const handleTitleChange = (value) => {
        setProfiles((prev) => {
            if (!(selected in prev)) return prev;
            const { [selected]: target, ...rest } = prev;
            return { ...rest, [value]: target };
        });
        setSelected(value);
    };

    const handleProfileChange = (path, value) => {
        setEditingProfile((prev) => setByPath(prev, path, value));
    };

    function setByPath(object, path, value) {
        if (path.length === 0) return value;

        const result = Array.isArray(object) ? [...object] : { ...(object || {}) };
        const [key, ...rest] = path;

        if (rest.length === 0) {
            if (value === undefined && !Array.isArray(result)) delete result[key];
            else result[key] = value;
            return result;
        }

        result[key] = setByPath(result[key], rest, value);
        return result;
    }

    /* ── 렌더 ──────────────────────────────────────────── */
    const disabled = !selected || !editingProfile;

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <JsonPreviewPopup
                open={previewOpen}
                profile={editingProfile}
                title={`${selected} — JSON Preview`}
                onClose={() => setPreviewOpen(false)}
            />
            <ToastAlert
                isOpen={toast.open}
                message={toast.message}
                tone={toast.tone}
                onClose={() => setToast((t) => ({ ...t, open: false }))}
            />

            {/* ── HEADER ── */}
            <header className="topbar">
                <div className="flex items-center gap-[10px] flex-shrink-0">
                    <span className="brand-mark"><IconLeaf size={17} /></span>
                    <span>
                        <span className="brand-name" style={{ display: "block" }}>Boot Generator</span>
                        <span className="brand-sub" style={{ display: "block" }}>Spring Boot 4.1.1</span>
                    </span>
                </div>

                <div className="crumb">
                    <span className="sep">/</span><b>profiles</b><span className="sep">/</span>
                    <span className="cur">{selected || "—"}</span>
                    {isDirty && <span className="badge badge-w badge-xs">● 변경됨</span>}
                    {isTemplate && <span className="badge badge-xs">읽기 전용</span>}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        type="button"
                        className="btn btn-icon btn-ghost"
                        onClick={toggleTheme}
                        title={isDark ? "라이트 모드" : "다크 모드"}
                        aria-label="테마 전환"
                    >
                        {isDark ? <IconMoon size={15} /> : <IconSun size={15} />}
                    </button>

                    <button
                        type="button"
                        className="btn btn-icon btn-danger"
                        onClick={() => handleRemove(selected)}
                        disabled={disabled || isTemplate}
                        title="프로필 삭제"
                        aria-label="프로필 삭제"
                    >
                        <IconTrash size={15} />
                    </button>

                    <span className="divider-v" />

                    <div className="seg-group">
                        <button type="button" className="btn" onClick={() => handleCommit(selected)} disabled={disabled || isTemplate}>
                            <IconCommit size={15} />Commit
                        </button>
                        <button type="button" className="btn" onClick={() => handleSave(selected)} disabled={disabled || isTemplate}>
                            <IconUpload size={15} />Push
                        </button>
                        <button type="button" className="btn" onClick={() => setPreviewOpen(true)} disabled={disabled}>
                            <IconCode size={15} />JSON
                        </button>
                    </div>

                    <button type="button" className="btn btn-primary" onClick={() => handleGenerate(selected)} disabled={disabled}>
                        <IconSparkles size={15} />Generate
                    </button>
                </div>
            </header>

            {/* ── BODY ── */}
            <div className="shell">
                <aside className="rail">
                    <ProfileList
                        selected={selected}
                        profiles={profiles}
                        dirtyNames={isDirty ? [selected] : []}
                        onSelect={handleSelect}
                        addProfile={handleNewProfile}
                    />
                </aside>

                <main className="main">
                    <ProfileDetail
                        title={selected}
                        profile={editingProfile}
                        handleTitle={handleTitleChange}
                        handleChange={handleProfileChange}
                        readOnly={isTemplate}
                    />
                </main>
            </div>
        </div>
    );
}
