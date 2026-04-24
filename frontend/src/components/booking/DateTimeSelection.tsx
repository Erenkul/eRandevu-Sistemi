import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './DateTimeSelection.css';

export interface DateTimeSelectionProps {
    selectedDate: Date | null;
    selectedTime: string | null;
    availableSlots?: string[]; // ISO Strings
    loading?: boolean;
    onDateSelect: (date: Date) => void;
    onTimeSelect: (time: string, isoDate: string) => void;
}

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
    selectedDate,
    selectedTime,
    availableSlots = [],
    loading = false,
    onDateSelect,
    onTimeSelect,
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const today = useMemo(() => {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        return t;
    }, []);

    const days = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysArray: (Date | null)[] = [];

        // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
        let startDay = firstDay.getDay();
        // Convert to Monday = 0
        startDay = startDay === 0 ? 6 : startDay - 1;

        // Add empty days for previous month
        for (let i = 0; i < startDay; i++) {
            daysArray.push(null);
        }

        // Add days of current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            daysArray.push(new Date(year, month, i));
        }

        return daysArray;
    }, [currentMonth]);

    const isSameDay = useCallback((d1: Date | null, d2: Date | null) => {
        if (!d1 || !d2) return false;
        return d1.toDateString() === d2.toDateString();
    }, []);

    const isDisabled = useCallback((date: Date | null) => {
        if (!date) return true;
        // Basic check: in the past
        return date < today;
    }, [today]);

    const isCurrentMonth = useMemo(() => {
        return currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
    }, [currentMonth, today]);

    const prevMonth = useCallback(() => {
        if (!isCurrentMonth) {
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
        }
    }, [currentMonth, isCurrentMonth]);

    const nextMonth = useCallback(() => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    }, [currentMonth]);

    // Group slots by period (Memoized to prevent unnecessary recalculations on hover/selection)
    const { morning, afternoon, evening } = useMemo(() => {
        const m: { display: string, iso: string }[] = [];
        const a: { display: string, iso: string }[] = [];
        const e: { display: string, iso: string }[] = [];

        availableSlots.forEach(iso => {
            const date = new Date(iso);
            
            // Sabit Timezone ile saat hesaplama - Cihazın saati ne olursa olsun Türkiye/İstanbul baz alınır
            const hourFormatter = new Intl.DateTimeFormat('tr-TR', {
                hour: 'numeric',
                hour12: false,
                timeZone: 'Europe/Istanbul'
            });
            // HATA AVI (BUG HUNT): Farklı tarayıcılar "09", "9 AM" veya "ö.ö. 9" formatında dönebilir!
            // NaN hatasını engellemek için sadece rakamları süzen Regex ekledik.
            const formattedStr = hourFormatter.format(date);
            const numMatch = formattedStr.match(/\d+/);
            const hour = numMatch ? parseInt(numMatch[0], 10) : date.getHours();
            
            const timeStr = date.toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'Europe/Istanbul' 
            });

            const slot = { display: timeStr, iso };

            if (hour < 12) {
                m.push(slot);
            } else if (hour < 17) {
                a.push(slot);
            } else {
                e.push(slot);
            }
        });

        return { morning: m, afternoon: a, evening: e };
    }, [availableSlots]);
    const hasSlots = morning.length > 0 || afternoon.length > 0 || evening.length > 0;

    return (
        <div className="datetime-selection">
            <h1 className="datetime-selection-title">Tarih & Saat Seçin</h1>
            <p className="datetime-selection-subtitle">
                Randevunuz için uygun tarih ve saati seçin.
            </p>

            <div className="datetime-content">
                {/* Calendar */}
                <div className="calendar-section">
                    <div className="calendar-header">
                        <h3 className="calendar-title">
                            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <div className="calendar-nav">
                            <button 
                                onClick={prevMonth} 
                                disabled={isCurrentMonth}
                                style={{ opacity: isCurrentMonth ? 0.3 : 1, cursor: isCurrentMonth ? 'not-allowed' : 'pointer' }}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button onClick={nextMonth}>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="calendar-weekdays">
                        {WEEKDAYS.map((day) => (
                            <div key={day} className="calendar-weekday">{day}</div>
                        ))}
                    </div>

                    <div className="calendar-days">
                        {days.map((date, index) => (
                            <button
                                key={index}
                                className={`calendar-day ${!date ? 'other-month' : ''
                                    } ${isSameDay(date, today) ? 'today' : ''} ${isSameDay(date, selectedDate) ? 'selected' : ''
                                    } ${isDisabled(date) ? 'disabled' : ''}`}
                                onClick={() => date && !isDisabled(date) && onDateSelect(date)}
                                disabled={isDisabled(date)}
                            >
                                {date?.getDate() || ''}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Slots */}
                <div className="time-section">
                    <div className="time-header">
                        <h3 className="time-title">Saat Seçin</h3>
                        <p className="time-subtitle">
                            {selectedDate
                                ? `${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
                                : 'Önce bir tarih seçin'}
                        </p>
                    </div>

                    {selectedDate && (
                        loading ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Saatler yükleniyor...</div>
                        ) : !hasSlots ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Bu tarihte uygun saat bulunamadı.</div>
                        ) : (
                            <>
                                {morning.length > 0 && (
                                    <div className="time-period">
                                        <div className="time-period-label">Sabah</div>
                                        <div className="time-slots">
                                            {morning.map((slot) => (
                                                <button
                                                    key={slot.iso}
                                                    className={`time-slot ${selectedTime === slot.display ? 'selected' : ''}`}
                                                    onClick={() => onTimeSelect(slot.display, slot.iso)}
                                                >
                                                    {slot.display}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {afternoon.length > 0 && (
                                    <div className="time-period">
                                        <div className="time-period-label">Öğleden Sonra</div>
                                        <div className="time-slots">
                                            {afternoon.map((slot) => (
                                                <button
                                                    key={slot.iso}
                                                    className={`time-slot ${selectedTime === slot.display ? 'selected' : ''}`}
                                                    onClick={() => onTimeSelect(slot.display, slot.iso)}
                                                >
                                                    {slot.display}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {evening.length > 0 && (
                                    <div className="time-period">
                                        <div className="time-period-label">Akşam</div>
                                        <div className="time-slots">
                                            {evening.map((slot) => (
                                                <button
                                                    key={slot.iso}
                                                    className={`time-slot ${selectedTime === slot.display ? 'selected' : ''}`}
                                                    onClick={() => onTimeSelect(slot.display, slot.iso)}
                                                >
                                                    {slot.display}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
