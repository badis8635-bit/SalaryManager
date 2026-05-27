import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Workers from './pages/Workers'
import Contracts from './pages/Contracts'
import Payslips from './pages/Payslips'
import Period from './pages/Period'
import Layout from './components/Layout'
import EmployeeLogin from './pages/EmployeeLogin'
import EmployeePortal from './pages/EmployeePortal'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

function EmployeeRoute({ children }) {
  const token = localStorage.getItem('employee_token')
  return token ? children : <Navigate to="/employee/login" />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="workers"   element={<Workers />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="payslips"  element={<Payslips />} />
            <Route path="period"    element={<Period />} />
          </Route>

          {/* Employee */}
          <Route path="/employee/login"  element={<EmployeeLogin />} />
          <Route path="/employee/portal" element={<EmployeeRoute><EmployeePortal /></EmployeeRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}