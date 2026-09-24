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
    EVENT: "event",
};

/* ── 모듈(enabled) 메타 ──────────────────────────────────── */
export const MODULE_KEYS = [
    "authentication", "session", "roles", "orm", "ai", "embedding",
    "event", "notice", "client", "openapi", "monitoring", "hexagonal",
];

/**
 * 직렬화용 enabled 키 순서.
 * MODULE_KEYS 는 토글 그리드의 화면 배치 순서라 용도가 다르다.
 * 이 배열은 생성기가 내려주는 실제 프로필의 키 순서와 같게 맞춰 둔다.
 */
export const ENABLED_KEY_ORDER = [
    "hexagonal",  "roles", "orm", "ai", "embedding", "event", "notice",
    "client", "openapi", "monitoring", "authentication", "session",
];

export const MODULE_META = {
    authentication: { label: "Authentication", desc: "인증 연동" },
    session:        { label: "Session",        desc: "세션 사용" },
    roles:          { label: "Roles",          desc: "롤 적용" },
    orm:            { label: "ORM",            desc: "DB 연결" },
    ai:             { label: "AI",             desc: "AI 연동" },
    event:          { label: "Event",          desc: "이벤트 발송" },
    notice:         { label: "Notice",         desc: "알림 발송" },
    client:         { label: "Client",         desc: "외부 API 호출" },
    openapi:        { label: "Open API",       desc: "API 외부 공유" },
    embedding:      { label: "Embedding",      desc: "공간화 연동" },
    monitoring:     { label: "Monitoring",     desc: "Otel 연동" },
    hexagonal:      { label: "Hexagonal",      desc: "헥사고널 패턴 사용" },
};

/* ── ORM / Datasource 선택지 ─────────────────────────────── */
export const ORM_BLOCKING = ["JPA", "MYBATIS"];
export const ORM_REACTIVE = ["R2DBC"];
export const DATABASES = ["postgresql", "mysql", "mariadb", "oracle", "sqlserver", "h2"];

/* ── 루트 레벨 선택지 ────────────────────────────────────── */
export const AUTHENTICATOR_TYPES = ["KEYCLOAK", "GOOGLE", "NAVER", "KAKAO"];
export const AI_TYPES = ["OLLAMA", "OPENAI", "ANTHROPIC", "GOOGLE"];

/** 타입을 바꿀 때 채워 넣는 기본 모델 */
export const AI_DEFAULT_MODELS = {
    OLLAMA:    "meta-llama/Llama-3.2-1B",
    OPENAI:    "gpt-4o-mini",
    ANTHROPIC: "claude-sonnet-5",
    GOOGLE:    "gemini-2.5-flash",
};

/** 이전 스펙의 타입 이름 → 현재 이름 */
export const AI_TYPE_ALIASES = { LOCAL: "OLLAMA" };

/** 타입을 바꿀 때 채워 넣는 기본 URL (없으면 URL 을 건드리지 않는다) */
export const AI_DEFAULT_URLS = { OLLAMA: "http://localhost:11434" };
export const MESSAGE_BROKERS = ["APP", "KAFKA", "REDIS", "NATS"];
export const RESPONSIBILITY_SEGREGATION = ["BOTH", "COMMAND", "QUERY"];

/** 커넥터가 필요해지는 messageBroker 값 (APP 은 인메모리라 불필요) */
export const BROKERS_NEEDING_CONNECTOR = ["KAFKA", "REDIS", "NATS"];

/* ── Embedder : 임베딩 공급자 (루트, ai 와 같은 층) ──────── */
export const EMBEDDER_TYPES = ["TRANSFORMERS", "OLLAMA", "OPENAI", "GOOGLE"];

/** 이전 스펙의 타입 이름 → 현재 이름 */
export const EMBEDDER_TYPE_ALIASES = { INTERNAL: "TRANSFORMERS", LOCAL: "OLLAMA", VOYAGE: "OLLAMA" };

