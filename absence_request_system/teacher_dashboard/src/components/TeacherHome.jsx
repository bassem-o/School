import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { requestsService } from '../services/requestsService';
import { authService } from '../services/authService';

export function TeacherHome({ onViewChange, onLogout }) {
    const { user, profile } = useAuth();
    const [teacherDetails, setTeacherDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    // Settings Modal State
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [pendingChanges, setPendingChanges] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadTeacherDetails();
    }, [user]);

    async function loadTeacherDetails() {
        try {
            if (!user?.id) return;
            const details = await requestsService.getTeacherDetails(user.id);
            setTeacherDetails(details);
        } catch (error) {
            console.error('Error loading teacher details:', error);
        } finally {
            setLoading(false);
        }
    }

    const openSettingsModal = () => {
        setNewUsername(profile?.username || '');
        setNewPassword('');
        setShowSettingsModal(true);
    };

    const handleSaveSettings = () => {
        const changes = {};
        if (newUsername && newUsername !== profile?.username) {
            changes.username = newUsername;
        }
        if (newPassword && newPassword.trim() !== '') {
            changes.password = newPassword;
        }

        if (Object.keys(changes).length === 0) {
            alert('لا توجد تغييرات للحفظ');
            return;
        }

        setPendingChanges(changes);
        setShowSettingsModal(false);
        setShowConfirmModal(true);
    };

    const confirmUpdate = async () => {
        if (!pendingChanges) return;

        setUpdating(true);
        try {
            await authService.updateCredentials(
                user.id,
                pendingChanges.username,
                pendingChanges.password
            );

            setShowConfirmModal(false);
            setPendingChanges(null);
            setNewUsername('');
            setNewPassword('');

            // Show success modal instead of alert
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error updating credentials:', error);

            // Close confirmation modal and show error
            setShowConfirmModal(false);
            setPendingChanges(null);

            // Show error message
            alert(error.message || 'فشل تحديث البيانات');

            // Reopen settings modal so user can fix the issue
            if (error.message === 'اسم المستخدم موجود بالفعل') {
                setShowSettingsModal(true);
            }
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="teacher-home">
            <div className="gradient-bg"></div>

            <div className="content-container">
                {/* Header Bar with Icons - Compact */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    padding: '0',
                    gap: '0.5rem'
                }}>
                    {/* Settings Icon */}
                    <button
                        onClick={openSettingsModal}
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            borderRadius: '12px',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="الإعدادات"
                    >
                        ⚙️
                    </button>

                    {/* Logout Icon */}
                    <button
                        onClick={onLogout}
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            borderRadius: '12px',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="تسجيل الخروج"
                    >
                        🚪
                    </button>
                </div>

                {/* Profile Card */}
                <div className="profile-card">
                    <div className="avatar-circle">
                        <span className="avatar-icon">👤</span>
                    </div>
                    <h2>{profile?.name || 'المعلم'}</h2>
                    <p className="subject-text">{teacherDetails?.subject || 'مادة غير محددة'}</p>

                    {teacherDetails?.classes && teacherDetails.classes.length > 0 && (
                        <div className="classes-tags">
                            {teacherDetails.classes.map((className, index) => (
                                <span key={index} className="class-tag">{className}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions Grid */}
                <div className="actions-grid">
                    <button
                        className="action-card gradient-blue"
                        onClick={() => onViewChange('submit-absence')}
                    >
                        <span className="action-icon">📝</span>
                        <span className="action-label">تقديم طلب غياب</span>
                    </button>

                    <button
                        className="action-card gradient-orange"
                        onClick={() => onViewChange('submit-delay')}
                    >
                        <span className="action-icon">⏰</span>
                        <span className="action-label">تقديم طلب تأخير</span>
                    </button>

                    <button
                        className="action-card glass-white"
                        onClick={() => onViewChange('my-requests')}
                    >
                        <span className="action-icon">📋</span>
                        <span className="action-label">طلباتي</span>
                    </button>

                    <button
                        className="action-card glass-white"
                        onClick={() => onViewChange('my-delays')}
                    >
                        <span className="action-icon">🕐</span>
                        <span className="action-label">سجل التأخيرات</span>
                    </button>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <span className="modal-icon">⚙️</span>
                        <h3 className="modal-title">تغيير بيانات الدخول</h3>

                        <div style={{ width: '100%', textAlign: 'right', marginTop: '1rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                                    اسم المستخدم
                                </label>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '1rem',
                                        direction: 'ltr',
                                        textAlign: 'left'
                                    }}
                                    placeholder="اسم المستخدم الجديد"
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                                    كلمة المرور الجديدة
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '1rem',
                                        direction: 'ltr',
                                        textAlign: 'left'
                                    }}
                                    placeholder="اتركه فارغاً إذا لم ترد التغيير"
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowSettingsModal(false)}>إلغاء</button>
                            <button className="btn-confirm" onClick={handleSaveSettings}>حفظ</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <span className="modal-icon">⚠️</span>
                        <h3 className="modal-title">تأكيد التغييرات</h3>
                        <p className="modal-text">
                            هل أنت متأكد من تغيير بيانات الدخول؟
                            {pendingChanges?.username && <><br />اسم المستخدم الجديد: <strong>{pendingChanges.username}</strong></>}
                            {pendingChanges?.password && <><br />سيتم تغيير كلمة المرور</>}
                        </p>
                        <div className="modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setPendingChanges(null);
                                }}
                                disabled={updating}
                            >
                                إلغاء
                            </button>
                            <button
                                className="btn-confirm"
                                onClick={confirmUpdate}
                                disabled={updating}
                            >
                                {updating ? 'جاري الحفظ...' : 'تأكيد'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <span className="modal-icon" style={{ fontSize: '4rem' }}>✅</span>
                        <h3 className="modal-title">تم بنجاح!</h3>
                        <p className="modal-text">تم تحديث البيانات بنجاح</p>
                        <div className="modal-actions">
                            <button
                                className="btn-confirm"
                                onClick={() => setShowSuccessModal(false)}
                                style={{ width: '100%' }}
                            >
                                حسناً
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
