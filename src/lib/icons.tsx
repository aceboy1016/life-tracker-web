import type { SVGProps } from 'react';
import type { EventCategory } from '@/types';

/**
 * Hand-drawn line icons on a 24px grid. Stroke-only so they read as one quiet family
 * next to the pale tint tiles.
 */
type IconDef = { label: string; tint: Tint; paths: React.ReactNode };
export type Tint = 'sand' | 'sage' | 'mist' | 'blush' | 'lilac' | 'stone';

export const ICONS: Record<string, IconDef> = {
    ring: {
        label: '指輪',
        tint: 'blush',
        paths: (
            <>
                <circle cx="12" cy="15" r="5.5" />
                <path d="M9.5 4.5h5l1.8 2.2L12 10.2 7.7 6.7 9.5 4.5Z" />
                <path d="M7.7 6.7h8.6" />
            </>
        ),
    },
    heart: {
        label: 'ハート',
        tint: 'blush',
        paths: <path d="M12 19.5s-7-4.3-7-9.4A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.1c0 5.1-7 9.4-7 9.4Z" />,
    },
    cake: {
        label: 'ケーキ',
        tint: 'sand',
        paths: (
            <>
                <path d="M4.5 20h15v-6.5a2 2 0 0 0-2-2h-11a2 2 0 0 0-2 2V20Z" />
                <path d="M4.5 15.5c1.3 1 2.5 1 3.75 0s2.5-1 3.75 0 2.5 1 3.75 0 2.5-1 3.75 0" />
                <path d="M12 11.5V8" />
                <path d="M12 5.8c.8-.7.8-1.6 0-2.3-.8.7-.8 1.6 0 2.3Z" />
            </>
        ),
    },
    scissors: {
        label: '散髪',
        tint: 'stone',
        paths: (
            <>
                <circle cx="6.5" cy="17" r="2.5" />
                <circle cx="17.5" cy="17" r="2.5" />
                <path d="M8.3 15.3 17 4.5" />
                <path d="M15.7 15.3 7 4.5" />
            </>
        ),
    },
    home: {
        label: '家',
        tint: 'sand',
        paths: (
            <>
                <path d="M4 10.5 12 4l8 6.5" />
                <path d="M6 9v10.5h12V9" />
                <path d="M10 19.5v-5h4v5" />
            </>
        ),
    },
    briefcase: {
        label: '仕事',
        tint: 'mist',
        paths: (
            <>
                <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
                <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5" />
                <path d="M3.5 12.5h17" />
            </>
        ),
    },
    dumbbell: {
        label: '運動',
        tint: 'sage',
        paths: (
            <>
                <path d="M7 8v8M17 8v8M4.5 10v4M19.5 10v4" />
                <path d="M7 12h10" />
            </>
        ),
    },
    tooth: {
        label: '歯',
        tint: 'mist',
        paths: (
            <path d="M8 4.5c-2.2 0-3.5 1.7-3.5 4 0 2 .9 3.3 1.4 5 .6 2 .8 6 2.4 6 1.4 0 1.3-4.5 3.7-4.5s2.3 4.5 3.7 4.5c1.6 0 1.8-4 2.4-6 .5-1.7 1.4-3 1.4-5 0-2.3-1.3-4-3.5-4-1.7 0-2.4 1-4 1s-2.3-1-4-1Z" />
        ),
    },
    phone: {
        label: '電話',
        tint: 'sage',
        paths: (
            <path d="M6.5 4h3l1.5 4-2 1.3a9 9 0 0 0 5.7 5.7L16 13l4 1.5v3a2 2 0 0 1-2.2 2C10.5 18.8 5.2 13.5 4.5 6.2A2 2 0 0 1 6.5 4Z" />
        ),
    },
    car: {
        label: '車',
        tint: 'stone',
        paths: (
            <>
                <path d="M4 16.5V13l1.8-4.6A2 2 0 0 1 7.7 7h8.6a2 2 0 0 1 1.9 1.4L20 13v3.5" />
                <path d="M3.5 13h17v3.5h-17z" />
                <path d="M6 16.5V18.5M18 16.5V18.5" />
                <circle cx="7.5" cy="14.8" r=".4" />
                <circle cx="16.5" cy="14.8" r=".4" />
            </>
        ),
    },
    plane: {
        label: '旅行',
        tint: 'mist',
        paths: <path d="M10.5 13.5 4 11l1.2-1.2 7.3.7 4.3-4.3a1.8 1.8 0 0 1 2.5 2.5l-4.3 4.3.7 7.3-1.2 1.2-2.5-6.5L9 18v2l-1 1-1.2-2.8L4 17l1-1h2Z" />,
    },
    gift: {
        label: 'ギフト',
        tint: 'blush',
        paths: (
            <>
                <rect x="4" y="9" width="16" height="4" rx="1" />
                <path d="M5.5 13v7h13v-7" />
                <path d="M12 9v11" />
                <path d="M12 9c-1-2.8-4.5-4-5-2-.4 1.6 2 2 5 2Zm0 0c1-2.8 4.5-4 5-2 .4 1.6-2 2-5 2Z" />
            </>
        ),
    },
    book: {
        label: '本',
        tint: 'sand',
        paths: (
            <>
                <path d="M12 6.5c-2-1.5-5-2-7.5-1.5v13c2.5-.5 5.5 0 7.5 1.5 2-1.5 5-2 7.5-1.5V5c-2.5-.5-5.5 0-7.5 1.5Z" />
                <path d="M12 6.5v13" />
            </>
        ),
    },
    leaf: {
        label: '植物',
        tint: 'sage',
        paths: (
            <>
                <path d="M5 19c0-8 5-13.5 14-14 .5 9-5 14-12 14H5Z" />
                <path d="M5 19c3-4.5 6-7 9.5-9" />
            </>
        ),
    },
    baby: {
        label: '子ども',
        tint: 'lilac',
        paths: (
            <>
                <circle cx="12" cy="12" r="7.5" />
                <path d="M9.5 11.2h.01M14.5 11.2h.01" />
                <path d="M9.8 14.8c1.3 1 3.1 1 4.4 0" />
                <path d="M12 4.5c1 .6 1.4 1.6 1 2.6" />
            </>
        ),
    },
    paw: {
        label: 'ペット',
        tint: 'stone',
        paths: (
            <>
                <path d="M8 16.2c0-2.5 2-4.7 4-4.7s4 2.2 4 4.7c0 1.8-1.4 2.8-4 2.8s-4-1-4-2.8Z" />
                <circle cx="6.3" cy="10.5" r="1.5" />
                <circle cx="9.7" cy="6.8" r="1.5" />
                <circle cx="14.3" cy="6.8" r="1.5" />
                <circle cx="17.7" cy="10.5" r="1.5" />
            </>
        ),
    },
    smartphone: {
        label: 'スマホ',
        tint: 'mist',
        paths: (
            <>
                <rect x="7" y="3.5" width="10" height="17" rx="2.5" />
                <path d="M11 17.5h2" />
            </>
        ),
    },
    watch: {
        label: '時計',
        tint: 'stone',
        paths: (
            <>
                <rect x="7" y="7" width="10" height="10" rx="2.5" />
                <path d="M9 7l.6-3.5h4.8L15 7M9 17l.6 3.5h4.8L15 17" />
                <path d="M12 10v2.2l1.3 1" />
            </>
        ),
    },
    bike: {
        label: '自転車',
        tint: 'sage',
        paths: (
            <>
                <circle cx="6" cy="15.5" r="3.5" />
                <circle cx="18" cy="15.5" r="3.5" />
                <path d="M6 15.5 9.5 9h5l3.5 6.5M9.5 9 12 15.5h-6M14.5 9 13.5 6.5H16" />
            </>
        ),
    },
    wifi: {
        label: '回線',
        tint: 'mist',
        paths: (
            <>
                <path d="M3.5 9.5a12 12 0 0 1 17 0" />
                <path d="M6.5 12.8a7.7 7.7 0 0 1 11 0" />
                <path d="M9.5 16a3.4 3.4 0 0 1 5 0" />
                <path d="M12 19.3h.01" />
            </>
        ),
    },
    laptop: {
        label: 'デバイス',
        tint: 'mist',
        paths: (
            <>
                <rect x="5" y="5.5" width="14" height="10" rx="1.5" />
                <path d="M3 18.5h18" />
            </>
        ),
    },
    music: {
        label: '音楽',
        tint: 'lilac',
        paths: (
            <>
                <path d="M9 17.5V6l10-2v11.5" />
                <circle cx="7" cy="17.5" r="2" />
                <circle cx="17" cy="15.5" r="2" />
            </>
        ),
    },
    broom: {
        label: '家事',
        tint: 'sage',
        paths: (
            <>
                <path d="M15 4 11.5 11" />
                <path d="M8.5 10.5 14 13l-1.5 7c-2.8-.5-6.3-2.2-8-5l4-4.5Z" />
                <path d="M8.5 16.5 10 14" />
            </>
        ),
    },
    calendar: {
        label: 'カレンダー',
        tint: 'mist',
        paths: (
            <>
                <rect x="4" y="5.5" width="16" height="14" rx="2.5" />
                <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
                <path d="M8 13.5h.01M12 13.5h.01M16 13.5h.01M8 16.5h.01M12 16.5h.01" />
            </>
        ),
    },
    star: {
        label: 'その他',
        tint: 'stone',
        paths: <path d="m12 4.5 2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L12 4.5Z" />,
    },
};

