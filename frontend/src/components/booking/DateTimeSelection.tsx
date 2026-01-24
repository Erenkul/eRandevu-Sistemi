import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './DateTimeSelection.css';

interface DateTimeSelectionProps {
    selectedDate: Date | null;
    selectedTime: string | null;
    onDateSelect: (date: Date) => void;
    onTimeSelect: (time: string) => void;
}

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const TIME_SLOTS = {
    morning: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
    afternoon: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'],
    evening: ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00'],
};

export const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
    selectedDate,
    selectedTime,
    onDateSelect,
    onTimeSelect,
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days: (Date | null)[] = [];

        // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
        let startDay = firstDay.getDay();
        // Convert to Monday = 0
        startDay = startDay === 0 ? 6 : startDay - 1;

        // Add empty days for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        // Add days of current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const days = getDaysInMonth(currentMonth);

    const isSameDay = (d1: Date | null, d2: Date | null) => {
        if (!d1 || !d2) return false;
        return d1.toDateString() === d2.toDateString();
    };

    const isDisabled = (date: Date | null) => {
        if (!date) return true;
        return date < today;
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    // Simulate some taken slots
    const takenSlots = ['10:00', '14:30', '18:00'];

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
                            <button onClick={prevMonth}>
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
                        <>
                            <div className="time-period">
                                <div className="time-period-label">Sabah</div>
                                <div className="time-slots">
                                    {TIME_SLOTS.morning.map((time) => (
                                        <button
                                            key={time}
                                            className={`time-slot ${selectedTime === time ? 'selected' : ''
                                                } ${takenSlots.includes(time) ? 'disabled' : ''}`}
                                            onClick={() => !takenSlots.includes(time) && onTimeSelect(time)}
                                            disabled={takenSlots.includes(time)}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="time-period">
                                <div className="time-period-label">Öğleden Sonra</div>
                                <div className="time-slots">
                                    {TIME_SLOTS.afternoon.map((time) => (
                                        <button
                                            key={time}
                                            className={`time-slot ${selectedTime === time ? 'selected' : ''
                                                } ${takenSlots.includes(time) ? 'disabled' : ''}`}
                                            onClick={() => !takenSlots.includes(time) && onTimeSelect(time)}
                                            disabled={takenSlots.includes(time)}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="time-period">
                                <div className="time-period-label">Akşam</div>
                                <div className="time-slots">
                                    {TIME_SLOTS.evening.map((time) => (
                                        <button
                                            key={time}
                                            className={`time-slot ${selectedTime === time ? 'selected' : ''
                                                } ${takenSlots.includes(time) ? 'disabled' : ''}`}
                                            onClick={() => !takenSlots.includes(time) && onTimeSelect(time)}
                                            disabled={takenSlots.includes(time)}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
