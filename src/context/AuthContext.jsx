import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const fetchingRef = useRef(false)  // prevent duplicate fetches

  async function fetchProfile(userId) {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, phone, role, status')
        .eq('id', userId)
        .maybeSingle()          // maybeSingle won't error if row missing
      if (!error && data) setProfile(data)
      return data
    } finally {
      fetchingRef.current = false
    }
  }

  useEffect(() => {
    // Get session once on mount — no loading spinner delay
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        // Check if profile is in user_metadata first (instant, no DB round-trip)
        const meta = u.user_metadata
        if (meta?.role) {
          setProfile({
            id:    u.id,
            name:  meta.name  || '',
            email: u.email    || '',
            phone: meta.phone || '',
            role:  meta.role,
            status: 'active',
          })
          setLoading(false)
          // Sync from DB in background (non-blocking)
          fetchProfile(u.id)
        } else {
          fetchProfile(u.id).finally(() => setLoading(false))
        }
      } else {
        setLoading(false)
      }
    })

    // Auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const u = session?.user ?? null
        setUser(u)

        if (event === 'SIGNED_OUT') {
          setProfile(null)
          setLoading(false)
          return
        }

        if (u) {
          // Use metadata immediately for instant render
          const meta = u.user_metadata
          if (meta?.role) {
            setProfile(prev => prev ?? {
              id:    u.id,
              name:  meta.name  || '',
              email: u.email    || '',
              phone: meta.phone || '',
              role:  meta.role,
              status: 'active',
            })
          }
          setLoading(false)
          // Sync DB profile in background
          fetchProfile(u.id)
        } else {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    setProfile(null)
    setUser(null)
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
