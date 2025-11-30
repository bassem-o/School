import { useState, useEffect } from 'react'
import { StatusBadge } from './StatusBadge'
import { AbsenceDaysIndicator } from './AbsenceDaysIndicator'
import { supabase } from '../services/supabaseClient'

const ABSENCE_TYPES = [
    { value: '', label: 'اختر النوع...' },
    { value: 'عارضة', label: 'عارضة' },
    { value: 'اعتيادى', label: 'اعتيادى' },
    { value: 'مرضى', label: 'مرضى' },
    { value: 'اخرى', label: 'اخرى' }
]

export function RequestCard({ request, onStatusChange, readOnly = false }) {
    const [absenceType, setAbsenceType] = useState(request.type || '')
    const [showConfirm, setShowConfirm] = useState(false)
    const [isEditingHistory, setIsEditingHistory] = useState(false)
    const [teacherDetails, setTeacherDetails] = useState(null)

    // Update local state if prop changes (e.g. after save)
    useEffect(() => {
        setAbsenceType(request.type || '')
    }, [request.type])

    // Fetch teacher details to get absence_left
    useEffect(() => {
        async function fetchTeacherDetails() {
            try {
                const { data, error } = await supabase
                    .from('teachers')
                    .select('absence_left')
                    .eq('user_id', request.teacher_id)
                    .single()

                if (!error && data) {
                    setTeacherDetails(data)
                }
            } catch (err) {
                console.error('Error fetching teacher details:', err)
            }
        }

        if (request.teacher_id) {
            fetchTeacherDetails()
        }
    }, [request.teacher_id])

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
        if (!absenceType) {
            setShowConfirm(true)
        } else {
            onStatusChange(request.id, 'approved', absenceType)
        }
    }

    const handleConfirmApprove = () => {
        setShowConfirm(false)
        onStatusChange(request.id, 'approved', absenceType || '')
    }

    const handleHistoryUpdate = async () => {
        if (onStatusChange) {
            await onStatusChange(request.id, null, absenceType) // null status means keep existing
            setIsEditingHistory(false)
        }
    }

    const hasZeroDays = teacherDetails?.absence_left === 0

    return (
        <div
            className="request-card"
            style={{
                position: 'relative',
                overflow: 'hidden',
                ...(hasZeroDays && !readOnly ? {
                    border: '2px solid #f44336',
                    boxShadow: '0 0 15px rgba(244, 67, 54, 0.4)'
                } : {})
            }}
        >
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
                        هل أنت متأكد من الموافقة بدون تحديد نوع الغياب؟
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
                <StatusBadge status={request.status} />
                <span className="request-date">{formatDate(request.date)}</span>
            </div>

            <div className="request-body">
                <div className="request-field">
                    <span className="field-icon">👤</span>
                    <span className="field-label">المعلم:</span>
                    <span className="field-value">{request.teacher_name || 'غير معروف'}</span>
                </div>

                <div className="request-field">
                    <span className="field-icon">📚</span>
                    <span className="field-label">المادة:</span>
                    <span className="field-value">{request.subject}</span>
                </div>

                <div className="request-field">
                    <span className="field-icon">👥</span>
                    <span className="field-label">الفصول:</span>
                    <span className="field-value">{request.classes?.join('، ')}</span>
                </div>

                <div className="request-field">
                    <span className="field-icon">📝</span>
                    <span className="field-label">السبب:</span>
                    <span className="field-value">{request.reason}</span>
                </div>

                {/* Absence Days Indicator */}
                {teacherDetails?.absence_left !== undefined && (
                    <div className="request-field" style={{ flexDirection: 'column', alignItems: 'center', marginTop: '1rem' }}>
                        <AbsenceDaysIndicator
                            absenceLeft={teacherDetails.absence_left}
                            isWarning={teacherDetails.absence_left === 0}
                        />
                    </div>
                )}

                {/* History View Logic */}
                {(readOnly && request.status === 'approved') && (
                    <div className="request-field" style={{ alignItems: 'center' }}>
                        <span className="field-icon">🏷️</span>
                        <span className="field-label">النوع:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <select
                                value={absenceType}
                                onChange={(e) => {
                                    setAbsenceType(e.target.value)
                                    setIsEditingHistory(true)
                                }}
                                style={{
                                    padding: '0.25rem 0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {ABSENCE_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
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
                        <span className="field-icon">🏷️</span>
                        <span className="field-label">النوع:</span>
                        <select
                            value={absenceType}
                            onChange={(e) => setAbsenceType(e.target.value)}
                            style={{
                                padding: '0.25rem 0.5rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '0.9rem'
                            }}
                        >
                            {ABSENCE_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
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
                        onClick={() => onStatusChange(request.id, 'rejected')}
                    >
                        ❌ أرفض
                    </button>
                </div>
            )}
        </div>
    )
}
