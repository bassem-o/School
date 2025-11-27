import { StatusBadge } from './StatusBadge'

export function DelayCard({ delay, onStatusChange, readOnly = false }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString('ar-SA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="request-card">
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
            </div>

            {!readOnly && (
                <div className="request-actions-buttons">
                    <button
                        className="action-btn approve-btn"
                        onClick={() => onStatusChange(delay.id, 'approved')}
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
