/**
 * 서비스 유형별 제약 규칙.
 *
 * 화면과 정규화 로직이 공유하는 단일 출처. 규칙이 바뀌면 이 파일만 고친다.
 */

/* ── 서비스 역할 ─────────────────────────────────────────── */
export const ROLE = {
    BACKEND: "backend",
    GATEWAY: "gateway",
    NOTIFICATION: "notification",
};

/* ── 모듈(enabled) 메타 ──────────────────────────────────── */
export const MODULE_KEYS = [
    "hexagonal", "authentication", "session", "roles", "orm", "ai",
    "event", "notice", "client", "openapi", "swagger", "monitoring",
];

export const MODULE_META = {
    hexagonal:      { label: "Hexagonal",      desc: "헥사고널 프로젝트" },
    authentication: { label: "Authentication", desc: "인증 연동" },
    session:        { label: "Session",        desc: "세션 사용" },
    roles:          { label: "Roles",          desc: "롤 적용" },
    orm:            { label: "ORM",            desc: "DB 사용" },
    ai:             { label: "AI",             desc: "AI 연동" },
    event:          { label: "Event",          desc: "이벤트 발송" },
    notice:         { label: "Notice",         desc: "알림 발송" },
    client:         { label: "Client",         desc: "외부 API 호출" },
    openapi:        { label: "Open API",       desc: "API 외부 공유" },
    swagger:        { label: "Swagger",        desc: "API 문서 사용" },
    monitoring:     { label: "Monitoring",     desc: "Otel 연동" },
};

/* ── ORM / Datasource 선택지 ─────────────────────────────── */
export const ORM_BLOCKING = ["JPA", "MYBATIS"];
export const ORM_REACTIVE = ["R2DBC"];
export const DATABASES = ["postgresql", "mysql", "mariadb", "oracle", "sqlserver", "h2"];

/* ── 루트 레벨 선택지 ────────────────────────────────────── */
export const AUTHENTICATOR_TYPES = ["KEYCLOAK", "GOOGLE", "NAVER", "KAKAO"];
export const AI_TYPES = ["LOCAL", "OPENAI", "ANTHROPIC"];
export const MESSAGE_BROKERS = ["APP", "KAFKA", "REDIS", "NATS"];
export const RESPONSIBILITY_SEGREGATION = ["BOTH", "COMMAND", "QUERY"];

/** 커넥터가 필요해지는 messageBroker 값 (APP 은 인메모리라 불필요) */
export const BROKERS_NEEDING_CONNECTOR = ["KAFKA", "REDIS", "NATS"];

/* ── 역할별 규칙 ─────────────────────────────────────────── */
/**
 * modules.allowed  : 사용자가 켜고 끌 수 있는 키
 * modules.forcedOn : 항상 true 이며 변경 불가한 키
 * (allowed 에도 forcedOn 에도 없는 키 = 항상 false, 변경 불가)
 *
 * optionalSections : 통째로 넣고 뺄 수 있는 하위 객체
 */
export const ROLE_RULES = {
    [ROLE.BACKEND]: {
        label: "Backend",
        roleBadge: "BACKEND",
        tone: "g",
        path: "projects[]",
        sectionDesc: "배열 · 여러 개 추가 가능",
        isArray: true,
        modules: {
            allowed: ["hexagonal", "orm", "ai", "event", "notice", "openapi", "client", "swagger", "monitoring", "roles"],
            forcedOn: [],
        },
        orm: {
            options: ORM_BLOCKING,
            tag: "BLOCKING",
            tagTone: "g",
            note: "Backend 는 블로킹 스택이라 R2DBC 를 쓰지 않습니다.",
            blockedNote: "R2DBC 는 Reactive 전용 — Gateway / Notification 에서만 사용",
        },
        hasResponsibilitySegregation: true,
        optionalSections: [],
    },
    [ROLE.GATEWAY]: {
        label: "Gateway",
        roleBadge: "GATEWAY",
        tone: "b",
        path: "gateway",
        sectionDesc: "단일 객체 · 최대 1개",
        isArray: false,
        modules: {
            allowed: ["orm", "ai", "client", "swagger", "monitoring", "session", "authentication"],
            forcedOn: ["hexagonal"],
        },
        orm: {
            options: ORM_REACTIVE,
            tag: "REACTIVE",
            tagTone: "v",
            note: "Reactive 스택이라 R2DBC 만 사용합니다.",
            blockedNote: "Gateway 는 Reactive 스택 — 블로킹 ORM 사용 불가",
        },
        hasResponsibilitySegregation: false,
        optionalSections: ["datasource", "orm", "interServers"],
    },
    [ROLE.NOTIFICATION]: {
        label: "Notification",
        roleBadge: "NOTIFIER",
        tone: "v",
        path: "notification",
        sectionDesc: "단일 객체 · 최대 1개",
        isArray: false,
        modules: {
            allowed: ["orm", "ai", "client", "swagger", "monitoring"],
            forcedOn: ["hexagonal", "notice"],
        },
        orm: {
            options: ORM_REACTIVE,
            tag: "REACTIVE",
            tagTone: "v",
            note: "Reactive 스택이라 R2DBC 만 사용합니다.",
            blockedNote: "Notification 은 Reactive 스택 — 블로킹 ORM 사용 불가",
        },
        hasResponsibilitySegregation: false,
        optionalSections: ["datasource", "orm", "interServers"],
    },
};

/** 모듈 키가 이 역할에서 어떤 상태인지 */
export function moduleState(role, key) {
    const rules = ROLE_RULES[role];
    if (rules.modules.forcedOn.includes(key)) return "forcedOn";
    if (rules.modules.allowed.includes(key)) return "editable";
    return "forcedOff";
}

