import React from "react";
import {
    AUTHENTICATOR_TYPES, AI_TYPES, MESSAGE_BROKERS,
} from "../../config/rules";
import { Card, CardHead, CardBody, Note } from "../ui/primitives";
import { Field, TextField, NumberField, SecretField, SegmentedField, Toggle } from "../ui/fields";
import { IconFile, IconLock, IconSparkles, IconPulse, IconInfo } from "../ui/icons";

export default function OverviewPanel({ profile, onChange }) {
    const version = profile.version || {};
    const authenticator = profile.authenticator || {};
    const ai = profile.ai || {};

    const isKeycloak = authenticator.type === "KEYCLOAK";
    const isLocalAi = ai.type === "LOCAL";
    const versionText = [version.major, version.minor, version.patch]
        .map((n) => (n ?? 0)).join(".");

    return (
        <div className="panel">
            <div className="grid-cards">

                {/* 프로필 메타 */}
                <Card>
                    <CardHead icon={<IconFile size={13} />} title="프로필 메타" hint="root" />
                    <CardBody>
                        <TextField label="Description" ui value={profile.description} onChange={(v) => onChange(["description"], v)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                            <TextField label="Group" value={profile.group} onChange={(v) => onChange(["group"], v)} />
                            <TextField label="Base Path" value={profile.basePath} onChange={(v) => onChange(["basePath"], v)} />
                        </div>

                        <Field label="Version" tag="version" tagTone="b">
                            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                {["major", "minor", "patch"].map((key, i) => (
                                    <React.Fragment key={key}>
                                        {i > 0 && <span style={{ color: "var(--fg-3)" }}>.</span>}
                                        <input
                                            className="input"
                                            style={{ width: 64, textAlign: "center" }}
                                            title={key}
                                            inputMode="numeric"
                                            value={version[key] ?? 0}
                                            onChange={(e) => {
                                                const raw = e.target.value;
                                                if (raw !== "" && !/^\d*$/.test(raw)) return;
                                                onChange(["version", key], raw === "" ? 0 : Number(raw));
                                            }}
                                        />
                                    </React.Fragment>
                                ))}
                                <span className="badge badge-mono" style={{ marginLeft: 4 }}>{versionText}</span>
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <Toggle
                                    name="Versionable"
                                    desc="아티팩트에 버전 부여"
                                    checked={version.versionable}
                                    onChange={(v) => onChange(["version", "versionable"], v)}
                                />
                            </div>
                        </Field>

                        <TextField label="Edited At" value={profile.editedAt} onChange={() => {}} disabled />
                    </CardBody>
                </Card>

                {/* Authenticator */}
                <Card>
                    <CardHead icon={<IconLock size={13} />} title="Authenticator" hint="authenticator" />
                    <CardBody>
                        <SegmentedField
                            label="Type"
                            name="auth-type"
                            value={authenticator.type}
                            options={AUTHENTICATOR_TYPES}
                            onChange={(v) => onChange(["authenticator", "type"], v)}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                            <TextField label="Name" value={authenticator.name} onChange={(v) => onChange(["authenticator", "name"], v)} />
                            {isKeycloak && (
                                <TextField
                                    label="Realm Name"
                                    tag="KEYCLOAK"
                                    tagTone="b"
                                    value={authenticator.realmName}
                                    onChange={(v) => onChange(["authenticator", "realmName"], v)}
                                />
                            )}
                        </div>
                        <TextField label="Server URL" value={authenticator.serverUrl} onChange={(v) => onChange(["authenticator", "serverUrl"], v)} />
                        <TextField label="Client Id" value={authenticator.clientId} onChange={(v) => onChange(["authenticator", "clientId"], v)} />
                        <SecretField label="Client Secret" value={authenticator.clientSecret} onChange={(v) => onChange(["authenticator", "clientSecret"], v)} />
                    </CardBody>
                </Card>

                {/* AI */}
                <Card>
                    <CardHead icon={<IconSparkles size={13} />} title="AI Provider" hint="ai" />
                    <CardBody>
                        <SegmentedField
                            label="Type"
                            name="ai-type"
                            value={ai.type}
                            options={AI_TYPES}
                            onChange={(v) => onChange(["ai", "type"], v)}
                        />
                        <TextField label="Model" value={ai.model} onChange={(v) => onChange(["ai", "model"], v)} />
                        <div style={{ opacity: isLocalAi ? 1 : .45 }}>
                            <TextField
                                label="URL"
                                tag="LOCAL"
                                tagTone="b"
                                placeholder={isLocalAi ? "http://localhost:11434" : "LOCAL 일 때만 사용"}
                                value={ai.url}
                                onChange={(v) => onChange(["ai", "url"], v)}
                            />
                        </div>
                        <SecretField
                            label="API Key"
                            value={ai.apiKey}
                            onChange={(v) => onChange(["ai", "apiKey"], v)}
                            hint="Push 시 서버로 전송됩니다. 화면에서는 기본 마스킹."
                        />
                    </CardBody>
                </Card>

                {/* Messaging */}
                <Card>
                    <CardHead icon={<IconPulse size={13} />} title="Messaging" hint="messageBroker" />
                    <CardBody>
                        <SegmentedField
                            label="Message Broker"
                            name="message-broker"
                            value={profile.messageBroker}
                            options={MESSAGE_BROKERS}
                            onChange={(v) => onChange(["messageBroker"], v)}
                            hint="이벤트 발행자는 이 값을 그대로 따릅니다."
                        />
                    </CardBody>
                </Card>

            </div>
        </div>
    );
}
