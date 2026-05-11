import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import PatientLogin from './pages/PatientLogin'
import AdminLogin from './pages/AdminLogin'
import PatientDashboard from './pages/PatientDashboard'
import AdminDashboard from './pages/AdminDashboard'

import { Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

const ProtectedRoute = ({ children, redirectTo }) => {
  const { user, loading } = useAuth()
  
  if (loading) return null // Or a loading spinner
  
  if (!user) {
    return <Navigate to={redirectTo} replace />
  }
  
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/patient-login" element={<PatientLogin />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route 
        path="/patient-dashboard" 
        element={
          <ProtectedRoute redirectTo="/patient-login">
            <PatientDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute redirectTo="/admin-login">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default App
