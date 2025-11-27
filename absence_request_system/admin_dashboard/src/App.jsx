import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { Login } from './components/Login'
import { RequestsList } from './components/RequestsList'
import { DelaysList } from './components/DelaysList'
import './styles/App.css'

function App() {
    const { isAuthenticated, isAdmin, loading, signIn, signOut, profile } = useAuth()
    const [activeTab, setActiveTab] = useState('absence')

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

    if (!isAdmin) {
        return (
            <div className="error-container">
                <div className="error-card">
                    <h2>⚠️ غير مصرح</h2>
                    <p>هذه الصفحة مخصصة للإدارة فقط</p>
                    <button onClick={signOut} className="logout-button">
                        تسجيل الخروج
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-content">
                    <div className="header-title">
                        <h1>🏫 لوحة التحكم - نظام طلبات الغياب</h1>
                        <p className="welcome-text">مرحباً، {profile?.name || 'الإدارة'}</p>
                    </div>
                    <button onClick={signOut} className="logout-button">
                        تسجيل الخروج 🚪
                    </button>
                </div>
            </header>

            <main className="app-main">
                <div className="tabs-container">
                    <button
                        className={`tab-button ${activeTab === 'absence' ? 'active' : ''}`}
                        onClick={() => setActiveTab('absence')}
                    >
                        📋 طلبات الغياب
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'delays' ? 'active' : ''}`}
                        onClick={() => setActiveTab('delays')}
                    >
                        ⏰ طلبات التأخير
                    </button>
                </div>

                {activeTab === 'absence' ? <RequestsList /> : <DelaysList />}
            </main>
        </div>
    )
}

export default App
