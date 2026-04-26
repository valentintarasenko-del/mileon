'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
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
  const [showSwap, setShowSwap] = useState(false)

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
    <>
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

          <p className="text-sm text-gray-400 mt-1">
            {listing.users?.emoji} {listing.users?.name}
            {isOwner && <span className="ml-1 text-purple-500 font-bold">(это ты)</span>}
          </p>

          {/* Цена */}
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

          {/* Кнопка обмена */}
          {!listing.sold && !isOwner && user && (
            <button
              onClick={() => setShowSwap(true)}
              className="mt-2 w-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold py-2 rounded-2xl text-sm transition-colors"
            >
              🔄 Поменяться
            </button>
          )}

          {message && (
            <p className="text-center text-sm font-bold mt-2 text-green-600">{message}</p>
          )}
        </div>
      </div>

      {/* Модальное окно обмена */}
      {showSwap && user && (
        <SwapModal
          listing={listing}
          userId={user.id}
          onClose={() => setShowSwap(false)}
        />
      )}
    </>
  )
}

// Модальное окно выбора игрушки для обмена
function SwapModal({ listing, userId, onClose }: { listing: Listing; userId: string; onClose: () => void }) {
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [swapLink, setSwapLink] = useState('')

  useEffect(() => {
    fetch(`/api/listings?userId=${userId}`)
      .then(r => r.json())
      .then(data => setMyListings(data.filter((l: Listing) => !l.sold && l.id !== listing.id)))
      .finally(() => setLoading(false))
  }, [userId, listing.id])

  async function handleSend() {
    if (!selected) return
    setSending(true)
    const res = await fetch('/api/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: listing.id, offeredListingId: selected, requesterId: userId }),
    })
    const data = await res.json()
    if (res.ok) {
      const link = `${window.location.origin}/swap/${data.id}`
      setSwapLink(link)
    }
    setSending(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-5" onClick={e => e.stopPropagation()}>

        {!swapLink ? (
          <>
            <h3 className="text-xl font-black text-center text-purple-700 mb-1">🔄 Поменяться</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Выбери свою игрушку которую хочешь отдать в обмен на <strong>{listing.title}</strong>
            </p>

            {loading ? (
              <div className="text-center py-6 text-3xl animate-bounce">🧸</div>
            ) : myListings.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 font-bold">У тебя нет свободных игрушек</p>
                <p className="text-gray-400 text-sm mt-1">Сначала выставь что-нибудь на продажу</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto mb-4">
                {myListings.map(l => (
                  <div
                    key={l.id}
                    onClick={() => setSelected(l.id)}
                    className={`cursor-pointer rounded-2xl overflow-hidden border-4 transition-all ${
                      selected === l.id ? 'border-purple-500 scale-105' : 'border-transparent'
                    }`}
                  >
                    <div className="relative h-24">
                      <Image src={l.image_url} alt={l.title} fill className="object-cover" sizes="120px" />
                    </div>
                    <p className="text-xs font-bold text-center p-1 truncate">{l.title}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl">
                Отмена
              </button>
              <button
                onClick={handleSend}
                disabled={!selected || sending}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-black py-3 rounded-2xl transition-colors"
              >
                {sending ? '⏳...' : '📨 Отправить'}
              </button>
            </div>
          </>
        ) : (
          // Ссылка готова — копируй и отправляй
          <>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-black text-purple-700">Ссылка готова!</h3>
              <p className="text-sm text-gray-500 mt-1">Отправь её {listing.users?.emoji} {listing.users?.name}</p>
            </div>

            <div className="bg-gray-100 rounded-2xl p-3 mb-4 break-all text-sm font-mono text-gray-700">
              {swapLink}
            </div>

            <button
              onClick={() => { navigator.clipboard.writeText(swapLink) }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-2xl mb-2 transition-colors"
            >
              📋 Скопировать ссылку
            </button>
            <button onClick={onClose} className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl">
              Закрыть
            </button>
          </>
        )}
      </div>
    </div>
  )
}
