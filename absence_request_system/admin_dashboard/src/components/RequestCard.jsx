import { StatusBadge } from './StatusBadge'

export function RequestCard({ request, onStatusChange, readOnly = false }) {
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
            </div>

            {!readOnly && (
                <div className="request-actions-buttons">
                    <button
                        className="action-btn approve-btn"
                        onClick={() => onStatusChange(request.id, 'approved')}
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
