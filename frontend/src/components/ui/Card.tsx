import React from 'react';
import type { LucideIcon } from 'lucide-react';
import './Card.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
    elevated?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hoverable = false,
    elevated = false,
    onClick,
}) => {
    const classes = [
        'card',
        hoverable && 'card-hoverable',
        elevated && 'card-elevated',
        onClick && 'cursor-pointer',
        className,
    ].filter(Boolean).join(' ').trim();

    return (
        <div className={classes} onClick={onClick}>
            {children}
        </div>
    );
};

interface CardHeaderProps {
    title: string;
    icon?: LucideIcon;
    iconColor?: string;
    iconBgColor?: string;
    action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
    title,
    icon: Icon,
    iconColor = 'var(--color-primary)',
    iconBgColor = 'var(--color-primary-container)',
    action,
}) => {
    return (
        <div className="card-header">
            <div className="card-title">
                {Icon && (
                    <div className="card-icon" style={{ backgroundColor: iconBgColor }}>
                        <Icon size={18} style={{ color: iconColor }} />
                    </div>
                )}
                {title}
            </div>
            {action}
        </div>
    );
};

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => {
    return <div className={`card-body ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => {
    return <div className={`card-footer ${className}`}>{children}</div>;
};
