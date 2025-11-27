import { useRequests } from '../hooks/useRequests'
import { RequestCard } from './RequestCard'

export function RequestsList() {
    const { requests, loading, error, updateRequestStatus } = useRequests('pending')

    const handleStatusChange = async (requestId, newStatus) => {
        const result = await updateRequestStatus(requestId, newStatus)

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
            </div>
        )
    }

    if (requests.length === 0) {
        return (
            <div className="empty-container">
                <p className="empty-message">📭 لا توجد طلبات</p>
            </div>
        )
    }

    return (
        <div className="requests-list">
            <h2 className="list-title">طلبات الغياب الجديدة ({requests.length})</h2>
            <div className="requests-grid">
                {requests.map((request) => (
                    <RequestCard
                        key={request.id}
                        request={request}
                        onStatusChange={handleStatusChange}
                    />
                ))}
            </div>
        </div>
    )
}
