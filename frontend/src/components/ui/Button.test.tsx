import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button, PrimaryButton, SecondaryButton, IconButton } from './Button';
import { Search } from 'lucide-react';

describe('Button Components', () => {
    it('renders the base Button with default props', () => {
        render(<Button>Click Me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        
        expect(button).toBeInTheDocument();
        // Varsayılan olarak primary ve medium classlarına sahip olmasını bekliyoruz
        expect(button).toHaveClass('button', 'button-primary');
    });

    it('renders different variants correctly', () => {
        const { rerender } = render(<PrimaryButton>Primary</PrimaryButton>);
        expect(screen.getByRole('button', { name: /primary/i })).toHaveClass('button-primary');

        rerender(<SecondaryButton>Secondary</SecondaryButton>);
        expect(screen.getByRole('button', { name: /secondary/i })).toHaveClass('button-secondary');
    });

    it('handles click events properly', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Clickable</Button>);
        
        const button = screen.getByRole('button', { name: /clickable/i });
        fireEvent.click(button);
        
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders icons when provided', () => {
        // İkonlu (LucideIcon) bir buton test ediliyor
        const { container } = render(<Button icon={Search}>Search</Button>);
        
        const button = screen.getByRole('button', { name: /search/i });
        expect(button).toBeInTheDocument();
        
        // LucideReact genelde svg elementi basar
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('can be disabled', () => {
        const handleClick = vi.fn();
        render(<Button disabled onClick={handleClick}>Disabled</Button>);
        
        const button = screen.getByRole('button', { name: /disabled/i });
        expect(button).toBeDisabled();
        
        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders IconButton with tooltip', () => {
        render(<IconButton icon={Search} tooltip="Ara" />);
        
        // IconButton içeriğinde string (metin) çocuk olmadığı için getByRole ile değil getByTitle ile bulabiliriz
        const button = screen.getByTitle('Ara');
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('button-icon');
    });
});