/**
 * urlLabel   : URL 입력 라벨 (없으면 "URL")
 * usesUrl    : URL 입력 사용 여부
 * urlModel   : 이 모델을 골랐을 때만 URL 입력을 쓴다 (없으면 타입 전체가 사용)
 * urlPrefix  : URL 앞에 항상 붙는 고정 문자열 (화면에서는 입력칸 왼쪽에 표시)
 * usesApiKey : API Key 입력 사용 여부
 * defaultUrl : 타입 · 모델을 고를 때 채워 넣는 URL (urlPrefix 포함)
 */
export const EMBEDDER_META = {
    TRANSFORMERS: {
        desc: "애플리케이션 내장 ONNX 런타임 · 외부 서버 불필요",
        usesUrl: true, usesApiKey: false,
        urlModel: "repository",
        urlPrefix: "hf.co/",
        urlLabel: "Repository",
        urlHint: "Hugging Face ONNX 저장소",
        defaultUrl: "hf.co/onnx-community/all-MiniLM-L6-v2-ONNX",
    },
    OLLAMA: {
        desc: "Ollama 서버",
        usesUrl: true, usesApiKey: false,
        urlHint: "예: http://192.168.50.200:11434",
        defaultUrl: "http://localhost:11434",
    },
    OPENAI: { desc: "OpenAI Embeddings API",        usesUrl: false, usesApiKey: true },
    GOOGLE: { desc: "Google Gemini Embeddings API", usesUrl: false, usesApiKey: true },
};

/**
 * 선택 가능한 모델과 차원 (스펙 고정 · 수동 입력 없음).
 * dims 의 첫 값이 아니라 def 가 기본 차원이다. 목록의 첫 모델이 타입의 기본 모델.
 */
export const EMBEDDING_MODELS = {
    TRANSFORMERS: [
        { id: "repository", dims: [1024, 768, 512, 384], def: 384 },
        { id: "files",      dims: [1024, 768, 512, 384], def: 384 },
    ],
    OLLAMA: [
        { id: "all-MiniLM-L6-v2",      dims: [384],  def: 384 },
        { id: "multilingual-e5-base",  dims: [768],  def: 768 },
        { id: "KURE-v1",               dims: [1024], def: 1024 },
        { id: "voyage-4-nano",         dims: [512],  def: 512 },
    ],
    OPENAI: [
        { id: "text-embedding-3-small", dims: [1536, 1024, 768, 512, 384],       def: 1024 },
        { id: "text-embedding-3-large", dims: [3072, 2048, 1536, 1024, 768, 512, 384], def: 1024 },
    ],
    GOOGLE: [
        { id: "text-embedding-004",     dims: [768],                                   def: 768 },
        { id: "gemini-embedding-001",   dims: [3072, 2048, 1536, 1024, 768, 512, 384], def: 1024 },
    ],
};

export function findEmbeddingModel(type, modelId) {
    return (EMBEDDING_MODELS[type] || []).find((m) => m.id === modelId) || null;
}

/** 타입의 기본 모델 */
export function defaultEmbeddingModel(type) {
    return (EMBEDDING_MODELS[type] || EMBEDDING_MODELS.OPENAI)[0];
}

/** 이전 스펙의 모델 이름 → 현재 이름 */
export const EMBEDDING_MODEL_ALIASES = { TRANSFORMERS: { onnx: "repository" } };

/** 지금 설정에서 URL 입력을 쓰는가 (urlModel 이 있으면 그 모델일 때만) */
export function embedderUsesUrl(embedder) {
    const meta = EMBEDDER_META[embedder?.type];
    if (!meta?.usesUrl) return false;
    return !meta.urlModel || embedder?.model === meta.urlModel;
}

