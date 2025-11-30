import React from 'react';

export function AbsenceDaysIndicator({ absenceLeft = 7, isWarning = false }) {
    const totalDays = 7;
    const usedDays = totalDays - absenceLeft;

    return (
        <div className="absence-days-container">
            <div className="absence-days-indicator">
                {[...Array(totalDays)].map((_, index) => {
                    const isActive = index < absenceLeft;
                    return (
                        <div
                            key={index}
                            className={`absence-point ${isActive ? 'active' : 'used'} ${isWarning ? 'warning' : ''}`}
                            title={isActive ? 'يوم متبقي' : 'يوم مستخدم'}
                        />
                    );
                })}
            </div>
            <div className="absence-days-count">
                <span className={`count-number ${absenceLeft === 0 ? 'zero' : ''}`}>
                    {absenceLeft} / {totalDays}
                </span>
            </div>
        </div>
    );
}
