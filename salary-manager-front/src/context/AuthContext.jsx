import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('access_token'))

  function doLogin(access_token, refresh_token) {
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    setToken(access_token)
  }

  function doLogin(access_token, refresh_token) {
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    setToken(access_token)
  }

  function doLogout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, doLogin, doLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook raccourci : const { token, login, logout } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}