/** urlPrefix 를 뗀 값 (화면 입력칸에 보여 줄 부분) */
export function stripUrlPrefix(prefix, value) {
    if (!prefix || !value) return value ?? "";
    return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

/** urlPrefix 를 붙인 값 (JSON 에 저장할 값) */
export function withUrlPrefix(prefix, value) {
    if (!prefix) return value;
    return prefix + stripUrlPrefix(prefix, value ?? "");
}

/** 유사도 임계값 (%) */
export const SIMILARITY_MIN = 0;
export const SIMILARITY_MAX = 100;
export const SIMILARITY_DEFAULT = 70;

/* ── Vector Store (서비스별 vectorsource) ────────────────── */
/**
 * 생성기의 vectorsource DTO 는 저장소 종류와 무관하게 같은 필드 집합을 받는다.
 * (template.json 의 qdrant 예시 기준) 그래서 종류별로 필드를 숨기지 않는다.
 */
export const VECTOR_STORES = [
    { id: "qdrant",   label: "Qdrant",   scale: "~1M (기본)" },
    { id: "weaviate", label: "Weaviate", scale: "1M~50M" },
    { id: "milvus",   label: "Milvus",   scale: "50M~" },
];

export function findVectorStore(id) {
    return VECTOR_STORES.find((s) => s.id === id) || VECTOR_STORES[0];
}

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
            allowed: ["hexagonal", "orm", "ai", "event", "notice", "openapi", "client", "embedding", "monitoring", "roles"],
            forcedOn: [],
            /* ORM(일반 DB) 과 AI · Embedding 은 서비스를 나눈다. AI · Embedding 은 OpenAPI 필수. */
            exclusive: { orm: ["ai", "embedding"], ai: ["orm"], embedding: ["orm"] },
            implies: { ai: ["openapi"], embedding: ["openapi"] },
        },
        orm: {
            options: ORM_BLOCKING,
            tag: "BLOCKING",
            tagTone: "g",
            note: "Backend 는 블로킹 스택이라 R2DBC 를 쓰지 않습니다.",
            blockedNote: "R2DBC 는 Reactive 전용 — Gateway / Notification / Event 에서만 사용",
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
            allowed: ["orm", "client", "monitoring", "session", "authentication"],
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
            allowed: ["client", "monitoring"],
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
    [ROLE.EVENT]: {
        label: "Event",
        roleBadge: "EVENT",
        tone: "v",
        path: "event",
        sectionDesc: "단일 객체 · 최대 1개",
        isArray: false,
        modules: {
            allowed: ["client", "monitoring"],
            forcedOn: ["hexagonal", "event"],
        },
        orm: {
            options: ORM_REACTIVE,
            tag: "REACTIVE",
            tagTone: "v",
            note: "Reactive 스택이라 R2DBC 만 사용합니다.",
            blockedNote: "Event 는 Reactive 스택 — 블로킹 ORM 사용 불가",
        },
        hasResponsibilitySegregation: false,
        optionalSections: [],
    },
};

/** 모듈 키가 이 역할에서 어떤 상태인지 (역할 규칙만 본다) */
export function moduleState(role, key) {
    const rules = ROLE_RULES[role];
    if (rules.modules.forcedOn.includes(key)) return "forcedOn";
    if (rules.modules.allowed.includes(key)) return "editable";
    return "forcedOff";
}

/**
 * 모듈 간 관계 (역할별 · ROLE_RULES.modules 참조)
 *  - exclusive : 동시에 켤 수 없는 모듈. 한쪽을 켜면 다른 쪽이 꺼진다.
 *      ORM(datasource) 과 AI · Embedding(vectorsource) 은 서비스를 나누고 API / MQ 로 잇는다.
 *  - implies   : 켜면 함께 켜지고, 켜져 있는 동안 잠기는 모듈.
 *      AI · Embedding 서비스는 API 로 노출되므로 OpenAPI 필수.
 */

/** 이 키를 켤 때 꺼야 하는 키들 */
export function moduleRivals(role, key) {
    return ROLE_RULES[role]?.modules?.exclusive?.[key] || [];
}

