'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useUser } from '@/components/UserProvider'
import type { Listing } from '@/lib/types'

export default function ProfilePage() {
  const { user } = useUser()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetch(`/api/listings?userId=${user.id}`)
      .then(r => r.json())
      .then(data => setListings(data))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  const sold = listings.filter(l => l.sold)
  const active = listings.filter(l => !l.sold)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Карточка профиля */}
      <div className="bg-white rounded-3xl shadow-md p-6 text-center mb-6">
        <div className="text-6xl mb-2">{user.emoji}</div>
        <h2 className="text-2xl font-black text-gray-800">{user.name}</h2>
        <div className="mt-3 bg-yellow-100 inline-flex items-center gap-2 px-5 py-2 rounded-full">
          <span className="text-2xl">🪙</span>
          <span className="text-2xl font-black text-yellow-700">{user.coins}</span>
          <span className="text-yellow-600 font-bold">МиЛеМонет</span>
        </div>
        <div className="mt-3 flex justify-center gap-6 text-sm text-gray-500">
          <div>
            <span className="font-black text-xl text-purple-600">{active.length}</span>
            <br/>продаётся
          </div>
          <div>
            <span className="font-black text-xl text-green-600">{sold.length}</span>
            <br/>продано
          </div>
        </div>
      </div>

      {/* Мои объявления */}
      {loading ? (
        <div className="text-center py-10 text-4xl animate-bounce">🧸</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-5xl mb-3">🛒</div>
          <p className="font-bold text-gray-500">У тебя ещё нет объявлений</p>
          <a href="/sell" className="mt-3 inline-block bg-purple-600 text-white font-bold px-6 py-2 rounded-2xl">
            Продать первую игрушку
          </a>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="mb-6">
              <h3 className="font-black text-lg text-gray-700 mb-3">🏷️ Продаётся</h3>
              <div className="grid grid-cols-2 gap-3">
                {active.map(l => <MiniCard key={l.id} listing={l} />)}
              </div>
            </div>
          )}
          {sold.length > 0 && (
            <div>
              <h3 className="font-black text-lg text-gray-700 mb-3">✅ Продано</h3>
              <div className="grid grid-cols-2 gap-3">
                {sold.map(l => <MiniCard key={l.id} listing={l} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function MiniCard({ listing }: { listing: Listing }) {
  return (
    <div className={`bg-white rounded-2xl shadow overflow-hidden ${listing.sold ? 'opacity-60' : ''}`}>
      <div className="relative h-32">
        <Image src={listing.image_url} alt={listing.title} fill className="object-cover" sizes="200px" />
        {listing.sold && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">ПРОДАНО</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-bold text-sm truncate">{listing.title}</p>
        <p className="text-yellow-600 font-black text-sm mt-1">🪙 {listing.price}</p>
      </div>
    </div>
  )
}
