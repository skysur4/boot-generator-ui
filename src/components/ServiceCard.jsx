import React from "react";
import {
    ROLE, ROLE_RULES, MODULE_KEYS, MODULE_META, moduleStateFor,
    MODULE_EXCLUSIVE, MODULE_IMPLIES, moduleState,
    DATABASES, RESPONSIBILITY_SEGREGATION,
    VECTOR_STORES,
    createInterServer,
} from "../config/rules";
import { Card, CardHead, CardBody, SubGroup, Accordion, EmptyBox, AddButton, Note, Badge } from "./ui/primitives";
import { useConfirm } from "./ConfirmDialog";
import { Field, TextField, NumberField, SecretField, SegmentedField, ChipRadioField, Toggle, ListRow } from "./ui/fields";
import {
    IconBox, IconGateway, IconBell, IconDatabase, IconServers, IconFilter,
    IconLayers, IconPlus, IconTrash, IconWarn, IconVector,
} from "./ui/icons";

const ROLE_ICON = {
    [ROLE.BACKEND]: IconBox,
    [ROLE.GATEWAY]: IconGateway,
    [ROLE.NOTIFICATION]: IconBell,
};

/* ── 접힌 상태 요약 배지 ─────────────────────────────────── */
function summaryBadges(service, role) {
    const rules = ROLE_RULES[role];
    const out = [<Badge key="role" tone={rules.tone} role>{rules.roleBadge}</Badge>];

    if (service.localPort) out.push(<Badge key="port" mono>{`:${service.localPort}`}</Badge>);

    if (service.orm?.type) {
        out.push(<Badge key="orm" tone={role === ROLE.BACKEND ? "" : "v"} mono>{service.orm.type}</Badge>);
        if (service.datasource?.type) out.push(<Badge key="db" tone="b" mono>{service.datasource.type}</Badge>);
    } else {
        out.push(<Badge key="nodb" title="ORM 꺼짐 — datasource 없음">DB 없음</Badge>);
    }

    if (service.vectorsource?.type) {
        out.push(
            <Badge key="vec" tone="v" mono title="벡터 저장소">
                {`vec:${service.vectorsource.type}`}
            </Badge>
        );
    }

    if (rules.hasResponsibilitySegregation && service.responsibilitySegregation) {
        out.push(<Badge key="rs" mono>{service.responsibilitySegregation}</Badge>);
    }

    const on = MODULE_KEYS.filter((k) => service.enabled?.[k]);
    on.slice(0, 2).forEach((k) => out.push(<Badge key={k} tone="g">{k}</Badge>));
    if (on.length > 2) out.push(<Badge key="more">{`+${on.length - 2}`}</Badge>);

    return out;
}

/* ── Inter Server 한 건 ──────────────────────────────────── */
function InterServerCard({ value, index, basePath, tone, onChange, onRemove }) {
    const [open, setOpen] = React.useState(index === 0);
    const at = (key) => [...basePath, "interServers", index, key];
    const domains = Array.isArray(value.domains) ? value.domains : [];
    const setDomains = (next) => onChange([...basePath, "interServers", index, "domains"], next);

    return (
        <Accordion
            open={open}
            onToggle={() => setOpen((s) => !s)}
            idx={String(index + 1).padStart(2, "0")}
            name={value.name || "(이름 없음)"}
            desc={value.url}
            tone={tone}
            summary={domains.map((d) => <Badge key={d} tone="b" mono>{d}</Badge>)}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                <TextField label="Name" value={value.name} onChange={(v) => onChange(at("name"), v)} />
                <TextField label="URL" value={value.url} onChange={(v) => onChange(at("url"), v)} />
            </div>
            <div style={{ marginTop: 13 }}>
                <TextField label="Artifact" value={value.artifact} onChange={(v) => onChange(at("artifact"), v)} />
            </div>

            <SubGroup count={domains.length}>Domains</SubGroup>
            {domains.length === 0 && <EmptyBox>도메인 없음</EmptyBox>}
            {domains.map((domain, i) => (
                <ListRow key={i} onRemove={() => setDomains(domains.filter((_, j) => j !== i))} removeLabel="도메인 삭제">
                    <input
                        className="input"
                        value={domain ?? ""}
                        onChange={(e) => {
                            const next = [...domains];
                            next[i] = e.target.value;
                            setDomains(next);
                        }}
                    />
                </ListRow>
            ))}
            <AddButton onClick={() => setDomains([...domains, ""])}>Domain 추가</AddButton>

            <div className="acc-foot">
                <button type="button" className="btn btn-sm btn-danger" onClick={onRemove}>
                    <IconTrash size={13} />Inter Server {index + 1} 삭제
                </button>
            </div>
        </Accordion>
    );
}

