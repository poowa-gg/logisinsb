import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Build a profile object from auth user metadata (instant, no DB needed)
  function profileFromMeta(u) {
    if (!u) return null
    const m = u.user_metadata || {}
    return {
      id:     u.id,
      name:   m.name  || u.email?.split('@')[0] || 'User',
      email:  u.email || '',
      phone:  m.phone || '',
      role:   m.role  || 'buyer',
      status: 'active',
    }
  }

  // Fetch full profile from DB and merge (runs in background)
  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, phone, role, status')
        .eq('id', userId)
        .maybeSingle()
      if (!error && data) {
        setProfile(data)
        return data
      }
    } catch (e) {
      // Non-fatal — metadata profile is already set
    }
    return null
  }

  useEffect(() => {
    // 1. Get current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)

      if (u) {
        // Set profile from metadata instantly — no loading delay
        setProfile(profileFromMeta(u))
        setLoading(false)
        // Sync from DB in background
        fetchProfile(u.id)
      } else {
        setLoading(false)
      }
    })

    // 2. Listen for auth changes
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
          // Always set from metadata first for instant render
          setProfile(prev => prev?.id === u.id ? prev : profileFromMeta(u))
          setLoading(false)
          // Background DB sync
          fetchProfile(u.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    setUser(null)
    setProfile(null)
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
