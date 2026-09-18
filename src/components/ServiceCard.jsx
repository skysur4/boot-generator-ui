import React from "react";
import {
    ROLE, ROLE_RULES, MODULE_KEYS, MODULE_META, moduleState,
    DATABASES, RESPONSIBILITY_SEGREGATION,
    VECTOR_STORES, findVectorStore, VECTOR_INDEX_TYPE, VECTOR_DISTANCE_TYPE,
    createInterServer,
} from "../config/rules";
import { Card, CardHead, CardBody, SubGroup, Accordion, EmptyBox, AddButton, Note, Badge } from "./ui/primitives";
import { Field, TextField, NumberField, SecretField, SegmentedField, ChipRadioField, Toggle, ListRow } from "./ui/fields";
import {
    IconBox, IconGateway, IconBell, IconDatabase, IconServers, IconFilter,
    IconLayers, IconPlus, IconX, IconTrash, IconWarn, IconVector, IconLock,
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
    const store = findVectorStore(value.type);
    const at = (key) => [...basePath, "vectorsource", key];
    const has = (field) => store.fields.includes(field);

    return (
        <Card>
            <CardHead
                icon={<IconVector size={13} />}
                title="Vector Store"
                hint="Vectorsource"
            />
            <CardBody>
                <Field label="Store" hint="괄호 안은 권장 데이터 규모입니다.">
                    <div className="chipset">
                        {VECTOR_STORES.map((s) => (
                            <label key={s.id} className={`chip ${value.type === s.id ? "on" : ""}`} title={`${s.label} · ${s.scale}`}>
                                <input
                                    type="radio"
                                    name={`${basePath.join(".")}-vstore`}
                                    checked={value.type === s.id}
                                    onChange={() => onChange(at("type"), s.id)}
                                />
                                <span className="chip-dot" />
                                {s.label}
                                <span className="chip-sub">{s.scale}</span>
                            </label>
                        ))}
                    </div>
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                    {has("addressAndPort") && (
                        <TextField label="Address : Port" value={value.addressAndPort} onChange={(v) => onChange(at("addressAndPort"), v)} />
                    )}
                    {has("databaseName") && (
                        <TextField label="Database" value={value.databaseName} onChange={(v) => onChange(at("databaseName"), v)} />
                    )}
                    {has("collectionName") && (
                        <TextField label="Collection" value={value.collectionName} onChange={(v) => onChange(at("collectionName"), v)} />
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                    {has("username") && (
                        <TextField label="Username" value={value.username} onChange={(v) => onChange(at("username"), v)} />
                    )}
                    {has("password") && (
                        <SecretField label="Password" value={value.password} onChange={(v) => onChange(at("password"), v)} />
                    )}
                    {has("apiKey") && (
                        <SecretField label="API Key" value={value.apiKey} onChange={(v) => onChange(at("apiKey"), v)} />
                    )}
                </div>

                <div className="card-divider" />

                <Field label="검색 설정" hint="생성기 고정값입니다. 바꿀 일이 생기면 알려주세요.">
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span className="locked-chip" title="근사 최근접 탐색 인덱스. HNSW 는 색인·질의 모두 무난한 기본값입니다.">
                            <IconLock size={12} />index <b>{VECTOR_INDEX_TYPE}</b>
                        </span>
                        <span className="locked-chip" title="두 벡터가 얼마나 비슷한지 재는 척도. 코사인은 길이를 무시하고 방향만 비교해 정규화된 임베딩의 표준입니다.">
                            <IconLock size={12} />distance <b>{VECTOR_DISTANCE_TYPE}</b>
                        </span>
                    </div>
                </Field>

                <div className="card-divider" />

                <Field label="Initialize Schema">
                    <Toggle
                        name="스키마 자동 생성"
                        desc="기동 시 벡터 테이블·인덱스를 만듭니다"
                        checked={value.initializeSchema}
                        onChange={(v) => onChange(at("initializeSchema"), v)}
                    />
                </Field>

                {value.initializeSchema && (
                    <Note warn icon={<IconWarn size={15} />}>
                        <b>초기화를 마친 뒤에는 반드시</b>{" "}
                        <span className="mono">spring.sql.init.mode</span> 를{" "}
                        <span className="mono">never</span> 로 바꾸세요. 그대로 두면 재기동할 때마다 초기화
                        스크립트가 다시 실행되어 적재해 둔 벡터 데이터가 사라질 수 있습니다.
                    </Note>
                )}
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

    /* 규칙 위반 값 교정은 ProfileDetail 에서 프로필 단위로 한다.
       (탭을 열지 않아도 Push 가 일관된 결과를 내도록) */

    if (!service) return null;

    const at = (...keys) => [...basePath, ...keys];
    const ormOn = service.enabled?.orm === true && !!service.orm && !!service.datasource;
    const vectorOn = service.enabled?.vector === true && !!service.vectorsource;
    const clientOn = service.enabled?.client === true && Array.isArray(service.interServers);
    const interServers = Array.isArray(service.interServers) ? service.interServers : [];

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
                                <TextField label="Address : Port" value={service.datasource.addressAndPort} onChange={(v) => onChange(at("datasource", "addressAndPort"), v)} />
                                <TextField label="Database" value={service.datasource.databaseName} onChange={(v) => onChange(at("datasource", "databaseName"), v)} />
                            </div>
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

            {/* ── Vector Store (Vector 토글이 지배) ── */}
            {vectorOn && (
                <>
                    <SubGroup
                        icon={<IconVector size={13} />}
                        count="vectorsource"
                        note={<><b>Vector</b> 토글로 이 블록을 통째로 켜고 끕니다. 이 접속 정보로 Spring AI VectorStore 와 그 datasource 가 함께 구성되고, 임베딩 모델·차원은 Overview 의 Vector Provider 에서 정합니다.</>}
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
                        <b>ORM · Vector · Client</b> 토글은 바로 위의 설정 블록을 통째로 켜고 끕니다.
                    </>
                }
            >
                Modules
            </SubGroup>
            <Card>
                <CardBody>
                    <div className="togglegrid">
                        {MODULE_KEYS.map((key) => {
                            const state = moduleState(role, key);
                            const meta = MODULE_META[key];
                            const locked = state !== "editable";
                            return (
                                <Toggle
                                    key={key}
                                    name={meta.label}
                                    desc={
                                        state === "forcedOn" ? "항상 켜짐 · 변경 불가"
                                            : state === "forcedOff" ? `${role === ROLE.BACKEND ? "Gateway / Notification" : "Backend"} 전용`
                                                : meta.desc
                                    }
                                    checked={state === "forcedOn" ? true : state === "forcedOff" ? false : !!service.enabled?.[key]}
                                    locked={locked}
                                    lockTitle={
                                        state === "forcedOn"
                                            ? `${rules.label} 은(는) 항상 ${meta.label} 을(를) 사용합니다 — 변경 불가`
                                            : state === "forcedOff"
                                                ? `${rules.label} 에서는 ${meta.label} 을(를) 사용하지 않습니다`
                                                : undefined
                                    }
                                    onChange={(v) => onChange(at("enabled", key), v)}
                                />
                            );
                        })}
                    </div>
                </CardBody>
            </Card>
            {onRemove && (
                <div className="acc-foot">
                    <button type="button" className="btn btn-sm btn-danger" onClick={onRemove}>
                        <IconTrash size={13} />{rules.label} {String(index + 1).padStart(2, "0")} 삭제
                    </button>
                </div>
            )}
        </Accordion>
    );
}
