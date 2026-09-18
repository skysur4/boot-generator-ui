import React from "react";
import { connectorPurpose, createExternalConnector } from "../../config/rules";
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
    const add = () => onChange(["externalConnectors"], [...connectors, createExternalConnector()]);

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
                            Message Broker 가 <span className="mono">KAFKA · REDIS · NATS</span> 중 하나일 때 — 해당 브로커의 주소·포트
                        </RuleRow>
                        <RuleRow badge={<span className="why why-v"><IconPulse size={11} />Monitoring</span>}>
                            서비스 중 하나라도 <span className="mono">monitoring</span> 을 켰을 때 — OTel 컬렉터
                            (트레이스·메트릭·로그 수집). Message Broker 와는 무관합니다
                        </RuleRow>
                        <RuleRow badge={<span className="why why-g"><IconMonitor size={11} />Frontend</span>}>
                            프론트엔드를 함께 띄울 때 — CORS 허용 및 게이트웨이 라우팅 대상
                        </RuleRow>
                    </div>
                </Note>
            </div>

            <Card style={{ maxWidth: 820 }}>
                <CardHead icon={<IconPlug size={13} />} title="External Connectors" hint="externalConnectors[]" />
                <CardBody>
                    {connectors.length === 0 && <EmptyBox icon={<IconPlug size={22} />}>등록된 커넥터 없음</EmptyBox>}

                    {connectors.map((connector, i) => {
                        const purpose = connectorPurpose(connector.name, profile);
                        return (
                            <ListRow key={i} onRemove={() => remove(i)} removeLabel="커넥터 삭제">
                                <input
                                    className="input"
                                    style={{ flex: 1.2 }}
                                    value={connector.name ?? ""}
                                    onChange={(e) => setAt(i, "name", e.target.value)}
                                />
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

                    <AddButton onClick={add}>Connector 추가</AddButton>
                </CardBody>
            </Card>
        </div>
    );
}