/* ── 벡터 저장소 ─────────────────────────────────────────── */
function VectorStoreCard({ value, basePath, onChange }) {
    const at = (key) => [...basePath, "vectorsource", key];

    return (
        <Card>
            <CardHead icon={<IconVector size={13} />} title="Vector Store" hint="vectorsource" />
            <CardBody>
                <Field label="Store" hint="괄호 안은 권장 데이터 규모입니다. 인덱스·거리 계산은 각 저장소 기본값을 그대로 씁니다.">
                    <div className="chipset">
                        {VECTOR_STORES.map((store) => (
                            <label
                                key={store.id}
                                className={`chip ${value.type === store.id ? "on" : ""}`}
                                title={`${store.label} · ${store.scale}`}
                            >
                                <input
                                    type="radio"
                                    name={`${basePath.join(".")}-vstore`}
                                    checked={value.type === store.id}
                                    onChange={() => onChange(at("type"), store.id)}
                                />
                                <span className="chip-dot" />
                                {store.label}
                                <span className="chip-sub">{store.scale}</span>
                            </label>
                        ))}
                    </div>
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                    <TextField label="Host" value={value.host} onChange={(v) => onChange(at("host"), v)} />
                    <NumberField label="Port" value={value.port} onChange={(v) => onChange(at("port"), v)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                    <SecretField label="API Key" value={value.apiKey} onChange={(v) => onChange(at("apiKey"), v)} />
                    <Field label="TLS">
                        <Toggle
                            name="Use TLS"
                            desc="https / 보안 연결"
                            checked={value.useTls}
                            onChange={(v) => onChange(at("useTls"), v)}
                        />
                    </Field>
                </div>

                <div className="card-divider" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                    <TextField
                        label="Doc Name"
                        value={value.docName}
                        onChange={(v) => onChange(at("docName"), v)}
                        hint="컬렉션(인덱스) 이름"
                    />
                    <TextField
                        label="Field Name"
                        value={value.fieldName}
                        onChange={(v) => onChange(at("fieldName"), v)}
                        hint="본문이 들어갈 필드"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                    <TextField label="Database" value={value.databaseName} onChange={(v) => onChange(at("databaseName"), v)} />
                    <TextField label="Username" value={value.username} onChange={(v) => onChange(at("username"), v)} />
                </div>

                <SecretField label="Password" value={value.password} onChange={(v) => onChange(at("password"), v)} />

                <div className="card-divider" />

                <Field label="Initialize Schema" hint="없으면 기동할 때 컬렉션을 만듭니다. 이미 있으면 그대로 씁니다.">
                    <Toggle
                        name="Initialize Schema"
                        desc="기동 시 컬렉션 자동 생성"
                        checked={value.initializeSchema}
                        onChange={(v) => onChange(at("initializeSchema"), v)}
                    />
                </Field>
            </CardBody>
        </Card>
    );
}

/* ── 서비스 카드 본체 ────────────────────────────────────── */
export default function ServiceCard({
    role,
    service,
    basePath,          // ['projects', i] | ['gateway'] | ['notification']
    index,
    defaultOpen = false,
    onChange,
    onRemove,
}) {
    const rules = ROLE_RULES[role];
    const [open, setOpen] = React.useState(defaultOpen);
    const RoleIcon = ROLE_ICON[role];
    const confirm = useConfirm();

    /* 규칙 위반 값 교정은 ProfileDetail 에서 프로필 단위로 한다.
       (탭을 열지 않아도 Push 가 일관된 결과를 내도록) */

    if (!service) return null;

    const at = (...keys) => [...basePath, ...keys];
    const ormOn = service.enabled?.orm === true && !!service.orm && !!service.datasource;
    const vectorOn = service.enabled?.embedding === true && !!service.vectorsource;
    const clientOn = service.enabled?.client === true && Array.isArray(service.interServers);
    const interServers = Array.isArray(service.interServers) ? service.interServers : [];

    /* 모듈 토글: 상호 배타(ORM ↔ Embedding)와 필수 동반(Embedding → OpenAPI)을 함께 처리 */
    const BLOCK_OF = { orm: "orm · datasource", embedding: "vectorsource" };
    const toggleModule = async (key, value) => {
        const rival = MODULE_EXCLUSIVE[key];
        if (value && rival && service.enabled?.[rival] === true) {
            const ok = await confirm({
                title: `${MODULE_META[key].label} 켜기`,
                message: (
                    <>
                        <b>{MODULE_META[key].label}</b> · <b>{MODULE_META[rival].label}</b> 은(는) 한 서비스에서 함께 쓸 수 없습니다.
                        켜면 <b>{MODULE_META[rival].label}</b> 이(가) 꺼지고 <span className="mono">{BLOCK_OF[rival]}</span> 설정이 삭제됩니다.
                    </>
                ),
                detail: "두 기능이 모두 필요하면 서비스를 나누고 API 또는 MQ 로 연결하세요.",
                confirmText: `${MODULE_META[rival].label} 끄고 켜기`,
                tone: "warn",
            });
            if (!ok) return;
            onChange(at("enabled", rival), false);
        }
        onChange(at("enabled", key), value);
        if (value) {
            (MODULE_IMPLIES[key] || []).forEach((t) => {
                if (moduleState(role, t) === "editable") onChange(at("enabled", t), true);
            });
        }
    };

    const removeService = async () => {
        const ok = await confirm({
            title: `${rules.label} 삭제`,
            message: <><b>{service.name || "(이름 없음)"}</b> 을(를) 목록에서 삭제합니다.</>,
            detail: "Push 전까지는 서버에 반영되지 않습니다.",
            confirmText: "삭제",
            tone: "danger",
        });
        if (ok) onRemove();
    };

    return (
        <Accordion
            open={open}
            onToggle={() => setOpen((s) => !s)}
            idx={rules.isArray ? String(index + 1).padStart(2, "0") : <RoleIcon size={14} />}
            name={service.name || "(이름 없음)"}
            desc={service.desc}
            tone={rules.tone}
            summary={summaryBadges(service, role)}
        >
            {!rules.hasResponsibilitySegregation && (
                <div style={{ marginBottom: 14 }}>
                    <Note warn icon={<IconWarn size={15} />}>
                        <b>Reactive 서비스.</b> ORM 은 <span className="mono">{rules.orm.options.join(" / ")}</span> 고정이고{" "}
                        <span className="mono">responsibilitySegregation</span> 은 사용하지 않습니다.
                    </Note>
                </div>
            )}

            {/* ── 기본 정보 ── */}
            <Card style={{ maxWidth: 560 }}>
                <CardHead icon={<RoleIcon size={13} />} title="기본 정보" />
                <CardBody>
                    <TextField label="Name" required value={service.name} onChange={(v) => onChange(at("name"), v)} />
                    <TextField label="Desc" ui value={service.desc} onChange={(v) => onChange(at("desc"), v)} />
                    <NumberField label="Local Port" value={service.localPort} onChange={(v) => onChange(at("localPort"), v)} width={150} />
                    {rules.hasResponsibilitySegregation && (
                        <SegmentedField
                            label="Responsibility Segregation"
                            value={service.responsibilitySegregation}
                            options={RESPONSIBILITY_SEGREGATION}
                            onChange={(v) => onChange(at("responsibilitySegregation"), v)}
                            name={`${basePath.join(".")}-rs`}
                        />
                    )}
                </CardBody>
            </Card>

            {/* ── ORM + Datasource (ORM 토글이 지배) ── */}
            {ormOn && (
                <>
                    <SubGroup
                        icon={<IconLayers size={13} />}
                        count="orm · datasource"
                        note={<><b>ORM</b> 토글로 이 블록을 통째로 켜고 끕니다. {rules.orm.note}</>}
                    >
                        Persistence
                    </SubGroup>
                    <Card>
                        <CardHead icon={<IconDatabase size={13} />} title="ORM & Datasource" hint="Datasource" />
                        <CardBody>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                                <SegmentedField
                                    label="ORM Type"
                                    tag={rules.orm.tag}
                                    tagTone={rules.orm.tagTone}
                                    value={service.orm.type}
                                    options={["JPA", "MYBATIS", "R2DBC"]}
                                    disabledOptions={["JPA", "MYBATIS", "R2DBC"].filter((o) => !rules.orm.options.includes(o))}
                                    disabledTitle={rules.orm.blockedNote}
                                    onChange={(v) => onChange(at("orm", "type"), v)}
                                    name={`${basePath.join(".")}-orm`}
                                />
                                <Field label="SQL Logging">
                                    <Toggle
                                        name="Show SQL Logs"
                                        desc="P6Spy Logger"
                                        checked={service.orm.logSql}
                                        onChange={(v) => onChange(at("orm", "logSql"), v)}
                                    />
                                </Field>
                            </div>

                            <div className="card-divider" />

                            <ChipRadioField
                                label="Database"
                                value={service.datasource.type}
                                options={DATABASES}
                                onChange={(v) => onChange(at("datasource", "type"), v)}
                                name={`${basePath.join(".")}-db`}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                                <TextField label="Host" value={service.datasource.host} onChange={(v) => onChange(at("datasource", "host"), v)} />
                                <NumberField label="Port" value={service.datasource.port} onChange={(v) => onChange(at("datasource", "port"), v)} />
                            </div>
                            <TextField label="Database" value={service.datasource.databaseName} onChange={(v) => onChange(at("datasource", "databaseName"), v)} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                                <TextField label="Username" value={service.datasource.username} onChange={(v) => onChange(at("datasource", "username"), v)} />
                                <SecretField label="Password" value={service.datasource.password} onChange={(v) => onChange(at("datasource", "password"), v)} />
                            </div>

                            <SubGroup icon={<IconFilter size={13} />}>Reverse-engineering filter</SubGroup>
                            <div className="grid grid-cols-3 gap-[10px]">
                                <TextField label="Schema" value={service.datasource.schemaFilter} onChange={(v) => onChange(at("datasource", "schemaFilter"), v)} />
                                <TextField label="Table" value={service.datasource.tableFilter} onChange={(v) => onChange(at("datasource", "tableFilter"), v)} />
                                <TextField label="Column" value={service.datasource.columnFilter} onChange={(v) => onChange(at("datasource", "columnFilter"), v)} />
                            </div>
                        </CardBody>
                    </Card>
                </>
            )}

            {/* ── Vector Store (Embedding 토글이 지배) ── */}
            {vectorOn && (
                <>
                    <SubGroup
                        icon={<IconVector size={13} />}
                        count="vectorsource"
                        note={<><b>Embedding</b> 토글로 이 블록을 통째로 켜고 끕니다. 이 접속 정보로 Spring AI VectorStore 와 그 datasource 가 함께 구성되고, 임베딩 모델·차원·유사도 임계값은 Overview 의 Embedder 에서 정합니다.</>}
                    >
                        Vector Store
                    </SubGroup>
                    <VectorStoreCard value={service.vectorsource} basePath={basePath} onChange={onChange} />
                </>
            )}

            {/* ── Inter Servers (Client 토글이 지배) ── */}
            {clientOn && (
                <>
                    <SubGroup
                        icon={<IconServers size={13} />}
                        count={interServers.length}
                        note={<>다른 서비스를 호출할 때 쓰는 연동 대상입니다. <b>Client</b> 토글로 이 블록을 통째로 켜고 끕니다.</>}
                    >
                        Inter Servers
                    </SubGroup>
                    {interServers.length === 0 && <EmptyBox icon={<IconServers size={22} />}>연동된 서버 없음</EmptyBox>}
                    {interServers.map((server, i) => (
                        <InterServerCard
                            key={i}
                            value={server}
                            index={i}
                            basePath={basePath}
                            tone={rules.tone}
                            onChange={onChange}
                            onRemove={() => onChange(at("interServers"), interServers.filter((_, j) => j !== i))}
                        />
                    ))}
                    <AddButton
                        block
                        sm={false}
                        onClick={() => onChange(at("interServers"), [...interServers, createInterServer()])}
                    >
                        Inter Server 추가
                    </AddButton>
                </>
            )}

            {/* ── Modules ── */}
            <SubGroup
                icon={<IconPlus size={13} />}
                count={`${rules.path.replace("[]", "")}.enabled`}
                note={
                    <>
                        {rules.modules.forcedOn.length > 0 && (
                            <>
                                <b>{rules.modules.forcedOn.map((k) => MODULE_META[k].label).join(" · ")}</b> 고정,{" "}
                            </>
                        )}
                        <b>{rules.modules.allowed.map((k) => MODULE_META[k].label).join(" · ")}</b>{" "}
                        {rules.modules.allowed.length}개 선택 가능.{" "}
                        <b>{rules.modules.allowed.includes("embedding") ? "ORM · Embedding · Client" : "ORM · Client"}</b> 토글은 바로 위의 설정 블록을 통째로 켜고 끕니다.
                        {rules.modules.allowed.includes("embedding") && (
                            <> <b>ORM</b> 과 <b>Embedding</b> 은 함께 켤 수 없고, Embedding 을 켜면 <b>Open API</b> 가 필수로 켜집니다.</>
                        )}
                    </>
                }
            >
                Modules
            </SubGroup>
            <Card>
                <CardBody>
                    <div className="togglegrid">
                        {MODULE_KEYS.map((key) => {
                            const { state, by } = moduleStateFor(role, key, service.enabled);
                            const meta = MODULE_META[key];
                            const locked = state !== "editable";
                            const rival = MODULE_EXCLUSIVE[key];
                            const rivalOn = rival && state === "editable" && service.enabled?.[rival] === true;
                            return (
                                <Toggle
                                    key={key}
                                    name={meta.label}
                                    desc={
                                        state === "forcedOn" ? "항상 켜짐 · 변경 불가"
                                            : state === "implied" ? `${MODULE_META[by].label} 사용 시 필수`
                                                : state === "forcedOff" ? `${role === ROLE.BACKEND ? "Gateway / Notification" : "Backend"} 전용`
                                                    : rivalOn && !service.enabled?.[key] ? `켜면 ${MODULE_META[rival].label} 꺼짐`
                                                        : meta.desc
                                    }
                                    checked={state === "forcedOn" || state === "implied" ? true : state === "forcedOff" ? false : !!service.enabled?.[key]}
                                    locked={locked}
                                    lockTitle={
                                        state === "forcedOn"
                                            ? `${rules.label} 은(는) 항상 ${meta.label} 을(를) 사용합니다 — 변경 불가`
                                            : state === "implied"
                                                ? `${MODULE_META[by].label} 이(가) 켜져 있는 동안 ${meta.label} 은(는) 끌 수 없습니다`
                                            : state === "forcedOff"
                                                ? `${rules.label} 에서는 ${meta.label} 을(를) 사용하지 않습니다`
                                                : undefined
                                    }
                                    onChange={(v) => toggleModule(key, v)}
                                />
                            );
                        })}
                    </div>
                </CardBody>
            </Card>
            {onRemove && (
                <div className="acc-foot">
                    <button type="button" className="btn btn-sm btn-danger" onClick={removeService}>
                        <IconTrash size={13} />{rules.label} {String(index + 1).padStart(2, "0")} 삭제
                    </button>
                </div>
            )}
        </Accordion>
    );
}
