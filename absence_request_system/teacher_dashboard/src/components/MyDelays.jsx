import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { delaysService } from '../services/delaysService';

export function MyDelays({ onBack }) {
    const { user } = useAuth();
    const [delays, setDelays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDelayId, setSelectedDelayId] = useState(null);

    useEffect(() => {
        loadDelays();
    }, [user]);

    async function loadDelays() {
        console.log('MyDelays: Starting to load delays for user:', user?.id);
        try {
            if (!user?.id) {
                throw new Error('No user ID available');
            }
            const data = await delaysService.getTeacherDelays(user.id);
            console.log('MyDelays: Loaded delays:', data);
            setDelays(data || []);
            setError(null);
        } catch (error) {
            console.error('MyDelays: Error loading delays:', error);
            setError(error.message || 'Failed to load delays');
        } finally {
            setLoading(false);
        }
    }

    const confirmDelete = (delayId) => {
        setSelectedDelayId(delayId);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!selectedDelayId) return;

        try {
            await delaysService.deleteDelayRequest(selectedDelayId);
            setShowDeleteModal(false);
            setSelectedDelayId(null);
            // Refresh list
            loadDelays();
        } catch (error) {
            console.error('Error deleting delay:', error);
            alert('فشل حذف الطلب');
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'approved': return 'status-approved';
            case 'rejected': return 'status-rejected';
            default: return 'status-pending';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'approved': return 'موافق عليه';
            case 'rejected': return 'مرفوض';
            default: return 'قيد المراجعة';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return '✓';
            case 'rejected': return '✕';
            default: return '•••';
        }
    };

    return (
        <div className="teacher-home">
            <div className="gradient-bg"></div>

            <div className="content-container">
                <div className="page-header">
                    <button onClick={onBack} className="back-icon-btn">➜</button>
                    <h1 className="page-title">سجل التأخيرات</h1>
                </div>

                <div className="requests-list">
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p style={{ color: 'white' }}>جاري التحميل...</p>
                        </div>
                    ) : error ? (
                        <div className="list-card" style={{ textAlign: 'center', color: '#c62828', background: '#ffebee' }}>
                            <h3>⚠️ خطأ</h3>
                            <p>{error}</p>
                            <button
                                onClick={loadDelays}
                                style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#667EEA', color: 'white', cursor: 'pointer' }}
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    ) : delays.length === 0 ? (
                        <div className="list-card" style={{ textAlign: 'center', color: '#666' }}>
                            <p>لا توجد طلبات تأخير سابقة</p>
                        </div>
                    ) : (
                        delays.map(delay => (
                            <div key={delay.id} className="request-card">
                                {/* Single Header Row: Status (Right) ... Date & Delete (Left) */}
                                <div className="card-header-row">
                                    {/* Right Side: Status Badge */}
                                    <div className="status-badge-container">
                                        <span className={`status-badge-mobile ${getStatusClass(delay.status)}`}>
                                            <span className="status-icon-mobile">{getStatusIcon(delay.status)}</span>
                                            {getStatusText(delay.status)}
                                        </span>
                                    </div>

                                    {/* Left Side: Date & Delete */}
                                    <div className="header-left-group">
                                        <div className="card-date">
                                            <span className="date-icon">🕐</span>
                                            <span>{new Date(delay.date).toLocaleDateString('ar-EG')} - {new Date(delay.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>

                                        {delay.status === 'pending' && (
                                            <button
                                                className="delete-btn"
                                                onClick={() => confirmDelete(delay.id)}
                                                title="حذف الطلب"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="card-row">
                                    <div className="icon-circle blue">
                                        <span>📚</span>
                                    </div>
                                    <span className="card-text-bold">{delay.subject}</span>
                                </div>

                                {/* Classes */}
                                {delay.classes && delay.classes.length > 0 && (
                                    <div className="card-row">
                                        <div className="icon-circle green">
                                            <span>🎓</span>
                                        </div>
                                        <div className="classes-container">
                                            {delay.classes.map((className, idx) => (
                                                <span key={idx} className="class-badge">{className}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reason */}
                                <div className="reason-box">
                                    <div className="reason-header">
                                        <span className="reason-icon">📝</span>
                                        <span className="reason-label">سبب التأخير:</span>
                                    </div>
                                    <p className="reason-text">{delay.reason}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Custom Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <span className="modal-icon">🗑️</span>
                        <h3 className="modal-title">تأكيد الحذف</h3>
                        <p className="modal-text">هل أنت متأكد من أنك تريد حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.</p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>إلغاء</button>
                            <button className="btn-confirm" onClick={handleDelete}>حذف</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
