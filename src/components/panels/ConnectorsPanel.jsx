import React from "react";
import {
    connectorPurpose, CONNECTOR_META, CONNECTOR_NAMES,
    availableConnectorNames, createExternalConnectorFor,
} from "../../config/rules";
import { Card, CardHead, CardBody, Note, AddButton, EmptyBox } from "../ui/primitives";
import { ListRow } from "../ui/fields";
import { IconPlug, IconInfo, IconPulse, IconMonitor } from "../ui/icons";

function RuleRow({ badge, children }) {
    return (
        <>
            {badge}
            <span>{children}</span>
        </>
    );
}

export default function ConnectorsPanel({ profile, onChange }) {
    const connectors = Array.isArray(profile.externalConnectors) ? profile.externalConnectors : [];

    const setAt = (index, key, value) => onChange(["externalConnectors", index, key], value);
    const remove = (index) => onChange(["externalConnectors"], connectors.filter((_, j) => j !== index));
    const add = () => {
        const created = createExternalConnectorFor(profile);
        if (created) onChange(["externalConnectors"], [...connectors, created]);
    };

    /* 이름을 바꿀 때 기본 포트도 같이 옮긴다 (이전 이름의 기본 포트를 쓰고 있었을 때만) */
    const rename = (index, name) => {
        const current = connectors[index];
        const previous = CONNECTOR_META[String(current?.name || "").toLowerCase()];
        setAt(index, "name", name);
        if (previous && Number(current?.port) === previous.port) {
            const port = CONNECTOR_META[name].port;
            setAt(index, "port", typeof current.port === "string" ? String(port) : port);
        }
    };

    const remaining = availableConnectorNames(profile);

    return (
        <div className="panel">
            <div style={{ maxWidth: 820, marginBottom: 16 }}>
                <Note icon={<IconInfo size={15} />}>
                    <b>커넥터는 아래 중 하나라도 사용할 때 필요합니다.</b> 관련 설정이 켜진 커넥터는{" "}
                    <b>색으로 표시</b>되고, 꺼진 것은 흐리게 보입니다 — 흐려도 오류는 아니고 그냥 무시됩니다.
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "auto 1fr",
                            gap: "6px 10px",
                            marginTop: 8,
                            fontSize: 11.5,
                            alignItems: "center",
                        }}
                    >
                        <RuleRow badge={<span className="why why-b"><IconPulse size={11} />Message Broker</span>}>
                            Overview 의 Message Broker 가 <span className="mono">KAFKA · REDIS · NATS</span> 중 하나일 때 — 해당 브로커의 주소·포트
                        </RuleRow>
                        <RuleRow badge={<span className="why why-g"><IconMonitor size={11} />Frontend</span>}>
                            프론트엔드를 함께 띄울 때 — CORS 허용 및 게이트웨이 라우팅 대상
                        </RuleRow>
                    </div>
                    <div style={{ marginTop: 8 }}>
                        OTel 컬렉터는 커넥터가 아니라 <b>Overview 의 Infrastructure</b> 카드에서 설정합니다.
                    </div>
                </Note>
            </div>

            <Card style={{ maxWidth: 820 }}>
                <CardHead icon={<IconPlug size={13} />} title="External Connectors" hint="externalConnectors[]" />
                <CardBody>
                    {connectors.length === 0 && <EmptyBox icon={<IconPlug size={22} />}>등록된 커넥터 없음</EmptyBox>}

                    {connectors.map((connector, i) => {
                        const purpose = connectorPurpose(connector.name, profile);
                        const name = String(connector.name || "").toLowerCase();
                        const options = availableConnectorNames(profile, name);
                        return (
                            <ListRow key={i} onRemove={() => remove(i)} removeLabel="커넥터 삭제">
                                <div className="selectwrap" style={{ flex: 1.2 }}>
                                    <select
                                        className="input select"
                                        value={CONNECTOR_NAMES.includes(name) ? name : ""}
                                        onChange={(e) => rename(i, e.target.value)}
                                    >
                                        {!CONNECTOR_NAMES.includes(name) && (
                                            <option value="" disabled>{connector.name || "(이름 없음)"}</option>
                                        )}
                                        {options.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                                <input
                                    className="input"
                                    style={{ flex: 2 }}
                                    value={connector.domain ?? ""}
                                    onChange={(e) => setAt(i, "domain", e.target.value)}
                                />
                                <input
                                    className="input"
                                    style={{ width: 96, flexShrink: 0 }}
                                    inputMode="numeric"
                                    value={connector.port ?? ""}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        if (raw !== "" && !/^\d*$/.test(raw)) return;
                                        const wasString = typeof connector.port === "string";
                                        setAt(i, "port", raw === "" ? (wasString ? "" : null) : (wasString ? raw : Number(raw)));
                                    }}
                                />
                                <span
                                    className={`why ${purpose.active && purpose.tone ? `why-${purpose.tone}` : "why-off"}`}
                                    title={purpose.title}
                                >
                                    {purpose.label}
                                </span>
                            </ListRow>
                        );
                    })}

                    {remaining.length > 0 ? (
                        <AddButton onClick={add}>Connector 추가</AddButton>
                    ) : (
                        <div className="f-hint" style={{ marginTop: 8 }}>
                            등록할 수 있는 커넥터({CONNECTOR_NAMES.join(" · ")})를 모두 등록했습니다.
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
