import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { delaysService } from '../services/delaysService';
import { requestsService } from '../services/requestsService';

export function SubmitDelay({ onBack }) {
    const { user, profile } = useAuth();
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [teacherDetails, setTeacherDetails] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        // Load teacher details for subject/classes
        async function loadDetails() {
            try {
                const details = await requestsService.getTeacherDetails(user.id);
                setTeacherDetails(details);
            } catch (err) {
                // Silently fail or log to console, but don't show error to user as requested
                console.log('Error loading teacher details:', err);
            }
        }
        loadDetails();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim() || reason.trim().length < 10) {
            setError('السبب يجب أن يكون 10 أحرف على الأقل');
            return;
        }

        if (!teacherDetails) {
            setError('بيانات المعلم غير متوفرة');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await delaysService.submitDelayRequest(
                user.id,
                profile.name,
                teacherDetails.subject,
                teacherDetails.classes,
                reason.trim()
            );
            setShowSuccessModal(true);
        } catch (err) {
            setError('فشل تقديم الطلب: ' + err.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="teacher-home">
            <div className="gradient-bg"></div>

            <div className="content-container">
                <div className="page-header">
                    <button onClick={onBack} className="back-icon-btn">➜</button>
                    <h1 className="page-title">تقديم طلب تأخير</h1>
                </div>

                <div className="form-container">
                    <div className="info-box orange">
                        <span className="info-icon">⏰</span>
                        <p>الرجاء كتابة سبب التأخير بوضوح</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <label className="form-label">سبب التأخير</label>
                        <textarea
                            className="form-textarea"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="اكتب سبب التأخير هنا..."
                        ></textarea>

                        {error && <p className="error-message" style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

                        <button
                            type="submit"
                            className="submit-btn gradient-orange"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'جاري التقديم...' : 'تقديم الطلب'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <span className="modal-icon" style={{ fontSize: '4rem' }}>✅</span>
                        <h3 className="modal-title">تم بنجاح!</h3>
                        <p className="modal-text">تم تقديم طلب التأخير بنجاح</p>
                        <div className="modal-actions">
                            <button
                                className="btn-confirm"
                                onClick={onBack}
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
