'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@/lib/types'
import UserSetup from './UserSetup'

type UserContextType = {
  user: User | null
  setUser: (u: User) => void
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  refreshUser: async () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Загружаем пользователя из localStorage при старте
  useEffect(() => {
    const savedId = localStorage.getItem('mileon_user_id')
    if (savedId) {
      fetchUser(savedId)
    } else {
      setLoading(false)
    }
  }, [])

  async function fetchUser(id: string) {
    try {
      const res = await fetch(`/api/users?id=${id}`)
      if (res.ok) {
        const data = await res.json()
        setUserState(data)
      } else {
        // Пользователь не найден — сбрасываем localStorage
        localStorage.removeItem('mileon_user_id')
      }
    } catch {
      // Нет сети или ошибка — просто продолжаем
    } finally {
      setLoading(false)
    }
  }

  function setUser(u: User) {
    localStorage.setItem('mileon_user_id', u.id)
    setUserState(u)
  }

  async function refreshUser() {
    const savedId = localStorage.getItem('mileon_user_id')
    if (savedId) await fetchUser(savedId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-purple-50 flex items-center justify-center">
        <div className="text-5xl animate-bounce">👑</div>
      </div>
    )
  }

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {!user && <UserSetup onCreated={setUser} />}
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
