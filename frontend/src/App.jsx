import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import PortfolioDetail from './pages/PortfolioDetail.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AmbientBackground from './components/AmbientBackground.jsx'
import CursorGlow from './components/CursorGlow.jsx'

export default function App() {
  return (
    <>
      <AmbientBackground />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolios/:portfolioId"
            element={
              <ProtectedRoute>
                <PortfolioDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <CursorGlow />
    </>
  )
}
