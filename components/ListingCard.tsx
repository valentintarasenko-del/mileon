'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Listing } from '@/lib/types'
import { useUser } from './UserProvider'

type Props = {
  listing: Listing
  onBought?: () => void
}

export default function ListingCard({ listing, onBought }: Props) {
  const { user, refreshUser } = useUser()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const isOwner = user?.id === listing.user_id
  const canBuy = user && !isOwner && !listing.sold && user.coins >= listing.price

  async function handleBuy() {
    if (!user || !canBuy) return
    setLoading(true)
    try {
      const res = await fetch('/api/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id, buyerId: user.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'Ошибка покупки')
      } else {
        setMessage('🎉 Куплено!')
        await refreshUser()
        onBought?.()
      }
    } catch {
      setMessage('Нет связи, попробуй снова')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`bg-white rounded-3xl shadow-md overflow-hidden transition-transform hover:scale-[1.02] ${listing.sold ? 'opacity-60' : ''}`}>
      {/* Фото игрушки */}
      <div className="relative h-48 bg-gray-100">
        <Image
          src={listing.image_url}
          alt={listing.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 50vw"
        />
        {listing.sold && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white font-black px-4 py-2 rounded-full text-lg rotate-[-10deg]">
              ПРОДАНО
            </span>
          </div>
        )}
      </div>

      {/* Информация */}
      <div className="p-4">
        <h3 className="font-black text-gray-800 text-lg leading-tight truncate">{listing.title}</h3>

        {/* Продавец */}
        <p className="text-sm text-gray-400 mt-1">
          {listing.users?.emoji} {listing.users?.name}
          {isOwner && <span className="ml-1 text-purple-500 font-bold">(это ты)</span>}
        </p>

        {/* Цена и кнопка */}
        <div className="flex items-center justify-between mt-3">
          <div className="bg-yellow-100 text-yellow-700 font-black px-3 py-1 rounded-full flex items-center gap-1">
            <span>🪙</span>
            <span>{listing.price}</span>
          </div>

          {!listing.sold && !isOwner && user && (
            <button
              onClick={handleBuy}
              disabled={loading || !canBuy}
              className={`font-bold px-4 py-2 rounded-2xl text-sm transition-colors ${
                canBuy
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? '...' : canBuy ? '🛒 Купить' : '😔 Мало монет'}
            </button>
          )}
        </div>

        {message && (
          <p className="text-center text-sm font-bold mt-2 text-green-600">{message}</p>
        )}
      </div>
    </div>
  )
}
