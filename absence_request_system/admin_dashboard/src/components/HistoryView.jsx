import { useState, useMemo } from 'react'
import { useRequests } from '../hooks/useRequests'
import { useDelays } from '../hooks/useDelays'
import { RequestCard } from './RequestCard'
import { DelayCard } from './DelayCard'

export function HistoryView() {
    const { requests: absenceRequests, loading: loadingAbsence } = useRequests(null) // Fetch all
    const { delays: delayRequests, loading: loadingDelays } = useDelays(null) // Fetch all

    const [typeFilter, setTypeFilter] = useState('all') // 'all', 'absence', 'delay'
    const [timeFilter, setTimeFilter] = useState('all') // 'all', 'D', 'W', 'M', 'Y'

    const filteredData = useMemo(() => {
        let data = []

        // 1. Combine Data based on Type Filter
        if (typeFilter === 'all' || typeFilter === 'absence') {
            data = [...data, ...absenceRequests.map(r => ({ ...r, type: 'absence' }))]
        }
        if (typeFilter === 'all' || typeFilter === 'delay') {
            data = [...data, ...delayRequests.map(r => ({ ...r, type: 'delay' }))]
        }

        // 2. Filter by Time
        if (timeFilter !== 'all') {
            const now = new Date()
            data = data.filter(item => {
                const itemDate = new Date(item.date)
                const diffTime = Math.abs(now - itemDate)
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                switch (timeFilter) {
                    case 'D': return diffDays <= 1
                    case 'W': return diffDays <= 7
                    case 'M': return diffDays <= 30
                    case 'Y': return diffDays <= 365
                    default: return true
                }
            })
        }

        // Sort by date descending
        return data.sort((a, b) => new Date(b.date) - new Date(a.date))
    }, [absenceRequests, delayRequests, typeFilter, timeFilter])

    if (loadingAbsence || loadingDelays) {
        return <div className="loading-container"><div className="spinner"></div></div>
    }

    return (
        <div className="history-view">
            <div className="filters-bar">
                <div className="filter-group">
                    <label>نوع الطلب:</label>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value="all">الكل</option>
                        <option value="absence">طلبات الغياب</option>
                        <option value="delay">طلبات التأخير</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>الفترة:</label>
                    <div className="time-filters">
                        <button
                            className={`time-btn ${timeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('all')}
                        >الكل</button>
                        <button
                            className={`time-btn ${timeFilter === 'D' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('D')}
                        >يوم</button>
                        <button
                            className={`time-btn ${timeFilter === 'W' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('W')}
                        >أسبوع</button>
                        <button
                            className={`time-btn ${timeFilter === 'M' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('M')}
                        >شهر</button>
                        <button
                            className={`time-btn ${timeFilter === 'Y' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('Y')}
                        >سنة</button>
                    </div>
                </div>
            </div>

            <div className="requests-grid">
                {filteredData.length === 0 ? (
                    <div className="empty-message">لا توجد سجلات مطابقة للفلاتر</div>
                ) : (
                    filteredData.map(item => (
                        item.type === 'absence' ? (
                            <RequestCard key={`abs-${item.id}`} request={item} readOnly={true} />
                        ) : (
                            <DelayCard key={`del-${item.id}`} delay={item} readOnly={true} />
                        )
                    ))
                )}
            </div>
        </div>
    )
}
