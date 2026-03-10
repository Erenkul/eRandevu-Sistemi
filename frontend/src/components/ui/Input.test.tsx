import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Input, Textarea, SearchInput } from './Input';
import { Mail } from 'lucide-react';

describe('Input Components', () => {
    describe('Input', () => {
        it('renders correctly with label and placeholder', () => {
            render(<Input label="E-posta" placeholder="ornek@mail.com" />);
            
            // Label'ın rendered olduğunu kontrol et
            expect(screen.getByText('E-posta')).toBeInTheDocument();
            
            // Placeholder'a sahip bir textbox bekliyoruz
            const input = screen.getByPlaceholderText('ornek@mail.com');
            expect(input).toBeInTheDocument();
        });

        it('shows error messages and applies error styles', () => {
            render(<Input placeholder="İsim" error="Bu alan zorunludur" />);
            
            // Hata mesajını görmeyi bekliyoruz
            expect(screen.getByText('Bu alan zorunludur')).toBeInTheDocument();
            
            // Input elemntinin içerisine 'input-error' classının eklendiğini kontrol et
            const input = screen.getByPlaceholderText('İsim');
            expect(input).toHaveClass('input-error');
        });

        it('handles user typing (onChange event)', () => {
            render(<Input placeholder="Arama yapınız" />);
            
            const input = screen.getByPlaceholderText('Arama yapınız') as HTMLInputElement;
            
            // Ekrana 'Kuaför' yazdığımızı simüle edelim
            fireEvent.change(input, { target: { value: 'Kuaför' } });
            
            // Değerin Input alanına aktarıldığını doğrula
            expect(input.value).toBe('Kuaför');
        });

        it('renders icon when provided', () => {
            const { container } = render(<Input placeholder="Mail" icon={Mail} />);
            
            // Render edilen HTML içinde svg'yi aramayı deneyelim (Lucide ikonları için)
            const wrapperDiv = container.querySelector('.input-with-icon');
            expect(wrapperDiv).toBeInTheDocument();
            
            const svg = container.querySelector('svg');
            expect(svg).toBeInTheDocument();
        });
    });

    describe('Textarea', () => {
        it('renders textarea with label', () => {
            render(<Textarea label="Mesajınız" placeholder="Not ekleyin..." />);
            
            expect(screen.getByText('Mesajınız')).toBeInTheDocument();
            
            const textarea = screen.getByPlaceholderText('Not ekleyin...') as HTMLTextAreaElement;
            expect(textarea).toBeInTheDocument();
            // Bu elemanın gerçekten bir textarea elementi olduğunu kontrol edelim
            expect(textarea.tagName).toBe('TEXTAREA');
        });
    });

    describe('SearchInput', () => {
        it('renders search specific input correctly', () => {
            render(<SearchInput placeholder="Hizmet ara..." />);
            
            const input = screen.getByPlaceholderText('Hizmet ara...');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('type', 'search');
            
            // Arama inputu daima wrapper içinde özel arama ikonuyla gelir
            expect(input.parentElement).toHaveClass('search-input-wrapper');
        });
    });
});
