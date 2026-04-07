import React from 'react';
import { DAY_NAMES, TIME_OPTIONS } from '../../../data/serviceTemplates';
import type { WorkingHoursData } from '../hooks/useOnboardingState';

interface Step2WorkingHoursProps {
    workingHours: WorkingHoursData;
    onWorkingHoursChange: (
        day: string,
        field: 'isOpen' | 'openTime' | 'closeTime',
        value: boolean | string
    ) => void;
}

export const Step2WorkingHours: React.FC<Step2WorkingHoursProps> = ({
    workingHours,
    onWorkingHoursChange,
}) => (
    <>
        <div className="step-header">
            <h2>Çalışma Saatleri</h2>
            <p>İşletmenizin açık olduğu gün ve saatleri belirleyin</p>
        </div>

        <div className="working-hours-grid">
            {Object.keys(workingHours).map((day) => (
                <div key={day} className="working-hours-row">
                    <span className="day-name">{DAY_NAMES[day]}</span>
                    <div className="day-toggle">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={workingHours[day].isOpen}
                                onChange={(e) => onWorkingHoursChange(day, 'isOpen', e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                    <div className={`time-selects ${!workingHours[day].isOpen ? 'disabled' : ''}`}>
                        <select
                            value={workingHours[day].openTime}
                            onChange={(e) => onWorkingHoursChange(day, 'openTime', e.target.value)}
                        >
                            {TIME_OPTIONS.map(time => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                        <span>-</span>
                        <select
                            value={workingHours[day].closeTime}
                            onChange={(e) => onWorkingHoursChange(day, 'closeTime', e.target.value)}
                        >
                            {TIME_OPTIONS.map(time => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                    </div>
                </div>
            ))}
        </div>
    </>
);
