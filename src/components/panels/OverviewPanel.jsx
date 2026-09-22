import React from "react";
import {
    AUTHENTICATOR_TYPES, AI_TYPES, AI_DEFAULT_MODELS, MESSAGE_BROKERS,
    EMBEDDER_TYPES, EMBEDDER_META, EMBEDDING_MODELS, findEmbeddingModel, defaultEmbeddingModel,
    SIMILARITY_MIN, SIMILARITY_MAX,
} from "../../config/rules";
import { Card, CardHead, CardBody } from "../ui/primitives";
import {
    Field, TextField, SecretField, SegmentedField, Toggle,
    TextAreaField, RangeField,
} from "../ui/fields";
import { IconFile, IconLock, IconSparkles, IconPulse, IconVector } from "../ui/icons";

export default function OverviewPanel({ profile, onChange }) {
    const version = profile.version || {};
    const authenticator = profile.authenticator || {};
    const ai = profile.ai || {};

    const embedder = profile.embedder || {};
    const embedderMeta = EMBEDDER_META[embedder.type] || EMBEDDER_META.OPENAI;
    const models = EMBEDDING_MODELS[embedder.type] || EMBEDDING_MODELS.OPENAI;
    const modelMeta = findEmbeddingModel(embedder.type, embedder.model);

    const isKeycloak = authenticator.type === "KEYCLOAK";
    const isOllamaAi = ai.type === "OLLAMA";
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
                            onChange={(v) => {
                                onChange(["ai", "type"], v);
                                if (AI_DEFAULT_MODELS[v]) onChange(["ai", "model"], AI_DEFAULT_MODELS[v]);
                            }}
                            hint={AI_DEFAULT_MODELS[ai.type] ? `기본 모델: ${AI_DEFAULT_MODELS[ai.type]}` : undefined}
                        />
                        <TextField
                            label="URL"
                            tag="OLLAMA"
                            tagTone="b"
                            disabled={!isOllamaAi}
                            placeholder={isOllamaAi ? "http://localhost:11434" : "OLLAMA 일 때만 사용"}
                            value={ai.url}
                            onChange={(v) => onChange(["ai", "url"], v)}
                        />
                        <SecretField
                            label="API Key"
                            value={ai.apiKey}
                            onChange={(v) => onChange(["ai", "apiKey"], v)}
                            hint="Push 시 서버로 전송됩니다. 화면에서는 기본 마스킹."
                        />
                        <TextField label="Model" value={ai.model} onChange={(v) => onChange(["ai", "model"], v)} />
                        <TextAreaField
                            label="System Prompt"
                            rows={3}
                            value={ai.systemPrompt}
                            placeholder="예: 당신은 IT QA 전문가입니다"
                            onChange={(v) => onChange(["ai", "systemPrompt"], v)}
                            hint="생성되는 서비스의 기본 시스템 프롬프트로 들어갑니다."
                        />
                    </CardBody>
                </Card>

                {/* Embedder */}
                <Card>
                    <CardHead icon={<IconVector size={13} />} title="Embedding Provider" hint="embedder" />
                    <CardBody>
                        <SegmentedField
                            label="Type"
                            name="embedder-type"
                            value={embedder.type}
                            options={EMBEDDER_TYPES}
                            onChange={(v) => {
                                const first = defaultEmbeddingModel(v);
                                onChange(["embedder", "type"], v);
                                onChange(["embedder", "model"], first.id);
                                onChange(["embedder", "dimensions"], first.def);
                            }}
                            hint={embedderMeta.desc}
                        />

                        <TextField
                            label="URL"
                            tag="OLLAMA"
                            tagTone="b"
                            disabled={!embedderMeta.usesUrl}
                            value={embedder.url}
                            placeholder={embedderMeta.usesUrl ? embedderMeta.urlHint : "OLLAMA 일 때만 사용"}
                            onChange={(v) => onChange(["embedder", "url"], v)}
                        />

                        <SecretField
                            label="API Key"
                            disabled={!embedderMeta.usesApiKey}
                            value={embedder.apiKey}
                            onChange={(v) => onChange(["embedder", "apiKey"], v)}
                            hint={embedderMeta.usesApiKey ? undefined : `${embedder.type} 는 API Key 를 쓰지 않습니다.`}
                        />

                        <Field label="Model" hint="모델을 고르면 그 모델의 기본 차원이 함께 채워집니다.">
                            <div className="chipset">
                                {models.map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        className={`chip ${embedder.model === m.id ? "on" : ""}`}
                                        onClick={() => {
                                            onChange(["embedder", "model"], m.id);
                                            onChange(["embedder", "dimensions"], m.def);
                                        }}
                                    >
                                        <span className="chip-dot" />
                                        {m.id}
                                        <span className="chip-sub">{m.dims.length > 1 ? `${m.dims.length}종` : m.def}</span>
                                    </button>
                                ))}
                            </div>
                        </Field>

                        <Field
                            label="Dimensions"
                            hint={
                                !modelMeta ? "모델을 먼저 선택하세요."
                                    : modelMeta.dims.length > 1
                                        ? `${modelMeta.id} 가 지원하는 차원입니다. 이미 적재한 벡터와 차원이 다르면 저장소를 다시 만들어야 합니다.`
                                        : `${modelMeta.id} 는 ${modelMeta.def} 차원 고정입니다.`
                            }
                        >
                            <div className="chipset">
                                {(modelMeta ? modelMeta.dims : []).map((d) => (
                                    <label key={d} className={`chip ${Number(embedder.dimensions) === d ? "on" : ""}`}>
                                        <input
                                            type="radio"
                                            name="embedder-dimensions"
                                            checked={Number(embedder.dimensions) === d}
                                            onChange={() => onChange(["embedder", "dimensions"], d)}
                                        />
                                        <span className="chip-dot" />
                                        {d}
                                        {d === modelMeta.def && <span className="chip-sub">기본</span>}
                                    </label>
                                ))}
                            </div>
                        </Field>

                        <RangeField
                            label="Similarity Threshold"
                            unit="%"
                            min={SIMILARITY_MIN}
                            max={SIMILARITY_MAX}
                            value={embedder.similarity}
                            onChange={(v) => onChange(["embedder", "similarity"], v)}
                            marks={[
                                { value: 50, label: "50 넓게" },
                                { value: 70, label: "70 기본" },
                                { value: 85, label: "85 엄격" },
                            ]}
                            hint="검색 결과로 채택할 최소 유사도입니다. 높일수록 정확하지만 결과가 줄어듭니다."
                        />

                        <div className="f-hint">
                            채팅 모델(AI Provider)과 임베딩 공급자는 서로 묶이지 않습니다.
                            서비스의 <b>Embedding</b> 토글이 하나라도 켜져 있을 때 사용됩니다.
                        </div>
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
