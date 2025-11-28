import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { Login } from './components/Login'
import { TeacherHome } from './components/TeacherHome'
import { SubmitAbsence } from './components/SubmitAbsence'
import { SubmitDelay } from './components/SubmitDelay'
import { MyRequests } from './components/MyRequests'
import { MyDelays } from './components/MyDelays'
import './styles/App.css'

function App() {
    const { isAuthenticated, isTeacher, loading, signIn, signOut, profile } = useAuth()
    const [currentView, setCurrentView] = useState('home') // 'home', 'submit-absence', 'submit-delay', 'my-requests', 'my-delays'

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
            case 'submit-absence':
                return <SubmitAbsence onBack={() => setCurrentView('home')} />
            case 'submit-delay':
                return <SubmitDelay onBack={() => setCurrentView('home')} />
            case 'my-requests':
                return <MyRequests onBack={() => setCurrentView('home')} />
            case 'my-delays':
                return <MyDelays onBack={() => setCurrentView('home')} />
            default:
                return (
                    <TeacherHome onViewChange={setCurrentView} onLogout={signOut} />
                )
        }
    }

    return (
        <div className="app">
            {renderContent()}
        </div>
    )
}

export default App