/** 이 키를 켤 때 함께 켜야 하는 키들 */
export function moduleImplies(role, key) {
    return ROLE_RULES[role]?.modules?.implies?.[key] || [];
}

/** 이 키를 필수로 만드는 켜진 모듈 (없으면 null) */
export function impliedBy(role, key, enabled) {
    const implies = ROLE_RULES[role]?.modules?.implies || {};
    return Object.keys(implies).find((src) => enabled?.[src] === true && implies[src].includes(key)) || null;
}

/**
 * 현재 enabled 값까지 고려한 상태.
 * { state: "forcedOn" | "forcedOff" | "editable" | "implied", by?: 원인 키 }
 */
export function moduleStateFor(role, key, enabled) {
    const state = moduleState(role, key);
    if (state !== "editable") return { state };
    const by = impliedBy(role, key, enabled);
    if (by && moduleState(role, by) !== "forcedOff") return { state: "implied", by };
    return { state };
}

/* ── 새 객체 기본값 ──────────────────────────────────────── */
export function createDatasource() {
    return {
        type: "postgresql",
        host: "localhost",
        port: "5432",
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
 * 키 순서는 template.json 의 embedder 와 같게 맞춘다.
 */
export function createEmbedder() {
    const model = defaultEmbeddingModel("OPENAI");     // text-embedding-3-small · 1024
    return {
        type: "OPENAI",
        url: null,
        apiKey: null,
        model: model.id,
        dimensions: model.def,
        similarity: SIMILARITY_DEFAULT,
    };
}

/** 서비스별 벡터 저장소 (template.json 의 vectorsource 구조) */
export function createVectorSource() {
    return {
        type: "qdrant",
        host: "localhost",
        port: "6334",
        apiKey: null,
        useTls: false,
        docName: "vector_store",
        fieldName: "content",
        databaseName: null,
        username: null,
        password: null,
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

    // 0) 이전 스펙의 enabled.vector → enabled.embedding (같은 자리에서 이름만 바꾼다)
    let enabled = { ...(service.enabled || {}) };
    if ("vector" in enabled) {
        const renamed = {};
        Object.keys(enabled).forEach((k) => {
            if (k === "vector") { if (!("embedding" in enabled)) renamed.embedding = enabled.vector; }
            else renamed[k] = enabled[k];
        });
        enabled = renamed;
        changed = true;
    }

    // 1) enabled 플래그를 규칙에 맞춘다
    MODULE_KEYS.forEach((key) => {
        const state = moduleState(role, key);
        if (state === "forcedOn" && enabled[key] !== true) { enabled[key] = true; changed = true; }
        if (state === "forcedOff" && enabled[key] === true) { enabled[key] = false; changed = true; }
    });

    // 1-b) 상호 배타: ORM 과 충돌하는 모듈이 함께 켜져 있으면 ORM 을 남긴다.
    //      (UI 토글은 확인 팝업을 거쳐 한쪽을 끄므로 이 경로는 기존 데이터 교정용)
    if (enabled.orm === true) {
        moduleRivals(role, "orm").forEach((key) => {
            if (enabled[key] === true) { enabled[key] = false; changed = true; }
        });
    }

    // 1-c) 필수 동반: AI · Embedding 이 켜져 있으면 OpenAPI 도 켠다
    Object.entries(ROLE_RULES[role].modules.implies || {}).forEach(([src, targets]) => {
        if (enabled[src] !== true) return;
        targets.forEach((t) => {
            if (moduleState(role, t) === "editable" && enabled[t] !== true) { enabled[t] = true; changed = true; }
        });
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

    // 4) Embedding 토글이 vectorsource 의 존재를 지배한다
    const embeddingOn = enabled.embedding === true;
    if (embeddingOn) {
        if (!isObject(next.vectorsource)) { next.vectorsource = createVectorSource(); changed = true; }
    } else if ("vectorsource" in next) {
        delete next.vectorsource; changed = true;
    }

    // 5) ORM 타입이 스택에 맞지 않으면 허용된 첫 값으로
    if (isObject(next.orm) && !rules.orm.options.includes(next.orm.type)) {
        next.orm = { ...next.orm, type: rules.orm.options[0] };
        changed = true;
    }

    // 6) 이 역할에 없는 필드는 제거
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
    "messageBroker", "authenticator", "ai", "embedder",
    "externalConnectors", "projects", "gateway", "notification", "event",
];
const SERVICE_KEY_ORDER = [
    "name", "desc", "localPort", "enabled",
    "datasource", "orm", "vectorsource",
    "responsibilitySegregation", "interServers",
];
const DATASOURCE_KEY_ORDER = [
    "type", "host", "port", "databaseName", "username", "password",
    "schemaFilter", "tableFilter", "columnFilter",
];
const VECTORSOURCE_KEY_ORDER = [
    "type", "host", "port", "apiKey", "useTls",
    "docName", "fieldName", "databaseName", "username", "password",
    "initializeSchema",
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
 * 서비스 중 하나라도 embedding 을 켰는데 루트 `embedder` 블록이 없으면 만들어 준다.
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
    [[ROLE.GATEWAY, "gateway"], [ROLE.NOTIFICATION, "notification"], [ROLE.EVENT, "event"]].forEach(([role, key]) => {
        if (!isObject(next[key])) return;
        const fixed = normalizeService(next[key], role);
        if (fixed) { next[key] = fixed; changed = true; }
    });

    /* 2) 서비스 중 하나라도 Embedding 을 켰으면 루트 embedder 블록을 만든다 */
    const services = [
        ...(Array.isArray(next.projects) ? next.projects : []),
        next.gateway,
        next.notification,
        next.event,
    ].filter(isObject);

    if (services.some((s) => s?.enabled?.embedding === true) && !isObject(next.embedder)) {
        next.embedder = createEmbedder();
        changed = true;
    }

    /* 3) ai.type 이전 이름(LOCAL) → OLLAMA */
    if (isObject(next.ai) && AI_TYPE_ALIASES[next.ai.type]) {
        next.ai = { ...next.ai, type: AI_TYPE_ALIASES[next.ai.type] };
        changed = true;
    }

    /* 4) embedder 를 선택 가능한 값으로 맞춘다 (수동 입력이 없으므로 목록 밖 값은 기본값으로)
          - type  : LOCAL/VOYAGE → OLLAMA, 그 밖의 모르는 값 → OPENAI
          - model : 해당 type 목록에 없으면 type 의 기본 모델
          - dims  : 해당 model 이 지원하지 않으면 model 의 기본 차원 */
    if (isObject(next.embedder)) {
        const e = { ...next.embedder };
        let type = EMBEDDER_TYPE_ALIASES[e.type] || e.type;
        if (!EMBEDDER_TYPES.includes(type)) type = "OPENAI";
        const modelName = EMBEDDING_MODEL_ALIASES[type]?.[e.model] || e.model;
        let model = findEmbeddingModel(type, modelName);
        if (!model) model = defaultEmbeddingModel(type);
        const dims = model.dims.includes(Number(e.dimensions)) ? Number(e.dimensions) : model.def;

        /* urlPrefix 가 있는 타입은 URL 이 항상 그 접두어로 시작한다 */
        const prefix = EMBEDDER_META[type]?.urlPrefix;
        const url = prefix && embedderUsesUrl({ type, model: model.id }) && e.url
            ? withUrlPrefix(prefix, e.url)
            : e.url;

        if (e.type !== type || e.model !== model.id || e.dimensions !== dims || e.url !== url) {
            e.type = type; e.model = model.id; e.dimensions = dims; e.url = url;
            next.embedder = e;
            changed = true;
        }
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
    if (isObject(next.event)) next.event = orderServiceKeys(next.event);
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
        profile.event,
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
