/**
 * 로컬 아이콘 세트.
 *
 * lucide-react 대신 직접 둔 이유:
 *  - 기존 코드가 쓰던 LayersPlus / LayersMinus 는 설치된 lucide-react 버전에
 *    존재하는지 확인되지 않았고, 없는 이름을 import 하면 런타임에 깨진다.
 *  - 여기서 쓰는 아이콘은 20여 개뿐이라 직접 두는 편이 안전하고 가볍다.
 *
 * 모든 아이콘은 size prop(기본 16)을 받는다. 기본값을 두는 게 핵심 —
 * 예전 코드는 size 를 주지 않아 24px 아이콘이 작은 버튼에 그대로 들어갔다.
 */
import React from "react";

function Svg({size = 16, children, strokeWidth = 2, ...rest}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            {...rest}
        >
            {children}
        </svg>
    );
}

export const IconLeaf = (p) => (
    <Svg {...p}>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </Svg>
);
export const IconTrash = (p) => (
    <Svg {...p}>
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
    </Svg>
);
export const IconCommit = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="3.5"/>
        <path d="M1.5 12h7M15.5 12h7"/>
    </Svg>
);
export const IconUpload = (p) => (
    <Svg {...p}>
        <path d="M12 13v8M8 17l4-4 4 4"/>
        <path d="M20.9 18.4A5 5 0 0 0 18 9h-1.3A8 8 0 1 0 3 16.3"/>
    </Svg>
);
export const IconCode = (p) => (
    <Svg {...p}>
        <path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16"/>
    </Svg>
);
export const IconSparkles = (p) => (
    <Svg {...p}>
        <path d="m12 3-1.9 5.8L4 10.7l5.8 1.9L11.7 19l1.9-5.8 5.8-1.9-5.8-1.9Z"/>
        <path d="M19 3v4M21 5h-4"/>
    </Svg>
);
export const IconMoon = (p) => (
    <Svg {...p}>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </Svg>
);
export const IconSun = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
    </Svg>
);
export const IconSearch = (p) => (
    <Svg {...p}>
        <circle cx="11" cy="11" r="7"/>
        <path d="m21 21-4.3-4.3"/>
    </Svg>
);
export const IconLock = (p) => (
    <Svg {...p}>
        <rect x="4" y="11" width="16" height="10" rx="2"/>
        <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
    </Svg>
);
export const IconPlus = (p) => (
    <Svg {...p}>
        <path d="M12 5v14M5 12h14"/>
    </Svg>
);
export const IconX = (p) => (
    <Svg {...p}>
        <path d="M18 6 6 18M6 6l12 12"/>
    </Svg>
);
export const IconChevronDown = (p) => (
    <Svg {...p}>
        <path d="m6 9 6 6 6-6"/>
    </Svg>
);
export const IconGrip = (p) => (
    <Svg {...p} strokeWidth={2.4}>
        <circle cx="9" cy="6" r=".6"/>
        <circle cx="9" cy="12" r=".6"/>
        <circle cx="9" cy="18" r=".6"/>
        <circle cx="15" cy="6" r=".6"/>
        <circle cx="15" cy="12" r=".6"/>
        <circle cx="15" cy="18" r=".6"/>
    </Svg>
);
export const IconEye = (p) => (
    <Svg {...p}>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
    </Svg>
);
export const IconEyeOff = (p) => (
    <Svg {...p}>
        <path
            d="M10.7 6.2A9.9 9.9 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3 3.6M6.2 6.2A17 17 0 0 0 2 12s3.6 6 10 6a9.9 9.9 0 0 0 4-.8"/>
        <path d="m2 2 20 20"/>
    </Svg>
);
export const IconBox = (p) => (
    <Svg {...p}>
        <path
            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    </Svg>
);
export const IconGateway = (p) => (
    <Svg {...p}>
        <path d="M12 2 3 7v10l9 5 9-5V7Z"/>
        <path d="M12 22V12M3 7l9 5 9-5"/>
    </Svg>
);
export const IconBell = (p) => (
    <Svg {...p}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
    </Svg>
);
export const IconEvent = (p) => (
    <Svg {...p}>
        <path d="M12 16v1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v1"/>
        <path d="M12 6a2 2 0 0 1 2 2"/>
        <path d="M18 8c0 4-3.5 8-6 8s-6-4-6-8a6 6 0 0 1 12 0"/>
    </Svg>
);
export const IconDatabase = (p) => (
    <Svg {...p}>
        <ellipse cx="12" cy="5.5" rx="8" ry="3"/>
        <path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>
    </Svg>
);
export const IconServers = (p) => (
    <Svg {...p}>
        <rect x="2" y="3" width="20" height="8" rx="2"/>
        <rect x="2" y="13" width="20" height="8" rx="2"/>
        <path d="M6 7h.01M6 17h.01"/>
    </Svg>
);
export const IconPlug = (p) => (
    <Svg {...p}>
        <path d="M9 7V3M15 7V3M6 11h12v4a6 6 0 0 1-12 0Z"/>
        <path d="M12 21v-2"/>
    </Svg>
);
export const IconGrid = (p) => (
    <Svg {...p}>
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </Svg>
);
export const IconPulse = (p) => (
    <Svg {...p}>
        <path d="M3 12h4l3 8 4-16 3 8h4"/>
    </Svg>
);
export const IconFile = (p) => (
    <Svg {...p}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
        <path d="M14 2v6h6"/>
    </Svg>
);
export const IconFilter = (p) => (
    <Svg {...p}>
        <path d="M3 5h18l-7 8v6l-4 2v-8Z"/>
    </Svg>
);
export const IconLayers = (p) => (
    <Svg {...p}>
        <rect x="2" y="4" width="20" height="6" rx="2"/>
        <rect x="2" y="14" width="20" height="6" rx="2"/>
    </Svg>
);
export const IconClock = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 2"/>
    </Svg>
);
export const IconInfo = (p) => (
    <Svg {...p}>
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 16v-5M12 8h.01"/>
    </Svg>
);
export const IconWarn = (p) => (
    <Svg {...p}>
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>
        <path d="M12 9v4M12 17h.01"/>
    </Svg>
);
export const IconCheck = (p) => (
    <Svg {...p} strokeWidth={3}>
        <path d="M20 6 9 17l-5-5"/>
    </Svg>
);
export const IconVector = (p) => (
    <Svg {...p}>
        <circle cx="5" cy="6" r="2"/>
        <circle cx="19" cy="6" r="2"/>
        <circle cx="12" cy="18" r="2"/>
        <circle cx="12" cy="11" r="2"/>
        <path d="M6.7 7.2 10.5 10M17.3 7.2 13.5 10M12 13v3"/>
    </Svg>
);
export const IconMonitor = (p) => (
    <Svg {...p}>
        <rect x="2" y="4" width="20" height="14" rx="2"/>
        <path d="M8 20h8"/>
    </Svg>
);
