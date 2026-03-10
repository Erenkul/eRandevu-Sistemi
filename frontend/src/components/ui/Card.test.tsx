import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Card, CardHeader, CardBody, CardFooter } from './Card';
import { User } from 'lucide-react';

describe('Card Components', () => {
    describe('Card', () => {
        it('renders with children correctly', () => {
            render(<Card><div data-testid="child">Card Content</div></Card>);
            
            const content = screen.getByTestId('child');
            expect(content).toBeInTheDocument();
            
            // Parent div holds the class 'card'
            expect(content.parentElement).toHaveClass('card');
        });

        it('handles hoverable and elevated props', () => {
            const { rerender } = render(<Card hoverable><span data-testid="hover-child">H</span></Card>);
            expect(screen.getByTestId('hover-child').parentElement).toHaveClass('card-hoverable');

            rerender(<Card elevated><span data-testid="elevated-child">E</span></Card>);
            expect(screen.getByTestId('elevated-child').parentElement).toHaveClass('card-elevated');
        });

        it('handles click events when onClick prop is provided', () => {
            const handleClick = vi.fn();
            render(<Card onClick={handleClick}><span data-testid="click-child">C</span></Card>);
            
            const card = screen.getByTestId('click-child').parentElement!;
            
            // onClick handler eklenirse cursor-pointer componenti gelmeli
            expect(card).toHaveClass('cursor-pointer');
            
            fireEvent.click(card);
            expect(handleClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('CardHeader', () => {
        it('renders title with icon', () => {
            const { container } = render(<CardHeader title="Profil" icon={User} />);
            
            expect(screen.getByText('Profil')).toBeInTheDocument();
            
            // Icon test
            const svg = container.querySelector('svg');
            expect(svg).toBeInTheDocument();
            
            const iconContainer = container.querySelector('.card-icon');
            expect(iconContainer).toBeInTheDocument();
        });

        it('renders custom actions', () => {
            render(
                <CardHeader 
                    title="Ayarlar" 
                    action={<button>Düzenle</button>} 
                />
            );
            
            expect(screen.getByRole('button', { name: 'Düzenle' })).toBeInTheDocument();
        });
    });

    describe('CardBody & CardFooter', () => {
        it('renders correctly with content', () => {
            render(
                <>
                    <CardBody>Gövde İçeriği</CardBody>
                    <CardFooter>Footer İçeriği</CardFooter>
                </>
            );
            
            expect(screen.getByText('Gövde İçeriği')).toHaveClass('card-body');
            expect(screen.getByText('Footer İçeriği')).toHaveClass('card-footer');
        });
    });
});