/* ── 새 객체 기본값 ──────────────────────────────────────── */
export function createDatasource() {
    return {
        type: "postgresql",
        addressAndPort: "localhost:5432",
        databaseName: null,
        username: null,
        password: null,
        schemaFilter: "%",
        tableFilter: "%",
        columnFilter: "%",
    };
}

export function createOrm(role) {
    return { type: ROLE_RULES[role].orm.options[0], logSql: true };
}

/** 샘플 JSON 의 interServer 에는 responsibilitySegregation 이 없다 — 넣지 않는다. */
export function createInterServer() {
    return { name: "new-server", url: "http://localhost:8080", artifact: "", domains: [] };
}

export function createExternalConnector() {
    return { name: "new-connector", domain: "localhost", port: 8080 };
}

export function createEnabled(role) {
    const out = {};
    MODULE_KEYS.forEach((key) => {
        out[key] = moduleState(role, key) === "forcedOn";
    });
    return out;
}

export function createService(role, name) {
    const base = {
        name,
        desc: "",
        localPort: "8080",
        enabled: createEnabled(role),
    };
    if (role === ROLE.BACKEND) {
        base.datasource = createDatasource();
        base.orm = createOrm(role);
        base.responsibilitySegregation = "BOTH";
        base.interServers = [];
    }
    return base;
}

/* ── 정규화 ──────────────────────────────────────────────── */
/**
 * 규칙에 어긋난 값을 바로잡는다. 바꿀 게 없으면 null 을 돌려준다
 * (호출부에서 불필요한 setState 를 피하기 위함).
 */
export function normalizeService(service, role) {
    if (!service) return null;
    const rules = ROLE_RULES[role];
    let changed = false;
    const next = { ...service };

    // 1) enabled 플래그를 규칙에 맞춘다
    const enabled = { ...(service.enabled || {}) };
    MODULE_KEYS.forEach((key) => {
        const state = moduleState(role, key);
        if (state === "forcedOn" && enabled[key] !== true) { enabled[key] = true; changed = true; }
        if (state === "forcedOff" && enabled[key] === true) { enabled[key] = false; changed = true; }
    });
    if (changed) next.enabled = enabled;

    // 2) ORM 타입이 스택에 맞지 않으면 허용된 첫 값으로
    if (service.orm && !rules.orm.options.includes(service.orm.type)) {
        next.orm = { ...service.orm, type: rules.orm.options[0] };
        changed = true;
    }

    // 3) 이 역할에 없는 필드는 제거
    if (!rules.hasResponsibilitySegregation && "responsibilitySegregation" in next) {
        delete next.responsibilitySegregation;
        changed = true;
    }

    return changed ? next : null;
}

/* ── 커넥터 용도 판정 ────────────────────────────────────── */
/**
 * 커넥터 이름으로 용도를 추정한다. 이름 규칙에 기댄 휴리스틱이라
 * 생성기 동작을 단정하지 않고 "등록됨"으로만 표기한다.
 */
export function connectorPurpose(name, profile) {
    const key = String(name || "").toLowerCase();
    const broker = profile?.messageBroker;

    if (["kafka", "redis", "nats"].some((b) => key.includes(b))) {
        const active = BROKERS_NEEDING_CONNECTOR.includes(broker) && key.includes(String(broker).toLowerCase());
        return {
            label: active ? "Message Broker" : "Broker · 등록됨",
            tone: active ? "b" : "",
            title: active
                ? `messageBroker 가 ${broker} 이라 이 커넥터가 사용됩니다`
                : "현재 messageBroker 설정에서는 무시됩니다 (오류 아님)",
        };
    }
    if (key.includes("otel") || key.includes("telemetry") || key.includes("collector")) {
        const active = anyMonitoringEnabled(profile);
        return {
            label: active ? "Monitoring" : "Monitoring · 등록됨",
            tone: active ? "v" : "",
            title: active
                ? "monitoring 을 켠 서비스가 있어 이 커넥터가 사용됩니다"
                : "monitoring 을 켠 서비스가 없어 무시됩니다 (오류 아님)",
        };
    }
    if (key.includes("front") || key.includes("web") || key.includes("ui")) {
        return { label: "Frontend", tone: "g", title: "CORS 허용 및 게이트웨이 라우팅 대상" };
    }
    return { label: "기타 · 등록됨", tone: "", title: "용도를 자동으로 판정하지 못했습니다" };
}

export function anyMonitoringEnabled(profile) {
    if (!profile) return false;
    const services = [
        ...(Array.isArray(profile.projects) ? profile.projects : []),
        profile.gateway,
        profile.notification,
    ];
    return services.some((s) => s?.enabled?.monitoring === true);
}

/* ── 비밀값 취급 ─────────────────────────────────────────── */
export const SECRET_KEYS = ["clientSecret", "apiKey", "password"];

export function isSecretKey(key) {
    return SECRET_KEYS.includes(key);
}

/** JSON 미리보기용 — 비밀값을 마스킹한 사본을 만든다. */
export function maskSecrets(value) {
    if (Array.isArray(value)) return value.map(maskSecrets);
    if (value && typeof value === "object") {
        const out = {};
        Object.entries(value).forEach(([k, v]) => {
            out[k] = isSecretKey(k) && typeof v === "string" && v.length > 0
                ? "•".repeat(Math.min(16, v.length))
                : maskSecrets(v);
        });
        return out;
    }
    return value;
}
