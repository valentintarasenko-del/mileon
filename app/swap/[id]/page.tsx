'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useUser } from '@/components/UserProvider'

type SwapData = {
  id: string
  status: 'pending' | 'accepted' | 'declined'
  requester: { name: string; emoji: string }
  listing: { id: string; title: string; image_url: string; price: number; user_id: string; users: { name: string; emoji: string } }
  offered_listing: { id: string; title: string; image_url: string; price: number; users: { name: string; emoji: string } }
}

export default function SwapPage({ params }: { params: { id: string } }) {
  const { user } = useUser()
  const [swap, setSwap] = useState<SwapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [done, setDone] = useState('')

  useEffect(() => {
    fetch(`/api/swap/${params.id}`)
      .then(r => r.json())
      .then(data => setSwap(data))
      .finally(() => setLoading(false))
  }, [params.id])

  async function handleAction(action: 'accept' | 'decline') {
    if (!user) return
    setActing(true)
    const res = await fetch(`/api/swap/${params.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, userId: user.id }),
    })
    const data = await res.json()
    if (res.ok) {
      setDone(action === 'accept' ? 'accepted' : 'declined')
      setSwap(prev => prev ? { ...prev, status: data.status } : prev)
    }
    setActing(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-5xl animate-bounce">🔄</div>
  )

  if (!swap || (swap as { error?: string }).error) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-3">😕</div>
      <p className="font-bold text-gray-500">Предложение не найдено</p>
    </div>
  )

  const isOwner = user?.id === swap.listing.user_id
  const status = done || swap.status

  return (
    <div className="max-w-sm mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🔄</div>
        <h2 className="text-2xl font-black text-purple-700">Предложение обмена</h2>
        <p className="text-gray-500 text-sm mt-1">
          {swap.requester.emoji} <strong>{swap.requester.name}</strong> хочет поменяться!
        </p>
      </div>

      {/* Две карточки — твоя и его */}
      <div className="flex items-center gap-3 mb-6">
        {/* Предлагает */}
        <div className="flex-1 bg-white rounded-2xl shadow overflow-hidden">
          <div className="relative h-32">
            <Image src={swap.offered_listing.image_url} alt={swap.offered_listing.title} fill className="object-cover" sizes="150px" />
          </div>
          <div className="p-2 text-center">
            <p className="text-xs text-gray-400 font-bold">ОТДАЁТ</p>
            <p className="font-black text-sm truncate">{swap.offered_listing.title}</p>
            <p className="text-xs text-gray-400">{swap.offered_listing.users?.emoji} {swap.offered_listing.users?.name}</p>
          </div>
        </div>

        <div className="text-3xl">⇄</div>

        {/* Хочет получить */}
        <div className="flex-1 bg-white rounded-2xl shadow overflow-hidden">
          <div className="relative h-32">
            <Image src={swap.listing.image_url} alt={swap.listing.title} fill className="object-cover" sizes="150px" />
          </div>
          <div className="p-2 text-center">
            <p className="text-xs text-gray-400 font-bold">ПОЛУЧАЕТ</p>
            <p className="font-black text-sm truncate">{swap.listing.title}</p>
            <p className="text-xs text-gray-400">{swap.listing.users?.emoji} {swap.listing.users?.name}</p>
          </div>
        </div>
      </div>

      {/* Статус или кнопки */}
      {status === 'accepted' && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-4 text-center">
          <div className="text-4xl mb-1">🎉</div>
          <p className="font-black text-green-700 text-lg">Обмен состоялся!</p>
          <p className="text-green-600 text-sm">Игрушки поменялись владельцами</p>
        </div>
      )}

      {status === 'declined' && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
          <div className="text-4xl mb-1">😔</div>
          <p className="font-black text-red-600 text-lg">Обмен отклонён</p>
        </div>
      )}

      {status === 'pending' && isOwner && (
        <div className="space-y-3">
          <p className="text-center text-sm text-gray-500 font-bold">Это твоя игрушка — хочешь поменяться?</p>
          <button
            onClick={() => handleAction('accept')}
            disabled={acting}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-black text-lg py-4 rounded-2xl transition-colors"
          >
            {acting ? '⏳...' : '✅ Принять обмен!'}
          </button>
          <button
            onClick={() => handleAction('decline')}
            disabled={acting}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-2xl transition-colors"
          >
            ❌ Отклонить
          </button>
        </div>
      )}

      {status === 'pending' && !isOwner && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 text-center">
          <p className="font-bold text-yellow-700">⏳ Ждём ответа владельца...</p>
          <p className="text-yellow-600 text-sm mt-1">Отправь эту ссылку {swap.listing.users?.emoji} {swap.listing.users?.name}</p>
        </div>
      )}
    </div>
  )
}
