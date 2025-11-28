import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { Login } from './components/Login'
import { RequestsList } from './components/RequestsList'
import { DelaysList } from './components/DelaysList'
import { HistoryView } from './components/HistoryView'
import './styles/App.css'

function App() {
    const { isAuthenticated, isTeacher, loading, signIn, signOut, profile } = useAuth()
    const [currentView, setCurrentView] = useState('home') // 'home', 'absence', 'delays', 'history'

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>جاري التحميل...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Login onLogin={signIn} />
    }

    if (!isTeacher) {
        // If it's a fallback profile (timeout), show loading/retrying instead of error
        if (profile?.isFallback) {
            return (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>جاري الاتصال بقاعدة البيانات...</p>
                    <p className="sub-text" style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                        الاتصال بطيء، يرجى الانتظار...
                    </p>
                </div>
            )
        }

        return (
            <div className="error-container">
                <div className="error-card">
                    <h2>⚠️ غير مصرح</h2>
                    <p>هذه الصفحة مخصصة للمعلمين فقط</p>
                    <button onClick={signOut} className="logout-button">
                        تسجيل الخروج
                    </button>
                </div>
            </div>
        )
    }

    const renderContent = () => {
        switch (currentView) {
            case 'absence':
                return <RequestsList />
            case 'delays':
                return <DelaysList />
            case 'history':
                return <HistoryView />
            default:
                return (
                    <div className="home-menu">
                        <button
                            className="menu-card absence-card"
                            onClick={() => setCurrentView('absence')}
                        >
                            <span className="menu-icon">📋</span>
                            <h3>طلبات الغياب</h3>
                            <p>تقديم طلب غياب جديد</p>
                        </button>

                        <button
                            className="menu-card delay-card"
                            onClick={() => setCurrentView('delays')}
                        >
                            <span className="menu-icon">⏰</span>
                            <h3>طلبات التأخير</h3>
                            <p>تقديم طلب تأخير جديد</p>
                        </button>

                        <button
                            className="menu-card history-card"
                            onClick={() => setCurrentView('history')}
                        >
                            <span className="menu-icon">📜</span>
                            <h3>سجلي</h3>
                            <p>عرض سجل طلباتي</p>
                        </button>
                    </div>
                )
        }
    }

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-content">
                    <div className="header-title">
                        <h1>🏫 لوحة المعلم - نظام طلبات الغياب</h1>
                        <p className="welcome-text">مرحباً، {profile?.name || 'المعلم'}</p>
                    </div>
                    <div className="header-actions">
                        {currentView !== 'home' && (
                            <button
                                onClick={() => setCurrentView('home')}
                                className="back-button"
                                title="الرئيسية"
                            >
                                🏠
                            </button>
                        )}
                        <button
                            onClick={signOut}
                            className="logout-button"
                            title="تسجيل الخروج"
                        >
                            🚪
                        </button>
                    </div>
                </div>
            </header>

            <main className="app-main">
                {renderContent()}
            </main>
        </div>
    )
}

export default App
