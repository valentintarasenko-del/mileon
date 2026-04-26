'use client'

import Link from 'next/link'
import { useUser } from './UserProvider'

export default function Header() {
  const { user } = useUser()

  return (
    <header className="bg-purple-600 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Логотип */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tight">
          <span>👑</span>
          <span>MiLeOn</span>
        </Link>

        {/* Правая часть: монеты + профиль */}
        {user && (
          <div className="flex items-center gap-3">
            {/* Баланс монет */}
            <div className="bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <span>🪙</span>
              <span>{user.coins}</span>
            </div>

            {/* Аватар-ссылка на профиль */}
            <Link href="/profile" className="text-2xl hover:scale-110 transition-transform">
              {user.emoji}
            </Link>
          </div>
        )}
      </div>

      {/* Нижняя навигация */}
      {user && (
        <nav className="bg-purple-700 px-4 py-2">
          <div className="max-w-2xl mx-auto flex gap-4 text-sm font-bold">
            <Link href="/" className="hover:text-yellow-300 transition-colors">
              🏪 Магазин
            </Link>
            <Link href="/sell" className="hover:text-yellow-300 transition-colors">
              📸 Продать
            </Link>
            <Link href="/profile" className="hover:text-yellow-300 transition-colors">
              👤 Мои игрушки
            </Link>
            <Link href="/team" className="hover:text-yellow-300 transition-colors">
              🌟 Команда
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
