'use client'

import { useState } from 'react'
import type { User } from '@/lib/types'

// Набор эмодзи для выбора аватара
const EMOJIS = [
  '🦁', '🐯', '🐻', '🐼', '🐨', '🐸', '🦊', '🐺',
  '🦄', '🐲', '🐙', '🦋', '🐬', '🦅', '🐧', '🦒',
  '🌟', '🌈', '🍭', '🎈', '🚀', '⚡', '🎸', '🏆',
]

type Props = {
  onCreated: (user: User) => void
}

export default function UserSetup({ onCreated }: Props) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Напиши своё имя!'); return }
    if (!emoji) { setError('Выбери свой значок!'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), emoji }),
      })
      if (!res.ok) throw new Error('Ошибка сервера')
      const user = await res.json()
      onCreated(user)
    } catch {
      setError('Что-то пошло не так, попробуй снова')
    } finally {
      setLoading(false)
    }
  }

  return (
    // Полноэкранный оверлей
    <div className="fixed inset-0 bg-purple-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="text-5xl mb-2">👑</div>
        <h1 className="text-2xl font-black text-purple-700 mb-1">Добро пожаловать в MiLeOn!</h1>
        <p className="text-gray-500 text-sm mb-5">
          Продавай и покупай игрушки за МиЛеМонеты.<br/>
          Ты получишь <strong>500 монет</strong> на старте!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Имя */}
          <div>
            <input
              type="text"
              placeholder="Как тебя зовут? 😊"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
              className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3 text-lg font-bold text-center focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Выбор эмодзи */}
          <div>
            <p className="text-sm font-bold text-gray-500 mb-2">Выбери свой значок:</p>
            <div className="grid grid-cols-8 gap-1">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-2xl rounded-xl p-1 transition-transform hover:scale-110 ${
                    emoji === e ? 'bg-purple-200 ring-2 ring-purple-500 scale-110' : 'hover:bg-purple-50'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-black text-lg py-3 rounded-2xl transition-colors"
          >
            {loading ? '⏳ Входим...' : '🚀 Поехали!'}
          </button>
        </form>
      </div>
    </div>
  )
}
