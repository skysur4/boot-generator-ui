import React from "react";
import {
    ROLE, ROLE_RULES, MODULE_KEYS, MODULE_META, moduleState,
    DATABASES, RESPONSIBILITY_SEGREGATION,
    createDatasource, createOrm, createInterServer, normalizeService,
} from "../config/rules";
import { Card, CardHead, CardBody, SubGroup, Accordion, EmptyBox, AddButton, Note, Badge } from "./ui/primitives";
import { Field, TextField, NumberField, SecretField, SegmentedField, ChipRadioField, Toggle, ListRow } from "./ui/fields";
import {
    IconBox, IconGateway, IconBell, IconDatabase, IconServers, IconFilter,
    IconLayers, IconPlus, IconX, IconTrash, IconWarn,
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
    if (service.datasource?.type) out.push(<Badge key="db" tone="b" mono>{service.datasource.type}</Badge>);
    else out.push(<Badge key="nodb" title="datasource 없음">DB 없음</Badge>);
    if (service.orm?.type) out.push(<Badge key="orm" tone={role === ROLE.BACKEND ? "" : "v"} mono>{service.orm.type}</Badge>);
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
                <ListRow
                    key={i}
                    onRemove={() => setDomains(domains.filter((_, j) => j !== i))}
                    removeLabel="도메인 삭제"
                >
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

/* ── 서비스 카드 본체 ────────────────────────────────────── */
export default function ServiceCard({
    role,
    service,
    basePath,          // ['projects', i] | ['gateway'] | ['notification']
    index,             // 배열일 때만
    defaultOpen = false,
    onChange,          // (path, value) => void
    onRemove,          // 배열일 때만
}) {
    const rules = ROLE_RULES[role];
    const [open, setOpen] = React.useState(defaultOpen);
    const RoleIcon = ROLE_ICON[role];

    /* 규칙 위반 값 자동 교정 (바뀔 게 있을 때만 호출) */
    React.useEffect(() => {
        const fixed = normalizeService(service, role);
        if (fixed) onChange(basePath, fixed);
        // basePath 는 매 렌더 새 배열이라 의존성에서 제외한다.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [service, role]);

    if (!service) return null;

    const at = (...keys) => [...basePath, ...keys];
    const hasDatasource = !!service.datasource;
    const hasOrm = !!service.orm;
    const hasInterServers = Array.isArray(service.interServers);
    const interServers = hasInterServers ? service.interServers : [];
    const canStrip = rules.optionalSections.length > 0;

    const stripBtn = (key) => canStrip && rules.optionalSections.includes(key) ? (
        <button
            type="button"
            className="btn btn-sm btn-ghost"
            title={`${key} 키 제거`}
            onClick={() => onChange(at(key), undefined)}
        >
            <IconX size={13} />제거
        </button>
    ) : null;

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
                        Datasource · ORM · Inter Servers 는 <b>선택</b>입니다.
                    </Note>
                </div>
            )}

            {/* ── 기본 정보 + Datasource ── */}
            <div className="grid-cards">
                <Card>
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

                {hasDatasource ? (
                    <Card>
                        <CardHead
                            icon={<IconDatabase size={13} />}
                            title="Datasource"
                            hint={`${rules.path.replace("[]", "")}.datasource`}
                            actions={stripBtn("datasource")}
                        />
                        <CardBody>
                            <ChipRadioField
                                label="Type"
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
                ) : null}
            </div>

            {/* ── Modules ── */}
            <SubGroup icon={<IconPlus size={13} />} count={`${rules.path.replace("[]", "")}.enabled`}>Modules</SubGroup>
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
                    <div className="f-hint" style={{ marginTop: 8 }}>
                        {rules.modules.forcedOn.length > 0 && (
                            <>
                                {rules.label} 는 <b style={{ color: "var(--fg-2)" }}>
                                    {rules.modules.forcedOn.map((k) => MODULE_META[k].label).join(" · ")}
                                </b> 고정,{" "}
                            </>
                        )}
                        <b style={{ color: "var(--fg-2)" }}>
                            {rules.modules.allowed.map((k) => MODULE_META[k].label).join(" · ")}
                        </b>{" "}
                        {rules.modules.allowed.length}개를 선택할 수 있습니다.
                        {rules.modules.forcedOn.length === 0 && ` (${rules.label} 전용)`}
                    </div>
                </CardBody>
            </Card>

            {/* ── ORM ── */}
            {hasOrm ? (
                <>
                    <SubGroup
                        icon={<IconLayers size={13} />}
                        optional={rules.optionalSections.includes("orm")}
                        action={stripBtn("orm")}
                    >
                        ORM
                    </SubGroup>
                    <Card>
                        <CardBody>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                                <SegmentedField
                                    label="Type"
                                    tag={rules.orm.tag}
                                    tagTone={rules.orm.tagTone}
                                    value={service.orm.type}
                                    options={["JPA", "MYBATIS", "R2DBC"]}
                                    disabledOptions={["JPA", "MYBATIS", "R2DBC"].filter((o) => !rules.orm.options.includes(o))}
                                    disabledTitle={rules.orm.blockedNote}
                                    onChange={(v) => onChange(at("orm", "type"), v)}
                                    name={`${basePath.join(".")}-orm`}
                                    hint={rules.orm.note}
                                />
                                <Field label="SQL Logging">
                                    <Toggle
                                        name="Log SQL"
                                        desc="show-sql · formatted"
                                        checked={service.orm.logSql}
                                        onChange={(v) => onChange(at("orm", "logSql"), v)}
                                    />
                                </Field>
                            </div>
                        </CardBody>
                    </Card>
                </>
            ) : null}

            {/* ── Inter Servers ── */}
            {hasInterServers ? (
                <>
                    <SubGroup
                        icon={<IconServers size={13} />}
                        count={interServers.length}
                        optional={rules.optionalSections.includes("interServers")}
                        action={stripBtn("interServers")}
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
                    <AddButton onClick={() => onChange(at("interServers"), [...interServers, createInterServer()])}>
                        Inter Server 추가
                    </AddButton>
                </>
            ) : null}

            {/* ── 빠진 선택 섹션 추가 ── */}
            {canStrip && (!hasDatasource || !hasOrm || !hasInterServers) && (
                <>
                    <SubGroup optional>선택 섹션</SubGroup>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {!hasDatasource && (
                            <AddButton onClick={() => onChange(at("datasource"), createDatasource())}>Datasource 추가</AddButton>
                        )}
                        {!hasOrm && (
                            <AddButton onClick={() => onChange(at("orm"), createOrm(role))}>
                                ORM 추가 <span className="mono" style={{ opacity: .7 }}>{rules.orm.options[0]}</span>
                            </AddButton>
                        )}
                        {!hasInterServers && (
                            <AddButton onClick={() => onChange(at("interServers"), [])}>Inter Servers 추가</AddButton>
                        )}
                    </div>
                </>
            )}

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
