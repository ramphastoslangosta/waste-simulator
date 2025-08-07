import { useState, useEffect } from 'react'

// Simple local auth simulation
interface User {
  id: string
  email: string
}

interface Session {
  user: User
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('current_user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setSession({ user: userData })
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    // Simple validation - in a real app, you'd validate against a backend
    if (!email || !password) {
      return { data: null, error: { message: 'Email y contraseña son requeridos' } }
    }

    if (password.length < 6) {
      return { data: null, error: { message: 'La contraseña debe tener al menos 6 caracteres' } }
    }

    // Create user session
    const userData: User = {
      id: 'local_user_' + Date.now(),
      email: email
    }

    localStorage.setItem('current_user', JSON.stringify(userData))
    setUser(userData)
    setSession({ user: userData })

    return { data: { user: userData }, error: null }
  }

  const signUp = async (email: string, password: string) => {
    // Same as signIn for local storage - in a real app, you'd create a new account
    return await signIn(email, password)
  }

  const signOut = async () => {
    localStorage.removeItem('current_user')
    setUser(null)
    setSession(null)
    return { error: null }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }
}