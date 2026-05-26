import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Workers from './pages/Workers'
import Contracts from './pages/Contracts'
import Payslips from './pages/Payslips'
import Period from './pages/Period'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="workers"   element={<Workers />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="payslips"  element={<Payslips />} />
            <Route path="period"    element={<Period />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}