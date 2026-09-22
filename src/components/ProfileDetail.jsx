import React from "react";
import dayjs from "dayjs";
import OverviewPanel from "./panels/OverviewPanel";
import ServicesPanel from "./panels/ServicesPanel";
import ConnectorsPanel from "./panels/ConnectorsPanel";
import { Badge } from "./ui/primitives";
import { normalizeProfile } from "../config/rules";
import { IconGrid, IconServers, IconPlug, IconClock } from "./ui/icons";

const TABS = [
    { id: "overview",   label: "Overview",   Icon: IconGrid },
    { id: "services",   label: "Services",   Icon: IconServers },
    { id: "connectors", label: "Connectors", Icon: IconPlug },
];

export default function ProfileDetail({
    title,
    profile,
    handleTitle,
    handleChange,
    readOnly = false,
}) {
    const [tab, setTab] = React.useState("overview");
    const bodyRef = React.useRef(null);

    const updateTitle = React.useCallback((value) => {
        if (typeof handleTitle === "function") handleTitle(value);
    }, [handleTitle]);

    const updateValue = React.useCallback((path, value) => {
        if (typeof handleChange === "function") handleChange(path, value);
    }, [handleChange]);

    /* 규칙 교정 + 서비스에서 Embedding 을 켜면 루트 embedder 블록을 만들어 둔다 */
    React.useEffect(() => {
        const fixed = normalizeProfile(profile);
        if (fixed) updateValue([], fixed);
    }, [profile, updateValue]);

    if (!profile) {
        return (
            <div className="doc-body">
                <div className="empty" style={{ maxWidth: 520, margin: "40px auto" }}>
                    프로필을 불러오지 못했습니다. Generator 서버(localhost:8080) 상태를 확인해 주세요.
                </div>
            </div>
        );
    }

    const projectCount = Array.isArray(profile.projects) ? profile.projects.length : 0;
    const serviceCount = projectCount + (profile.gateway ? 1 : 0) + (profile.notification ? 1 : 0);
    const connectorCount = Array.isArray(profile.externalConnectors) ? profile.externalConnectors.length : 0;
    const counts = { overview: undefined, services: serviceCount, connectors: connectorCount };

    const version = profile.version || {};
    const versionText = `v${version.major ?? 0}.${version.minor ?? 0}.${version.patch ?? 0}`;
    const editedAt = profile.editedAt ? dayjs(profile.editedAt).format("YYYY.MM.DD") : null;

    const selectTab = (id) => {
        setTab(id);
        if (bodyRef.current) bodyRef.current.scrollTop = 0;
    };

    return (
        <>
            <div className="doc-head">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <input
                            className="title-input"
                            value={title ?? ""}
                            disabled={readOnly}
                            title={readOnly ? "template 은 수정할 수 없습니다" : undefined}
                            onChange={(e) => updateTitle(e.target.value)}
                        />
                        <input
                            className="desc-input"
                            value={profile.description ?? ""}
                            disabled={readOnly}
                            onChange={(e) => updateValue(["description"], e.target.value)}
                        />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginLeft: "auto", paddingTop: 4, justifyContent: "flex-end" }}>
                        {profile.group && <Badge mono>{profile.group}</Badge>}
                        <Badge mono>{versionText}</Badge>
                        {profile.authenticator?.type && <Badge tone="b" mono>{profile.authenticator.type}</Badge>}
                        {profile.ai?.type && <Badge tone="v" mono>{profile.ai.type}</Badge>}
                        {profile.messageBroker && <Badge mono>{profile.messageBroker}</Badge>}
                        {editedAt && <Badge><IconClock size={12} />{editedAt}</Badge>}
                    </div>
                </div>

                <nav className="tabs">
                    {TABS.map(({ id, label, Icon }) => (
                        <button
                            key={id}
                            type="button"
                            className={`tab ${tab === id ? "active" : ""}`}
                            onClick={() => selectTab(id)}
                        >
                            <Icon size={15} />
                            {label}
                            {counts[id] !== undefined && <span className="tab-n">{counts[id]}</span>}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="doc-body" ref={bodyRef}>
                {tab === "overview"   && <OverviewPanel   profile={profile} onChange={updateValue} />}
                {tab === "services"   && <ServicesPanel   profile={profile} onChange={updateValue} />}
                {tab === "connectors" && <ConnectorsPanel profile={profile} onChange={updateValue} />}
            </div>
        </>
    );
}
