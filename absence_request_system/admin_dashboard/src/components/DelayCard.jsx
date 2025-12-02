import { useState, useEffect } from 'react'
import { StatusBadge } from './StatusBadge'

export function DelayCard({ delay, onStatusChange, readOnly = false }) {
    const [minutes, setMinutes] = useState(delay.minutes || '')
    const [delayType, setDelayType] = useState(
        delay.minutes === 'اذن يومى' ? 'اذن' : 'دقائق'
    )
    const [showConfirm, setShowConfirm] = useState(false)
    const [isEditingHistory, setIsEditingHistory] = useState(false)

    // Update local state if prop changes (e.g. after save)
    useEffect(() => {
        setMinutes(delay.minutes || '')
        setDelayType(delay.minutes === 'اذن يومى' ? 'اذن' : 'دقائق')
    }, [delay.minutes])

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString('ar-EG', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const handleApproveClick = () => {
        // If type is "اذن", use "اذن يومى" as the value
        if (delayType === 'اذن') {
            onStatusChange(delay.id, 'approved', 'اذن يومى')
        } else if (!minutes || isNaN(minutes) || minutes <= 0) {
            setShowConfirm(true)
        } else {
            onStatusChange(delay.id, 'approved', minutes)
        }
    }

    const handleConfirmApprove = () => {
        setShowConfirm(false)
        onStatusChange(delay.id, 'approved', delayType === 'اذن' ? 'اذن يومى' : (minutes || 0))
    }

    const handleHistoryUpdate = () => {
        if (onStatusChange) {
            const value = delayType === 'اذن' ? 'اذن يومى' : minutes
            onStatusChange(delay.id, null, value) // null status means keep existing
            setIsEditingHistory(false)
        }
    }

    const handleDelayTypeChange = (newType) => {
        setDelayType(newType)
        setIsEditingHistory(true)
        if (newType === 'اذن') {
            setMinutes('اذن يومى')
        } else if (minutes === 'اذن يومى') {
            setMinutes('')
        }
    }

    return (
        <div className="request-card" style={{ position: 'relative', overflow: 'hidden' }}>
            {showConfirm && (
                <div className="confirm-overlay" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255,255,255,0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    padding: '1rem',
                    textAlign: 'center'
                }}>
                    <p style={{ marginBottom: '1rem', fontWeight: 'bold', color: '#c53030' }}>
                        هل أنت متأكد من الموافقة بدون تحديد مدة التأخير؟
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={handleConfirmApprove}
                            className="action-btn approve-btn"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                        >
                            نعم، وافق
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="action-btn"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: '#edf2f7', color: '#4a5568' }}
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            )}

            <div className="request-header">
                <StatusBadge status={delay.status} />
                <span className="request-date">{formatDate(delay.date)}</span>
            </div>

            <div className="request-body">
                <div className="request-field">
                    <span className="field-icon">👤</span>
                    <span className="field-label">المعلم:</span>
                    <span className="field-value">{delay.teacher_name || 'غير معروف'}</span>
                </div>

                <div className="request-field">
                    <span className="field-icon">📚</span>
                    <span className="field-label">المادة:</span>
                    <span className="field-value">{delay.subject}</span>
                </div>

                <div className="request-field">
                    <span className="field-icon">👥</span>
                    <span className="field-label">الفصول:</span>
                    <span className="field-value">{delay.classes?.join('، ')}</span>
                </div>

                <div className="request-field">
                    <span className="field-icon">⏰</span>
                    <span className="field-label">سبب التأخير:</span>
                    <span className="field-value">{delay.reason}</span>
                </div>

                {/* History View Logic */}
                {(readOnly && delay.status === 'approved') && (
                    <div className="request-field" style={{ alignItems: 'center' }}>
                        <span className="field-icon">📋</span>
                        <span className="field-label">النوع:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <select
                                value={delayType}
                                onChange={(e) => handleDelayTypeChange(e.target.value)}
                                style={{
                                    padding: '0.25rem 0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="دقائق">دقائق</option>
                                <option value="اذن">اذن</option>
                            </select>

                            {delayType === 'اذن' ? (
                                <span style={{
                                    color: '#10b981',
                                    fontWeight: 'bold',
                                    fontSize: '0.95rem'
                                }}>
                                    اذن يومى
                                </span>
                            ) : (
                                <>
                                    <input
                                        type="number"
                                        min="0"
                                        value={minutes === 'اذن يومى' ? '' : minutes}
                                        onChange={(e) => {
                                            setMinutes(e.target.value)
                                            setIsEditingHistory(true)
                                        }}
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            width: '70px',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    <span style={{ fontSize: '0.85rem', color: '#666' }}>دقيقة</span>
                                </>
                            )}

                            {isEditingHistory && (
                                <button
                                    onClick={handleHistoryUpdate}
                                    style={{
                                        padding: '0.25rem 0.5rem',
                                        background: '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    حفظ
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Pending View Logic */}
                {!readOnly && (
                    <div className="request-field" style={{ alignItems: 'center' }}>
                        <span className="field-icon">📋</span>
                        <span className="field-label">النوع:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <select
                                value={delayType}
                                onChange={(e) => {
                                    const newType = e.target.value
                                    setDelayType(newType)
                                    if (newType === 'اذن') {
                                        setMinutes('اذن يومى')
                                    } else if (minutes === 'اذن يومى') {
                                        setMinutes('')
                                    }
                                }}
                                style={{
                                    padding: '0.25rem 0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="دقائق">دقائق</option>
                                <option value="اذن">اذن</option>
                            </select>

                            {delayType === 'اذن' ? (
                                <span style={{
                                    color: '#10b981',
                                    fontWeight: 'bold',
                                    fontSize: '0.95rem'
                                }}>
                                    اذن يومى
                                </span>
                            ) : (
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={minutes === 'اذن يومى' ? '' : minutes}
                                    onChange={(e) => setMinutes(e.target.value)}
                                    style={{
                                        padding: '0.25rem 0.5rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        width: '80px',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {!readOnly && (
                <div className="request-actions-buttons">
                    <button
                        className="action-btn approve-btn"
                        onClick={handleApproveClick}
                    >
                        ✅ موافق
                    </button>
                    <button
                        className="action-btn reject-btn"
                        onClick={() => onStatusChange(delay.id, 'rejected')}
                    >
                        ❌ أرفض
                    </button>
                </div>
            )}
        </div>
    )
}