export const ICON_KEYS = Object.keys(ICONS);

const CATEGORY_ICON: Record<EventCategory, string> = {
    general: 'star',
    health: 'dumbbell',
    work: 'briefcase',
    hobby: 'music',
    social: 'phone',
    household: 'broom',
    electronics: 'laptop',
};

export const OCCASION_ICON: Record<string, string> = {
    結婚: 'ring',
    出産: 'baby',
    誕生日: 'cake',
    '引越し・新築': 'home',
    '就職・昇進': 'briefcase',
    お見舞い: 'leaf',
    'お中元・お歳暮': 'gift',
};

export function iconForCategory(category: EventCategory): string {
    return CATEGORY_ICON[category] ?? 'star';
}

const TINT_CLASS: Record<Tint, string> = {
    sand: 'bg-tint-sand text-tint-sand-ink',
    sage: 'bg-tint-sage text-tint-sage-ink',
    mist: 'bg-tint-mist text-tint-mist-ink',
    blush: 'bg-tint-blush text-tint-blush-ink',
    lilac: 'bg-tint-lilac text-tint-lilac-ink',
    stone: 'bg-tint-stone text-tint-stone-ink',
};

export function Glyph({ name, size = 20, ...props }: { name: string; size?: number } & SVGProps<SVGSVGElement>) {
    const def = ICONS[name] ?? ICONS.star;
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            {def.paths}
        </svg>
    );
}

/** Icon on a pale tinted rounded tile. */
export function IconTile({ name, size = 44 }: { name: string; size?: number }) {
    const def = ICONS[name] ?? ICONS.star;
    return (
        <span
            className={`inline-flex shrink-0 items-center justify-center rounded-[14px] ${TINT_CLASS[def.tint]}`}
            style={{ width: size, height: size }}
        >
            <Glyph name={name} size={Math.round(size * 0.5)} />
        </span>
    );
}

const AVATAR_TINTS: Tint[] = ['sand', 'sage', 'mist', 'blush', 'lilac', 'stone'];

/** First character of a name on a pale tile; the tint is stable per name. */
export function Avatar({ name, size = 42 }: { name: string; size?: number }) {
    let hash = 0;
    for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
    const tint = AVATAR_TINTS[hash % AVATAR_TINTS.length];
    return (
        <span
            className={`inline-flex shrink-0 items-center justify-center rounded-full font-medium ${TINT_CLASS[tint]}`}
            style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
            aria-hidden="true"
        >
            {[...name.trim()][0] ?? '?'}
        </span>
    );
}
