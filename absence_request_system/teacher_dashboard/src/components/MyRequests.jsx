import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { requestsService } from '../services/requestsService';

export function MyRequests({ onBack }) {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);

    useEffect(() => {
        loadRequests();
    }, [user]);

    async function loadRequests() {
        console.log('MyRequests: Starting to load requests for user:', user?.id);
        try {
            if (!user?.id) {
                throw new Error('No user ID available');
            }
            const data = await requestsService.getTeacherRequests(user.id);
            console.log('MyRequests: Loaded requests:', data);
            setRequests(data || []);
            setError(null);
        } catch (error) {
            console.error('MyRequests: Error loading requests:', error);
            setError(error.message || 'Failed to load requests');
        } finally {
            setLoading(false);
        }
    }

    const confirmDelete = (requestId) => {
        setSelectedRequestId(requestId);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!selectedRequestId) return;

        try {
            await requestsService.deleteRequest(selectedRequestId);
            setShowDeleteModal(false);
            setSelectedRequestId(null);
            // Refresh list
            loadRequests();
        } catch (error) {
            console.error('Error deleting request:', error);
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
                    <h1 className="page-title">طلباتي</h1>
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
                                onClick={loadRequests}
                                style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#667EEA', color: 'white', cursor: 'pointer' }}
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="list-card" style={{ textAlign: 'center', color: '#666' }}>
                            <p>لا توجد طلبات سابقة</p>
                        </div>
                    ) : (
                        requests.map(request => (
                            <div key={request.id} className="request-card">
                                {/* Single Header Row: Status (Right) ... Date & Delete (Left) */}
                                <div className="card-header-row">
                                    {/* Right Side: Status Badge */}
                                    <div className="status-badge-container">
                                        <span className={`status-badge-mobile ${getStatusClass(request.status)}`}>
                                            <span className="status-icon-mobile">{getStatusIcon(request.status)}</span>
                                            {getStatusText(request.status)}
                                        </span>
                                    </div>

                                    {/* Left Side: Date & Delete */}
                                    <div className="header-left-group">
                                        <div className="card-date">
                                            <span className="date-icon">🕐</span>
                                            <span>{new Date(request.date).toLocaleDateString('ar-EG')} - {new Date(request.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>

                                        {request.status === 'pending' && (
                                            <button
                                                className="delete-btn"
                                                onClick={() => confirmDelete(request.id)}
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
                                    <span className="card-text-bold">{request.subject}</span>
                                </div>

                                {/* Classes */}
                                {request.classes && request.classes.length > 0 && (
                                    <div className="card-row">
                                        <div className="icon-circle green">
                                            <span>🎓</span>
                                        </div>
                                        <div className="classes-container">
                                            {request.classes.map((className, idx) => (
                                                <span key={idx} className="class-badge">{className}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Type */}
                                <div className="card-row">
                                    <div className="icon-circle" style={{ background: '#e1bee7' }}>
                                        <span>🏷️</span>
                                    </div>
                                    <span className="card-text-bold">
                                        النوع: <span style={{ fontWeight: 'normal', color: request.type ? '#333' : '#888' }}>
                                            {request.type || 'غير محدد'}
                                        </span>
                                    </span>
                                </div>

                                {/* Reason */}
                                <div className="reason-box">
                                    <div className="reason-header">
                                        <span className="reason-icon">📝</span>
                                        <span className="reason-label">سبب الغياب:</span>
                                    </div>
                                    <p className="reason-text">{request.reason}</p>
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
