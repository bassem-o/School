import { useDelays } from '../hooks/useDelays'
import { DelayCard } from './DelayCard'

export function DelaysList() {
    const { delays, loading, error, updateDelayStatus, refetch } = useDelays('pending')

    const handleStatusChange = async (delayId, newStatus) => {
        const result = await updateDelayStatus(delayId, newStatus)

        if (result.success) {
            // Success feedback could be added here
            console.log('Status updated successfully')
        } else {
            alert('فشل تحديث الحالة: ' + result.error)
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>جاري التحميل...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">❌ حدث خطأ: {error}</p>
                <button
                    onClick={() => refetch('pending')}
                    className="action-btn approve-btn"
                    style={{ marginTop: '1rem', maxWidth: '200px' }}
                >
                    🔄 إعادة المحاولة
                </button>
            </div>
        )
    }

    if (delays.length === 0) {
        return (
            <div className="empty-container">
                <p className="empty-message">⏰ لا توجد طلبات تأخير</p>
            </div>
        )
    }

    return (
        <div className="requests-list">
            <h2 className="list-title">طلبات التأخير الجديدة ({delays.length})</h2>
            <div className="requests-grid">
                {delays.map((delay) => (
                    <DelayCard
                        key={delay.id}
                        delay={delay}
                        onStatusChange={handleStatusChange}
                    />
                ))}
            </div>
        </div>
    )
}
