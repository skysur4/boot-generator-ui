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
    "authentication", "session", "roles", "orm", "ai", "vector",
    "event", "notice", "client", "openapi", "monitoring", "hexagonal",
];

/**
 * 직렬화용 enabled 키 순서.
 * MODULE_KEYS 는 토글 그리드의 화면 배치 순서라 용도가 다르다.
 * 이 배열은 생성기가 내려주는 실제 프로필의 키 순서와 같게 맞춰 둔다.
 */
export const ENABLED_KEY_ORDER = [
    "hexagonal", "authentication", "session", "roles", "orm", "ai",
    "event", "notice", "client", "openapi", "monitoring", "vector",
];

export const MODULE_META = {
    authentication: { label: "Authentication", desc: "인증 연동" },
    session:        { label: "Session",        desc: "세션 사용" },
    roles:          { label: "Roles",          desc: "롤 적용" },
    orm:            { label: "ORM",            desc: "DB 사용" },
    ai:             { label: "AI",             desc: "AI 연동" },
    event:          { label: "Event",          desc: "이벤트 발송" },
    notice:         { label: "Notice",         desc: "알림 발송" },
    client:         { label: "Client",         desc: "외부 API 호출" },
    openapi:        { label: "Open API",       desc: "API 외부 공유" },
    vector:         { label: "Vector",         desc: "Embedding 사용" },
    monitoring:     { label: "Monitoring",     desc: "Otel 연동" },
    hexagonal:      { label: "Hexagonal",      desc: "헥사고널 패턴 사용" },
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

/* ── Vector : 임베딩 공급자 (루트, ai 와 같은 층) ────────── */
export const VECTOR_PROVIDERS = ["LOCAL", "OPENAI", "VOYAGE"];

export const VECTOR_PROVIDER_META = {
    LOCAL:  { desc: "인-프로세스 ONNX 또는 자체 추론 서버", needsApiKey: false, urlHint: "자체 추론 서버를 쓰면 주소, 인-프로세스면 비움" },
    OPENAI: { desc: "OpenAI Embeddings API",              needsApiKey: true,  urlHint: "프록시/게이트웨이를 거칠 때만 입력" },
    VOYAGE: { desc: "Voyage AI (Anthropic 권장 임베딩)",   needsApiKey: true,  urlHint: "비우면 공개 API, 채우면 프라이빗 엔드포인트" },
};

/**
 * 모델별 지원 차원.
 * dims[0] 이 그 모델의 기본값이다. 값이 하나뿐이면 화면에서 잠근다.
 *
 * 출처
 *  - all-MiniLM-L6-v2 384  : Spring AI Transformers(ONNX) 기본 모델
 *  - KURE-v1 1024          : nlpai-lab/KURE-v1 (BAAI/bge-m3 파인튜닝)
 *  - multilingual-e5-large : 1024
 *  - text-embedding-3-*    : 기본 1536 / 3072, dimensions 파라미터로 축소 가능
 *  - voyage-*              : 기본 1024, 256·512·1024·2048 지원
 */
export const EMBEDDING_MODELS = {
    LOCAL: [
        { id: "all-MiniLM-L6-v2",      dims: [384],  desc: "Spring AI 기본 · 가장 가벼움" },
        { id: "KURE-v1",               dims: [1024], desc: "한국어 검색 특화 · bge-m3 기반" },
        { id: "multilingual-e5-large", dims: [1024], desc: "다국어 · 로컬에서 안정적" },
    ],
    OPENAI: [
        { id: "text-embedding-3-small", dims: [1536, 1024, 512, 256],       desc: "기본 1536 · 축소 가능" },
        { id: "text-embedding-3-large", dims: [3072, 2048, 1024, 512, 256], desc: "기본 3072 · 축소 가능" },
    ],
    VOYAGE: [
        { id: "voyage-3-large",  dims: [1024, 2048, 512, 256], desc: "범용 고성능" },
        { id: "voyage-3.5",      dims: [1024, 2048, 512, 256], desc: "범용" },
        { id: "voyage-3.5-lite", dims: [1024, 2048, 512, 256], desc: "경량·저비용" },
        { id: "voyage-code-3",   dims: [1024, 2048, 512, 256], desc: "코드 검색" },
    ],
};

export function findEmbeddingModel(type, modelId) {
    return (EMBEDDING_MODELS[type] || []).find((m) => m.id === modelId) || null;
}

/* ── Vector : 저장소 (서비스별) ──────────────────────────── */
export const VECTOR_STORES = [
    { id: "pgvector", label: "PGVector", scale: "기본",        fields: ["addressAndPort", "databaseName", "username", "password"] },
    { id: "qdrant",     label: "Qdrant",     scale: "~1M",        fields: ["addressAndPort", "collectionName", "apiKey"] },
    { id: "weaviate",   label: "Weaviate",   scale: "1M~50M",     fields: ["addressAndPort", "collectionName", "apiKey"] },
    { id: "milvus",     label: "Milvus",     scale: "50M~",       fields: ["addressAndPort", "databaseName", "collectionName", "username", "password"] },
];

export function findVectorStore(id) {
    return VECTOR_STORES.find((s) => s.id === id) || VECTOR_STORES[0];
}

/** 화면에서는 잠그고 값만 JSON 에 싣는다. Spring AI PgVectorStore 기본값과 동일. */
export const VECTOR_INDEX_TYPE = "HNSW";
export const VECTOR_DISTANCE_TYPE = "COSINE_DISTANCE";

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
            allowed: ["hexagonal", "orm", "ai", "event", "notice", "openapi", "client", "vector", "monitoring", "roles"],
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
            allowed: ["orm", "ai", "client", "vector", "monitoring", "session", "authentication"],
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
        optionalSections: [],
    },
    [ROLE.NOTIFICATION]: {
        label: "Notification",
        roleBadge: "NOTIFIER",
        tone: "v",
        path: "notification",
        sectionDesc: "단일 객체 · 최대 1개",
        isArray: false,
        modules: {
            allowed: ["orm", "ai", "client", "vector", "monitoring"],
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
        optionalSections: [],
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

/**
 * 루트의 임베딩 공급자 (ai 와 같은 층).
 * 기본값은 AI Provider 와 같은 계열인 OpenAI 임베딩.
 */
export function createVector() {
    const model = EMBEDDING_MODELS.OPENAI[0];          // text-embedding-3-small
    return { type: "OPENAI", model: model.id, dimensions: model.dims[0], url: null, apiKey: null };
}

/** 서비스별 벡터 저장소 */
export function createVectorSource() {
    return {
        type: "postgresql",
        addressAndPort: "localhost:5432",
        databaseName: null,
        collectionName: "vector_store",
        username: null,
        password: null,
        apiKey: null,
        indexType: VECTOR_INDEX_TYPE,
        distanceType: VECTOR_DISTANCE_TYPE,
        initializeSchema: false,
    };
}

export function createEnabled(role) {
    const out = {};
    ENABLED_KEY_ORDER.forEach((key) => {
        out[key] = moduleState(role, key) === "forcedOn";
    });
    return out;
}

export function createService(role, name) {
    const enabled = createEnabled(role);
    if (role === ROLE.BACKEND) enabled.orm = true;   // orm/datasource 는 normalizeService 가 채운다

    const base = {
        name,
        desc: "",
        localPort: "8080",
        enabled,
    };
    if (role === ROLE.BACKEND) base.responsibilitySegregation = "BOTH";
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

    // 2) ORM 토글이 orm + datasource 의 존재를 지배한다
    const ormOn = enabled.orm === true;
    if (ormOn) {
        if (!isObject(next.orm)) { next.orm = createOrm(role); changed = true; }
        if (!isObject(next.datasource)) { next.datasource = createDatasource(); changed = true; }
    } else {
        if ("orm" in next) { delete next.orm; changed = true; }
        if ("datasource" in next) { delete next.datasource; changed = true; }
    }

    // 3) Client 토글이 interServers 의 존재를 지배한다
    const clientOn = enabled.client === true;
    if (clientOn) {
        if (!Array.isArray(next.interServers)) { next.interServers = []; changed = true; }
    } else if ("interServers" in next) {
        delete next.interServers; changed = true;
    }

    // 4) Vector 토글이 vectorsource 의 존재를 지배한다
    const vectorOn = enabled.vector === true;
    if (vectorOn) {
        if (!isObject(next.vectorsource)) { next.vectorsource = createVectorSource(); changed = true; }
    } else if ("vectorsource" in next) {
        delete next.vectorsource; changed = true;
    }

    // 5) ORM 타입이 스택에 맞지 않으면 허용된 첫 값으로
    if (isObject(next.orm) && !rules.orm.options.includes(next.orm.type)) {
        next.orm = { ...next.orm, type: rules.orm.options[0] };
        changed = true;
    }

    // 6) 잠긴 저장소 옵션은 항상 고정값으로
    if (isObject(next.vectorsource)) {
        const vs = next.vectorsource;
        if (vs.indexType !== VECTOR_INDEX_TYPE || vs.distanceType !== VECTOR_DISTANCE_TYPE) {
            next.vectorsource = { ...vs, indexType: VECTOR_INDEX_TYPE, distanceType: VECTOR_DISTANCE_TYPE };
            changed = true;
        }
    }

    // 7) 이 역할에 없는 필드는 제거
    if (!rules.hasResponsibilitySegregation && "responsibilitySegregation" in next) {
        delete next.responsibilitySegregation;
        changed = true;
    }

    return changed ? orderServiceKeys(next) : null;
}

function isObject(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
}

/* ── JSON 키 순서 고정 ───────────────────────────────────── */
/**
 * JS 객체는 삽입 순서를 유지하므로 값만 바꾸면 순서가 보존되지만,
 * 키를 지웠다 다시 넣으면 맨 뒤로 밀린다(ORM 토글 on/off 가 그렇다).
 * Push / JSON 미리보기 직전에 아래 순서로 다시 세워 백엔드가 항상
 * 같은 모양의 JSON 을 받게 한다. 목록에 없는 키는 원래 순서대로 뒤에 붙는다.
 */
const PROFILE_KEY_ORDER = [
    "editedAt", "description", "group", "version", "basePath",
    "messageBroker", "authenticator", "ai", "vector",
    "externalConnectors", "projects", "gateway", "notification",
];
const SERVICE_KEY_ORDER = [
    "name", "desc", "localPort", "enabled",
    "datasource", "orm", "vectorsource",
    "responsibilitySegregation", "interServers",
];
const DATASOURCE_KEY_ORDER = [
    "type", "addressAndPort", "databaseName", "username", "password",
    "schemaFilter", "tableFilter", "columnFilter",
];
const VECTORSOURCE_KEY_ORDER = [
    "type", "addressAndPort", "databaseName", "collectionName",
    "username", "password", "apiKey",
    "indexType", "distanceType", "initializeSchema",
];
const INTERSERVER_KEY_ORDER = ["name", "url", "artifact", "domains"];

function reorder(object, order) {
    if (!isObject(object)) return object;
    const out = {};
    order.forEach((key) => { if (key in object) out[key] = object[key]; });
    Object.keys(object).forEach((key) => { if (!(key in out)) out[key] = object[key]; });
    return out;
}

export function orderServiceKeys(service) {
    if (!isObject(service)) return service;
    const next = { ...service };
    if (isObject(next.enabled)) next.enabled = reorder(next.enabled, ENABLED_KEY_ORDER);
    if (isObject(next.datasource)) next.datasource = reorder(next.datasource, DATASOURCE_KEY_ORDER);
    if (isObject(next.vectorsource)) next.vectorsource = reorder(next.vectorsource, VECTORSOURCE_KEY_ORDER);
    if (Array.isArray(next.interServers)) {
        next.interServers = next.interServers.map((s) => reorder(s, INTERSERVER_KEY_ORDER));
    }
    return reorder(next, SERVICE_KEY_ORDER);
}

/**
 * 프로필 레벨 정규화.
 * 서비스 중 하나라도 vector 를 켰는데 루트 `vector` 블록이 없으면 만들어 준다.
 * 바꿀 게 없으면 null.
 */
export function normalizeProfile(profile) {
    if (!isObject(profile)) return null;

    let changed = false;
    const next = { ...profile };

    /* 1) 모든 서비스를 역할 규칙에 맞춘다.
          ServiceCard 안에서 하지 않는 이유: 그 컴포넌트는 Services 탭을 열어야
          마운트되므로, 탭을 안 열고 Push 하면 정규화가 통째로 건너뛰어진다. */
    if (Array.isArray(next.projects)) {
        const projects = next.projects.map((s) => normalizeService(s, ROLE.BACKEND) || s);
        if (projects.some((s, i) => s !== next.projects[i])) { next.projects = projects; changed = true; }
    }
    [[ROLE.GATEWAY, "gateway"], [ROLE.NOTIFICATION, "notification"]].forEach(([role, key]) => {
        if (!isObject(next[key])) return;
        const fixed = normalizeService(next[key], role);
        if (fixed) { next[key] = fixed; changed = true; }
    });

    /* 2) 서비스 중 하나라도 vector 를 켰으면 루트 vector 블록을 만든다 */
    const services = [
        ...(Array.isArray(next.projects) ? next.projects : []),
        next.gateway,
        next.notification,
    ].filter(isObject);

    if (services.some((s) => s?.enabled?.vector === true) && !isObject(next.vector)) {
        next.vector = createVector();
        changed = true;
    }

    return changed ? next : null;
}

/** Push / 미리보기 직전에 호출한다. */
export function orderProfileKeys(profile) {
    if (!isObject(profile)) return profile;
    const next = { ...profile };
    if (Array.isArray(next.projects)) next.projects = next.projects.map(orderServiceKeys);
    if (isObject(next.gateway)) next.gateway = orderServiceKeys(next.gateway);
    if (isObject(next.notification)) next.notification = orderServiceKeys(next.notification);
    return reorder(next, PROFILE_KEY_ORDER);
}

/* ── 커넥터 용도 판정 ────────────────────────────────────── */
/**
 * 커넥터 이름으로 용도를 추정하고, 그 용도를 켠 설정이 있는지 함께 본다.
 * active 면 색으로 강조하고, 아니면 흐리게 둔다 (사용 안 해도 오류는 아님).
 * 이름 규칙에 기댄 휴리스틱이라 생성기 동작을 단정하지 않는다.
 */
export function connectorPurpose(name, profile) {
    const key = String(name || "").toLowerCase();
    const broker = profile?.messageBroker;

    /* Message Broker — messageBroker 가 그 브로커일 때만 사용된다 */
    const matched = ["kafka", "redis", "nats"].find((b) => key.includes(b));
    if (matched) {
        const active = String(broker || "").toLowerCase() === matched;
        return {
            label: "Message Broker",
            tone: "b",
            active,
            title: active
                ? `messageBroker 가 ${broker} 이라 이 커넥터를 사용합니다`
                : `messageBroker 가 ${broker || "미설정"} 이라 지금은 사용하지 않습니다 (오류 아님)`,
        };
    }

    /* Monitoring — OTel 컬렉터. 서비스 중 하나라도 monitoring 을 켜면 사용된다.
       messageBroker 와는 무관하다. */
    if (key.includes("otel") || key.includes("telemetry") || key.includes("collector")) {
        const active = anyMonitoringEnabled(profile);
        return {
            label: "Monitoring",
            tone: "v",
            active,
            title: active
                ? "monitoring 을 켠 서비스가 있어 이 커넥터를 사용합니다"
                : "monitoring 을 켠 서비스가 없어 지금은 사용하지 않습니다 (오류 아님)",
        };
    }

    /* Frontend — 별도 토글이 없다. 등록해 두면 쓰는 것으로 본다. */
    if (key.includes("front") || key.includes("web") || key.includes("ui")) {
        return {
            label: "Frontend",
            tone: "g",
            active: true,
            title: "CORS 허용 및 게이트웨이 라우팅 대상",
        };
    }

    return { label: "기타", tone: "", active: false, title: "용도를 자동으로 판정하지 못했습니다" };
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
