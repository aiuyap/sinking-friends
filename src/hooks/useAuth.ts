import { useEffect, useState } from 'react'
import { auth, googleProvider } from '@/lib/firebase-client'
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth'

// Helper to set session cookie
const setSessionCookie = async (user: User | null) => {
  if (user) {
    const token = await user.getIdToken()
    // Set cookie with the token (httpOnly would require an API route)
    document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
  } else {
    // Clear the cookie on logout
    document.cookie = '__session=; path=/; max-age=0'
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      await setSessionCookie(user)
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      // Cookie is cleared by onAuthStateChanged callback
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return {
    user,
    loading,
    isLoading: loading,
    signInWithGoogle,
    logout,
  }
}
