import React from 'react';
import type { LucideIcon } from 'lucide-react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'text' | 'icon';
    size?: 'small' | 'medium' | 'large';
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    children?: React.ReactNode;
}

export const Button = React.memo<ButtonProps>(({
    variant = 'primary',
    size = 'medium',
    icon: Icon,
    iconPosition = 'left',
    children,
    className = '',
    ...props
}) => {
    const classes = [
        'button',
        `button-${variant}`,
        size !== 'medium' && `button-${size}`,
        className,
    ].filter(Boolean).join(' ');

    return (
        <button className={classes} {...props}>
            {Icon && iconPosition === 'left' && <Icon size={18} />}
            {children}
            {Icon && iconPosition === 'right' && <Icon size={18} />}
        </button>
    );
});

export const PrimaryButton = React.memo<Omit<ButtonProps, 'variant'>>((props) => (
    <Button variant="primary" {...props} />
));

export const SecondaryButton = React.memo<Omit<ButtonProps, 'variant'>>((props) => (
    <Button variant="secondary" {...props} />
));

export const TextButton = React.memo<Omit<ButtonProps, 'variant'>>((props) => (
    <Button variant="text" {...props} />
));

export const IconButton = React.memo<Omit<ButtonProps, 'variant' | 'children'> & { tooltip?: string }>(({
    tooltip,
    ...props
}) => (
    <Button variant="icon" title={tooltip} {...props} />
));
