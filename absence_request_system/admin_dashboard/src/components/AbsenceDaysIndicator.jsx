import React from 'react';

export function AbsenceDaysIndicator({ absenceLeft = 7, isWarning = false }) {
    const totalDays = 7;
    const usedDays = totalDays - absenceLeft;

    return (
        <div className="absence-days-container" style={{ marginTop: 0, padding: 0, alignItems: 'flex-start' }}>
            <div className="absence-days-indicator" style={{ gap: '4px' }}>
                {[...Array(totalDays)].map((_, index) => {
                    const isActive = index < absenceLeft;
                    return (
                        <div
                            key={index}
                            className={`absence-point ${isActive ? 'active-no-glow' : 'used-no-glow'}`}
                            title={isActive ? 'يوم متبقي' : 'يوم مستخدم'}
                            style={{ width: '12px', height: '12px' }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
