import React, { useState, useEffect } from "react";
import ProfileList from "./components/ProfileList";
import ProfileDetail from "./components/ProfileDetail";
import { fetchProfiles, saveProfile, deleteProfile, generateProfile } from "./api";
import { useSystemTheme } from "./hooks/useSystemTheme";
import JsonPreviewPopup from "./components/JsonPreviewPopup";
import ToastAlert from "./components/ToastAlert";
import {
    Trash2,
    GitCommitHorizontal,
    CloudUpload,
    WandSparkles,
} from "lucide-react";
import dayjs from "dayjs";

export default function App() {
    const { isDark } = useSystemTheme();

    const [profiles, setProfiles] = useState([]);
    const [selected, setSelected] = useState("");
    const [editingProfile, setEditingProfile] = useState(null);
    const DEFAULT_PROFILE_NAME = "template";

    // popup
    const [previewOpen, setPreviewOpen] = React.useState(false);
    const [toast, setToast] = React.useState({open: false, message: '처리되었습니다'});

    // 1. 초기 데이터 로드
    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        try {
            const data = await fetchProfiles();

            setProfiles(data || {});
            if (data && Object.entries(data).length > 0 && !selected) {
                if(selected === "") {
                    setSelected(DEFAULT_PROFILE_NAME);
                }
                setEditingProfile(JSON.parse(JSON.stringify(data[DEFAULT_PROFILE_NAME]))); // 깊은 복사로 편집 상태 분리

                handleSelect(DEFAULT_PROFILE_NAME);
            }
        } catch (error) {
            console.error("프로필 로드 실패:", error);
        }
    };

    // 2. 프로필 목록에서 특정 항목 선택 시
    const handleSelect = (title) => {
        setSelected(title);

        const target = profiles[title];
        if (target) {
            setEditingProfile(JSON.parse(JSON.stringify(target))); // 원본 보존을 위한 깊은 복사
        }
    };

    // 3. 새 프로필 기본 뼈대 추가
    const handleNewProfile = () => {
        const now = dayjs();
        const newTitle = `New_Profile_${now.unix()}`;
        const newProfile = {
            "editedAt": `${now.format('YYYY.MM.DD HH:mm:ss')}`,
            "description": "새 프로필",
            "group": "example.com",
            "version": {
                "major": 0,
                "minor": 0,
                "patch": 1
            },
            "basePath": "..",
            "messageBroker": "APP",
            "authenticator": {
                "type": "KEYCLOAK",
                "name": null,
                "serverUrl": "https://",
                "clientId": null,
                "clientSecret": null,
                "realmName": null
            },
            "externalConnectors": [
            ],
            "projects": [
            ],
            "gateway": {
                "name": "gateway",
                "desc": "어플리케이션 게이트웨이",
                "localPort": 8070,

                "enabled": {
                    "orm": false,
                    "client": false,
                    "swagger": true,
                    "monitoring": true,
                    "session": true,
                    "authentication": true,
                },

                "datasource" : {
                    "type": null,
                    "addressAndPort": null,
                    "databaseName" : null,
                    "username": null,
                    "password": null,

                    "schemaFilter": "public",
                    "tableFilter": "%",
                    "columnFilter": "%",
                },

                "orm": {
                    "type": "JPA",
                    "logSql": true,
                },

                "interServers": [],
            },

            "notification": {
                "name": "notification",
                "desc": "SSE 알림",
                "localPort": 8071,
                "enabled": {
                    "swagger": true,
                    "monitoring": true,
                }
            }
        };

        setProfiles(prevData => ({
            ...prevData,
            [newTitle]: newProfile
        }));

        setSelected(newTitle);
        setEditingProfile(newProfile);
    };

    const showToast = (message) => {
        setToast({open: true, message: message});
    };

    const handleCommit = async (profileName) => {
        if(profileName === "template") {
            showToast("Template NOT modifiable!");
            return;
        }

        try {
            setProfiles(prevData => ({
                ...prevData,
                [profileName]: editingProfile
            }));

            showToast("Commit completed!");

            setPreviewOpen(true);
        } catch (error) {
            console.error("임시저장 실패:", error);
            showToast("Commit failed!");
        }
    };

    const handleSave = async (profileName) => {
        if(profileName === "template") {
            showToast("Template NOT pushable!");
            return;
        }
        try {
            if(profiles[profileName] !== editingProfile){
                if(confirm("커밋되지 않은 변경 내용이 있습니다. 바로 저장하시겠습니까?")){
                    setProfiles(prevData => ({
                        ...prevData,
                        [profileName]: editingProfile
                    }));
                } else {
                    showToast("Push cancelled!");
                    return;
                }
            }

            await saveProfile(profileName, profiles[profileName]);
            showToast("Push completed!");

        } catch (error) {
            console.error("Failed to save" + error);
            showToast("Push failed!");
        }
    };

    const handleRemove = async (profileName) => {
        if(profileName === "template") {
            showToast("Template NOT removable!");
            return;
        }

        if (!window.confirm(`${profileName} 프로필을 삭제하시겠습니까?`)) {
            showToast("Delete cancelled!");
            return;
        }

        try {
            await deleteProfile(profileName);

            setProfiles(prevData => {
                const { [profileName]: omitted, ...rest } = prevData;
                return rest;
            });

            setSelected(null);
            setEditingProfile(null);

            showToast("Delete completed!");

        } catch (error) {
            console.error("Failed to remove" + error);
            showToast("Delete failed!");
        }
    };

    const handleGenerate = async (profileName) => {
        try {
            await generateProfile(profileName);
            showToast("Generate completed!");

        } catch (error) {
            console.error("Failed to generate" + error);
            showToast("Generate failed!");
        }
    };

    const handleTitleChange = (value) => {
        setProfiles(prevMap => {
            // 1. Check if the key exists
            if (!(selected in prevMap)) return prevMap;

            // 2. Destructure the old key out, and gather the rest
            const { [selected]: targetValue, ...rest } = prevMap;

            // 3. Return a new object with the rest of the keys plus the new key
            return {
                ...rest,
                [value]: targetValue
            };
        });

        setSelected(value);
    };

    const handleProfileChange = (path, value) => {
        setEditingProfile((prev) => {
            return setByPath(prev, path, value);
        });
    };

    function setByPath(object, path, value) {
        if (path.length === 0) {
            return value;
        }

        const result = Array.isArray(object)
            ? [...object]
            : { ...(object || {}) };

        const [key, ...rest] = path;

        result[key] =
            rest.length > 0
                ? setByPath(result[key], rest, value)
                : value;

        return result;
    }

    return (
        <div className="min-h-screen flex flex-col dark:bg-zinc-900 dark:text-slate-50 transition-colors duration-300 dark:bg-slate-900 dark:text-slate-100">
            {/* --- Preview Popup --- */}
            <JsonPreviewPopup
                open={previewOpen}
                profile={editingProfile}
                title={`${selected} - JSON Preview`}
                onClose={() => setPreviewOpen(false)}
            />
            {/* 토스트 컴포넌트 장착 */}
            <ToastAlert
                isOpen={toast.open}
                message={toast.message}
                onClose={() => setToast({...toast, open: false})}
            />
            {/* --- HEADER DIV --- */}
            <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between pl-1 pr-1">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">SpringBoot Generator</h1>
                        <p className="text-xs dark:text-slate-400 dark:text-slate-400">Based on version 3.5.13</p>
                    </div>

                    {/* Header Action Elements */}
                    <div className="flex items-center gap-4">
                        <button className="inline-flex items-center gap-2 text-white rounded-lg
                                            px-4 py-2 text-sm font-medium transition-colors
                                            bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                                onClick={() => handleRemove(selected)}>
                            <Trash2 size={16} /> Delete
                        </button>
                        <button className="inline-flex items-center gap-2 text-white rounded-lg
                                            px-4 py-2 text-sm font-medium transition-colors
                                            bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                                onClick={() => handleCommit(selected)}>
                            <GitCommitHorizontal size={16} /> Commit
                        </button>
                        <button className="inline-flex items-center gap-2 text-white rounded-lg
                                            px-4 py-2 text-sm font-medium transition-colors
                                            bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                                onClick={() => handleSave(selected)}>
                            <CloudUpload size={16} /> Push
                        </button>
                        <button className="inline-flex items-center gap-2 text-white rounded-lg
                                            px-4 py-2 text-sm font-medium transition-colors
                                            bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                                onClick={() => handleGenerate(selected)}>
                            <WandSparkles size={16} /> Generate
                        </button>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT DIV --- */}
            {/* MAIN CONTAINER */}
            <main className="max-w-7xl flex-1 w-full mx-auto pt-1">

                {/* CARD/PANEL BODY OUTER SHELL */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm dark:bg-slate-800 dark:border-slate-700">

                    {/* 🆕 THIS IS THE FIX: The layout engine directly holding your two divs */}
                    <div className="flex flex-row items-stretch gap-4 w-full">
                        {/* 좌측 사이드바: 프로필 목록 */}
                        <div className="w-72 bg-slate-50 dark:bg-zinc-900 rounded shadow overflow-hidden flex-shrink-0">
                            <ProfileList
                                selected={selected}
                                profiles={profiles}
                                onSelect={handleSelect}
                                addProfile={handleNewProfile}
                            />
                        </div>
                        {/* 우측 본문: 프로필 상세 편집 및 수정 */}
                        <div className="flex-1 bg-slate-50 dark:bg-zinc-900 rounded shadow flex flex-col min-h-[70vh]">
                            <ProfileDetail
                                title={selected}
                                handleTitle={handleTitleChange}
                                profile={editingProfile}
                                handleChange={handleProfileChange}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
