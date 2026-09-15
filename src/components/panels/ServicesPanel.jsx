import React from "react";
import { ROLE, ROLE_RULES, createService } from "../../config/rules";
import ServiceCard from "../ServiceCard";
import { SectionHead, AddButton, EmptyBox } from "../ui/primitives";
import { IconBox, IconGateway, IconBell } from "../ui/icons";

const SECTION_ICON = {
    [ROLE.BACKEND]: IconBox,
    [ROLE.GATEWAY]: IconGateway,
    [ROLE.NOTIFICATION]: IconBell,
};

function Section({ role, children, onAdd, addLabel }) {
    const rules = ROLE_RULES[role];
    const Icon = SECTION_ICON[role];
    return (
        <div style={{ marginBottom: 26 }}>
            <SectionHead
                icon={<Icon size={14} />}
                title={rules.label === "Backend" ? "Backends" : rules.label}
                desc={rules.sectionDesc}
                path={rules.path}
                tone={rules.tone}
            />
            {children}
            {onAdd && <AddButton sm={false} block onClick={onAdd}>{addLabel}</AddButton>}
        </div>
    );
}

export default function ServicesPanel({ profile, onChange }) {
    const projects = Array.isArray(profile.projects) ? profile.projects : [];

    const addProject = () => {
        const name = `backend-${projects.length + 1}`;
        onChange(["projects"], [...projects, createService(ROLE.BACKEND, name)]);
    };

    return (
        <div className="panel">

            <Section role={ROLE.BACKEND} onAdd={addProject} addLabel="Backend 추가">
                {projects.length === 0 && <EmptyBox icon={<IconBox size={22} />}>등록된 백엔드 없음</EmptyBox>}
                {projects.map((project, i) => (
                    <ServiceCard
                        key={i}
                        role={ROLE.BACKEND}
                        service={project}
                        basePath={["projects", i]}
                        index={i}
                        defaultOpen={i === 0}
                        onChange={onChange}
                        onRemove={() => onChange(["projects"], projects.filter((_, j) => j !== i))}
                    />
                ))}
            </Section>

            {[ROLE.GATEWAY, ROLE.NOTIFICATION].map((role) => {
                const key = ROLE_RULES[role].path;   // 'gateway' | 'notification'
                const service = profile[key];
                return (
                    <Section
                        key={role}
                        role={role}
                        onAdd={service ? null : () => onChange([key], createService(role, `new-${key}`))}
                        addLabel={`${ROLE_RULES[role].label} 추가`}
                    >
                        {service ? (
                            <ServiceCard
                                role={role}
                                service={service}
                                basePath={[key]}
                                defaultOpen
                                onChange={onChange}
                            />
                        ) : (
                            <EmptyBox>{ROLE_RULES[role].label} 없음</EmptyBox>
                        )}
                    </Section>
                );
            })}

        </div>
    );
}
