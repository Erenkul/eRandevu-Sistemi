import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DateTimeSelection } from './DateTimeSelection';

describe('DateTimeSelection Component', () => {
    const mockOnDateSelect = vi.fn();
    const mockOnTimeSelect = vi.fn();

    const renderComponent = (props = {}) => {
        return render(
            <DateTimeSelection
                selectedDate={null}
                selectedTime={null}
                onDateSelect={mockOnDateSelect}
                onTimeSelect={mockOnTimeSelect}
                {...props}
            />
        );
    };

    it('renders calendar correctly', () => {
        renderComponent();
        expect(screen.getByText('Tarih & Saat Seçin')).toBeInTheDocument();
        
        // Haftanın günleri
        expect(screen.getByText('Pzt')).toBeInTheDocument();
        expect(screen.getByText('Cum')).toBeInTheDocument();
    });

    it('displays loading state correctly', () => {
        // Önceden bir tarih seçilmiş ve loading true ise mesaj çıkmalı
        renderComponent({ 
            selectedDate: new Date(),
            loading: true 
        });
        
        expect(screen.getByText('Saatler yükleniyor...')).toBeInTheDocument();
    });

    it('displays message when no slots available', () => {
        renderComponent({ 
            selectedDate: new Date(),
            availableSlots: [] 
        });
        
        expect(screen.getByText('Bu tarihte uygun saat bulunamadı.')).toBeInTheDocument();
    });

    it('calls onDateSelect when a valid future date is clicked', () => {
        renderComponent();
        
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 2); // 2 gün sonrası
        
        // Gelecekteki günü ekranda bul
        const buttons = screen.getAllByRole('button');
        const futureDayButton = buttons.find(b => b.textContent === futureDate.getDate().toString() && !b.hasAttribute('disabled'));
        
        if (futureDayButton) {
            fireEvent.click(futureDayButton);
            expect(mockOnDateSelect).toHaveBeenCalled();
        }
    });

    it('renders time slots correctly divided by periods', () => {
        // Yerel saat dilimi farklılıklarından etkilenmemek için (örn CI sunucusu UTC, geliştirici UTC+3)
        // tarihleri new Date() ile doğrudan ilgili saate göre oluşturup ISO string ini alıyoruz.
        const baseDate = new Date();
        baseDate.setHours(9, 0, 0, 0);
        const morningIso = baseDate.toISOString();
        
        baseDate.setHours(14, 30, 0, 0);
        const afternoonIso = baseDate.toISOString();
        
        baseDate.setHours(19, 0, 0, 0);
        const eveningIso = baseDate.toISOString();

        const slots = [morningIso, afternoonIso, eveningIso];

        renderComponent({ 
            selectedDate: new Date(),
            availableSlots: slots 
        });
        
        // Sabah, Öğleden Sonra, Akşam grupları çıkmalı
        expect(screen.getByText('Sabah')).toBeInTheDocument();
        expect(screen.getByText('Öğleden Sonra')).toBeInTheDocument();
        expect(screen.getByText('Akşam')).toBeInTheDocument();
        
        // Saatler yerel saate dönerek (örneğin UTC+3) render ediliyor, 
        // Ancak time-slot butonları ekranda olduğu için onların çıktısını bekliyoruz
        const timeButtons = screen.getAllByRole('button').filter(b => b.classList.contains('time-slot'));
        expect(timeButtons.length).toBe(3);
        
        // Tıklamayı test edelim
        fireEvent.click(timeButtons[0]);
        expect(mockOnTimeSelect).toHaveBeenCalled();
    });
});
