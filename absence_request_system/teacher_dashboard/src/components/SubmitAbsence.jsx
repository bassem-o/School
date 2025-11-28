import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { requestsService } from '../services/requestsService';

export function SubmitAbsence({ onBack }) {
    const { user, profile } = useAuth();
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim() || reason.trim().length < 10) {
            setError('السبب يجب أن يكون 10 أحرف على الأقل');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await requestsService.submitRequest(user.id, profile.name, reason.trim());
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
                    <h1 className="page-title">تقديم طلب غياب</h1>
                </div>

                <div className="form-container">
                    <div className="info-box">
                        <span className="info-icon">ℹ️</span>
                        <p>الرجاء كتابة سبب الغياب بوضوح</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <label className="form-label">سبب الغياب</label>
                        <textarea
                            className="form-textarea"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="اكتب سبب طلب الغياب هنا..."
                        ></textarea>

                        {error && <p className="error-message" style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

                        <button
                            type="submit"
                            className="submit-btn gradient-blue"
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
                        <p className="modal-text">تم تقديم طلب الغياب بنجاح</p>
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
