import React, { useRef } from 'react';

const STYLE_ID = 'skeleton-shimmer-keyframes';

const shimmerKeyframes = `@keyframes skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}`;

function ensureShimmerStyle() {
    if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = shimmerKeyframes;
        document.head.appendChild(style);
    }
}

const skeletonStyle = (width?: string | number, height?: string | number, borderRadius?: string): React.CSSProperties => ({
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: borderRadius || '8px',
    background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
});

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string;
    className?: string;
    style?: React.CSSProperties;
}

export const Skeleton = React.memo<SkeletonProps>(({ width = '100%', height = 20, borderRadius, className, style }) => {
    const mounted = useRef(false);
    if (!mounted.current) {
        ensureShimmerStyle();
        mounted.current = true;
    }

    return (
        <div className={className} style={{ ...skeletonStyle(width, height, borderRadius), ...style }} />
    );
});

interface SkeletonTextProps {
    lines?: number;
    gap?: number;
}

export const SkeletonText = React.memo<SkeletonTextProps>(({ lines = 3, gap = 8 }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    height={14}
                    width={i === lines - 1 ? '60%' : '100%'}
                    borderRadius="4px"
                />
            ))}
        </div>
    );
});

interface SkeletonCardProps {
    hasAvatar?: boolean;
    lines?: number;
}

export const SkeletonCard = React.memo<SkeletonCardProps>(({ hasAvatar = false, lines = 3 }) => {
    return (
        <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'var(--color-surface, #fff)',
            border: '1px solid var(--color-border, #e5e7eb)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {hasAvatar && <Skeleton width={40} height={40} borderRadius="50%" />}
                <div style={{ flex: 1 }}>
                    <Skeleton height={16} width="50%" borderRadius="4px" />
                    <div style={{ marginTop: '8px' }}>
                        <Skeleton height={12} width="30%" borderRadius="4px" />
                    </div>
                </div>
            </div>
            <SkeletonText lines={lines} />
        </div>
    );
});

export const SkeletonStat = React.memo(() => {
    return (
        <div style={{
            padding: '20px',
            borderRadius: '12px',
            background: 'var(--color-surface, #fff)',
            border: '1px solid var(--color-border, #e5e7eb)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Skeleton width={48} height={48} borderRadius="12px" />
                <div style={{ flex: 1 }}>
                    <Skeleton height={12} width="60%" borderRadius="4px" />
                    <div style={{ marginTop: '8px' }}>
                        <Skeleton height={20} width="40%" borderRadius="4px" />
                    </div>
                </div>
            </div>
        </div>
    );
});
