import { useState, useMemo } from 'react'
import { useRequests } from '../hooks/useRequests'
import { useDelays } from '../hooks/useDelays'
import { RequestCard } from './RequestCard'
import { DelayCard } from './DelayCard'

export function HistoryView() {
    const { requests: absenceRequests, loading: loadingAbsence, updateRequestStatus } = useRequests(null, 100) // Fetch last 100
    const { delays: delayRequests, loading: loadingDelays, updateDelayStatus } = useDelays(null, 100) // Fetch last 100

    const [typeFilter, setTypeFilter] = useState('all') // 'all', 'absence', 'delay'
    const [timeFilter, setTimeFilter] = useState('all') // 'all', 'D', 'W', 'M', 'Y'
    const [nameFilter, setNameFilter] = useState('')
    const [absenceTypeFilter, setAbsenceTypeFilter] = useState('all') // 'all', 'عارضة', 'اعتيادى', 'مرضى', 'اخرى'

    const filteredData = useMemo(() => {
        let data = []

        // 1. Combine Data based on Type Filter
        if (typeFilter === 'all' || typeFilter === 'absence') {
            data = [...data, ...absenceRequests.map(r => ({ ...r, requestType: 'absence' }))]
        }
        if (typeFilter === 'all' || typeFilter === 'delay') {
            data = [...data, ...delayRequests.map(r => ({ ...r, requestType: 'delay' }))]
        }

        // 2. Filter by Name
        if (nameFilter.trim()) {
            const search = nameFilter.toLowerCase().trim()
            data = data.filter(item =>
                item.teacher_name && item.teacher_name.toLowerCase().includes(search)
            )
        }

        // 3. Filter by Absence Type
        if (absenceTypeFilter !== 'all') {
            data = data.filter(item =>
                item.requestType === 'absence' && item.type === absenceTypeFilter
            )
        }

        // 4. Filter by Time
        if (timeFilter !== 'all') {
            const now = new Date()
            data = data.filter(item => {
                const itemDate = new Date(item.date)

                switch (timeFilter) {
                    case 'D': {
                        // Compare calendar dates (same day, month, year)
                        return itemDate.getDate() === now.getDate() &&
                            itemDate.getMonth() === now.getMonth() &&
                            itemDate.getFullYear() === now.getFullYear()
                    }
                    case 'W': {
                        const diffTime = Math.abs(now - itemDate)
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        return diffDays <= 7
                    }
                    case 'M': {
                        const diffTime = Math.abs(now - itemDate)
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        return diffDays <= 30
                    }
                    case 'Y': {
                        const diffTime = Math.abs(now - itemDate)
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        return diffDays <= 365
                    }
                    default: return true
                }
            })
        }

        // Sort by date descending
        return data.sort((a, b) => new Date(b.date) - new Date(a.date))
    }, [absenceRequests, delayRequests, typeFilter, timeFilter, nameFilter, absenceTypeFilter])

    if (loadingAbsence || loadingDelays) {
        return <div className="loading-container"><div className="spinner"></div></div>
    }

    return (
        <div className="history-view">
            <div className="filters-bar">
                <div className="filter-group">
                    <label>بحث بالاسم:</label>
                    <input
                        type="text"
                        placeholder="اسم المعلم..."
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label>نوع الطلب:</label>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value="all">الكل</option>
                        <option value="absence">طلبات الغياب</option>
                        <option value="delay">طلبات التأخير</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>نوع الغياب:</label>
                    <select value={absenceTypeFilter} onChange={(e) => setAbsenceTypeFilter(e.target.value)}>
                        <option value="all">الكل</option>
                        <option value="عارضة">عارضة</option>
                        <option value="اعتيادى">اعتيادى</option>
                        <option value="مرضى">مرضى</option>
                        <option value="اخرى">اخرى</option>
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
                        item.requestType === 'absence' ? (
                            <RequestCard
                                key={`abs-${item.id}`}
                                request={item}
                                readOnly={true}
                                onStatusChange={async (id, status, type) => {
                                    await updateRequestStatus(id, status || item.status, type)
                                }}
                            />
                        ) : (
                            <DelayCard
                                key={`del-${item.id}`}
                                delay={item}
                                readOnly={true}
                                onStatusChange={async (id, status, minutes) => {
                                    await updateDelayStatus(id, status || item.status, minutes)
                                }}
                            />
                        )
                    ))
                )}
            </div>
        </div>
    )
}
