import React from "react";
import {
    AUTHENTICATOR_TYPES, AI_TYPES, AI_DEFAULT_MODELS, AI_DEFAULT_URLS,
    MESSAGE_BROKERS, BROKERS_WITH_DELIVERY_OPTIONS,
    OTEL_SIGNALS,
    EMBEDDER_TYPES, EMBEDDER_META, EMBEDDING_MODELS, findEmbeddingModel, defaultEmbeddingModel,
    embedderUsesUrl, stripUrlPrefix, withUrlPrefix,
    SIMILARITY_MIN, SIMILARITY_MAX,
} from "../../config/rules";
import { Card, CardHead, CardBody, FoldCard, SubGroup, Note } from "../ui/primitives";
import {
    Field, TextField, NumberField, SecretField, SegmentedField, Toggle,
    TextAreaField, RangeField,
} from "../ui/fields";
import { IconFile, IconLock, IconSparkles, IconPulse, IconVector, IconMonitor, IconWarn } from "../ui/icons";

export default function OverviewPanel({ profile, onChange }) {
    const version = profile.version || {};
    const authenticator = profile.authenticator || {};
    const ai = profile.ai || {};

    const embedder = profile.embedder || {};
    const embedderMeta = EMBEDDER_META[embedder.type] || EMBEDDER_META.OPENAI;
    const models = EMBEDDING_MODELS[embedder.type] || EMBEDDING_MODELS.OPENAI;
    const modelMeta = findEmbeddingModel(embedder.type, embedder.model);
    const usesUrl = embedderUsesUrl(embedder);
    const urlPrefix = embedderMeta.urlPrefix || "";

    const broker = profile.messageBroker || {};
    const brokerHasOptions = BROKERS_WITH_DELIVERY_OPTIONS.includes(broker.type);
    const otel = profile.otel || {};
    const otelOn = otel.enabled === true;

    const isKeycloak = authenticator.type === "KEYCLOAK";
    const isOllamaAi = ai.type === "OLLAMA";
    const versionText = [version.major, version.minor, version.patch]
        .map((n) => (n ?? 0)).join(".");

    return (
        <div className="panel">

            {/* 프로필 메타 — 항상 펼쳐진 채로 맨 위 전체 폭 */}
            <Card className="meta-card">
                <CardHead icon={<IconFile size={13} />} title="Profile Meta" hint="root" />
                <CardBody>
                    <div className="meta-grid">
                        <div style={{ gridColumn: "span 2" }}>
                            <TextField label="Description" ui value={profile.description} onChange={(v) => onChange(["description"], v)} />
                        </div>
                        <TextField label="Group" value={profile.group} onChange={(v) => onChange(["group"], v)} />

                        <Field label="Version" tag={versionText} tagTone="b">
                            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                                {["major", "minor", "patch"].map((key, i) => (
                                    <React.Fragment key={key}>
                                        {i > 0 && <span style={{ color: "var(--fg-3)" }}>.</span>}
                                        <input
                                            className="input"
                                            style={{ width: 56, textAlign: "center" }}
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
                            </div>
                        </Field>

                        <TextField label="Base Path" tag={"프로젝트 위치"} tagTone="b" value={profile.basePath} onChange={(v) => onChange(["basePath"], v)} />

                        <Field label="Versionable">
                            <Toggle
                                name="Versionable"
                                desc="패키지 및 클래스 버전 사용"
                                checked={version.versionable}
                                onChange={(v) => onChange(["version", "versionable"], v)}
                            />
                        </Field>

                        <Field label="Watermark">
                            <Toggle
                                name="Watermark"
                                desc="생성 시각 주석 삽입"
                                checked={profile.watermark}
                                onChange={(v) => onChange(["watermark"], v)}
                            />
                        </Field>

                        <Field label="Purge">
                            <Toggle
                                name="Purge"
                                desc="생성 전 모듈 폴더 비우기"
                                checked={profile.purge}
                                onChange={(v) => onChange(["purge"], v)}
                            />
                        </Field>

                        <Field label="Serverly Authentication">
                            <Toggle
                                name="Oauth Inter Server"
                                desc="내부 서버 간 Oauth 확인"
                                checked={profile.oauthInterServer}
                                onChange={(v) => onChange(["oauthInterServer"], v)}
                            />
                        </Field>
                    </div>

                    {profile.purge === true && (
                        <div style={{ marginTop: 12 }}>
                            <Note warn icon={<IconWarn size={15} />}>
                                <b>Purge 가 켜져 있습니다.</b> 생성 전에 모듈 폴더를 비웁니다. 직접 고친 코드가 있으면 함께 사라집니다.
                            </Note>
                        </div>
                    )}

                </CardBody>
            </Card>

            <div className="grid-cards">

                {/* Authenticator */}
                <FoldCard icon={<IconLock size={13} />} title="ID Provider" hint="authenticator" defaultOpen={false}>
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
                </FoldCard>

                {/* AI */}
                <FoldCard icon={<IconSparkles size={13} />} title="AI Provider" hint="ai" defaultOpen={false}>
                        <SegmentedField
                            label="Type"
                            name="ai-type"
                            value={ai.type}
                            options={AI_TYPES}
                            onChange={(v) => {
                                onChange(["ai", "type"], v);
                                if (AI_DEFAULT_MODELS[v]) onChange(["ai", "model"], AI_DEFAULT_MODELS[v]);
                                if (AI_DEFAULT_URLS[v]) onChange(["ai", "url"], AI_DEFAULT_URLS[v]);
                            }}
                            hint={AI_DEFAULT_MODELS[ai.type] ? `기본 모델: ${AI_DEFAULT_MODELS[ai.type]}` : undefined}
                        />
                        <TextField
                            label="URL"
                            tag="OLLAMA"
                            tagTone="b"
                            disabled={!isOllamaAi}
                            placeholder={isOllamaAi ? AI_DEFAULT_URLS.OLLAMA : "OLLAMA 일 때만 사용"}
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
                </FoldCard>

                {/* Embedder */}
                <FoldCard icon={<IconVector size={13} />} title="Embedding Provider" hint="ai embedding" defaultOpen={false}>
                        <SegmentedField
                            label="Type"
                            name="embedder-type"
                            value={embedder.type}
                            options={EMBEDDER_TYPES}
                            onChange={(v) => {
                                const first = defaultEmbeddingModel(v);
                                const meta = EMBEDDER_META[v] || {};
                                onChange(["embedder", "type"], v);
                                onChange(["embedder", "model"], first.id);
                                onChange(["embedder", "dimensions"], first.def);
                                if (meta.defaultUrl) onChange(["embedder", "url"], meta.defaultUrl);
                            }}
                            hint={embedderMeta.desc}
                        />

                        <Field
                            label={embedderMeta.urlLabel || "URL"}
                            tag={embedderMeta.usesUrl ? embedder.type : "OLLAMA"}
                            tagTone="b"
                            hint={
                                usesUrl ? embedderMeta.urlHint
                                    : embedderMeta.usesUrl
                                        ? `Model 을 ${embedderMeta.urlModel} 로 고르면 입력할 수 있습니다.`
                                        : `${embedder.type} 는 URL 을 쓰지 않습니다.`
                            }
                        >
                            <div className={urlPrefix ? "prefixed" : undefined}>
                                {urlPrefix && <span className="pfx">{urlPrefix}</span>}
                                <input
                                    type="text"
                                    className="input"
                                    disabled={!usesUrl}
                                    value={stripUrlPrefix(urlPrefix, embedder.url) ?? ""}
                                    placeholder={usesUrl ? (urlPrefix ? "onnx-community/all-MiniLM-L6-v2-ONNX" : embedderMeta.urlHint) : ""}
                                    onChange={(e) => onChange(["embedder", "url"], urlPrefix ? withUrlPrefix(urlPrefix, e.target.value) : e.target.value)}
                                />
                            </div>
                        </Field>

                        <SecretField
                            label="API Key"
                            disabled={!embedderMeta.usesApiKey}
                            value={embedder.apiKey}
                            onChange={(v) => onChange(["embedder", "apiKey"], v)}
                            hint={embedderMeta.usesApiKey ? undefined : `${embedder.type} 는 API Key 를 쓰지 않습니다.`}
                        />

                        <Field
                            label="Model"
                            hint={
                                embedderMeta.urlModel
                                    ? `${embedderMeta.urlModel} 는 Hugging Face 저장소를, files 는 애플리케이션에 넣어 둔 모델 파일을 씁니다.`
                                    : "모델을 고르면 그 모델의 기본 차원이 함께 채워집니다."
                            }
                        >
                            <div className="chipset">
                                {models.map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        className={`chip ${embedder.model === m.id ? "on" : ""}`}
                                        onClick={() => {
                                            onChange(["embedder", "model"], m.id);
                                            onChange(["embedder", "dimensions"], m.def);
                                            if (m.id === embedderMeta.urlModel && !embedder.url && embedderMeta.defaultUrl) {
                                                onChange(["embedder", "url"], embedderMeta.defaultUrl);
                                            }
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
                                { value: 50, label: "50 부드럽게" },
                                { value: 70, label: "70 단단하게" },
                                { value: 85, label: "85 딱딱하게" },
                            ]}
                            hint="검색 결과로 채택할 최소 유사도입니다. 높일수록 정확하지만 결과가 줄어듭니다."
                        />

                        <div className="f-hint">
                            채팅 모델(AI Provider)과 임베딩 공급자는 서로 묶이지 않습니다.
                            서비스의 <b>Embedding</b> 토글이 하나라도 켜져 있을 때 사용됩니다.
                        </div>
                </FoldCard>

                {/* Infrastructure : Message Broker + OTel Collector */}
                <FoldCard icon={<IconPulse size={13} />} title="Infra Provider" hint="mq · otel" defaultOpen={false}>
                        <SubGroup icon={<IconPulse size={13} />}>Message Broker</SubGroup>
                        <SegmentedField
                            label="Type"
                            name="message-broker"
                            value={broker.type}
                            options={MESSAGE_BROKERS}
                            onChange={(v) => onChange(["messageBroker", "type"], v)}
                            hint="이벤트 및 알림 발행자는 이 값을 그대로 따릅니다."
                        />
                        <Field
                            label="Delivery"
                            hint={
                                brokerHasOptions
                                    ? "KAFKA · NATS 에서만 쓰는 옵션입니다. 끄면 JSON 에서도 빠집니다."
                                    : `${broker.type || "현재 브로커"} 는 이 옵션을 쓰지 않습니다.`
                            }
                        >
                            <div className="togglegrid">
                                <Toggle
                                    name="Idempotence"
                                    desc="중복 발행 방지"
                                    checked={broker.idempotent}
                                    locked={!brokerHasOptions}
                                    lockTitle="KAFKA · NATS 에서만 사용합니다"
                                    onChange={(v) => onChange(["messageBroker", "idempotent"], v)}
                                />
                                <Toggle
                                    name="Manual Ack"
                                    desc="수신 확인 수동 응답"
                                    checked={broker.manualAck}
                                    locked={!brokerHasOptions}
                                    lockTitle="KAFKA · NATS 에서만 사용합니다"
                                    onChange={(v) => onChange(["messageBroker", "manualAck"], v)}
                                />
                            </div>
                        </Field>

                        <div className="card-divider" />

                        <SubGroup icon={<IconMonitor size={13} />}>OTel Collector</SubGroup>
                        <Field
                            label="Enabled"
                        >
                            <Toggle
                                name="OTel Collector"
                                desc="트레이스 · 지표 · 로그 수집"
                                checked={otelOn}
                                onChange={(v) => onChange(["otel", "enabled"], v)}
                            />
                        </Field>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                            <TextField
                                label="Host"
                                disabled={!otelOn}
                                value={otel.host}
                                onChange={(v) => onChange(["otel", "host"], v)}
                            />
                            <NumberField
                                label="Port"
                                disabled={!otelOn}
                                value={otel.port}
                                onChange={(v) => onChange(["otel", "port"], v)}
                            />
                        </div>

                        <Field label="Signals" hint="보낼 신호를 고릅니다. (Logs는 항상 수집)">
                            <div className="togglegrid">
                                {OTEL_SIGNALS.map(({ key, label, desc }) => (
                                    <Toggle
                                        key={key}
                                        name={label}
                                        desc={desc}
                                        checked={otel[key]}
                                        locked={!otelOn}
                                        lockTitle="OTel Collector 를 켜야 설정할 수 있습니다"
                                        onChange={(v) => onChange(["otel", key], v)}
                                    />
                                ))}
                            </div>
                        </Field>
                </FoldCard>

            </div>
        </div>
    );
}
