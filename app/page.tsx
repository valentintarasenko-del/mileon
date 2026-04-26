'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ListingCard from '@/components/ListingCard'
import type { Listing } from '@/lib/types'

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  async function loadListings() {
    try {
      const res = await fetch('/api/listings')
      if (res.ok) {
        const data = await res.json()
        setListings(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadListings()
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Заголовок страницы */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-purple-700">🏪 Все игрушки</h2>
        <p className="text-gray-500 text-sm mt-1">Покупай за МиЛеМонеты или продай свою!</p>
      </div>

      {/* Кнопка продать — большая и приметная */}
      <Link
        href="/sell"
        className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center font-black text-xl py-4 rounded-3xl mb-6 shadow-lg transition-colors"
      >
        📸 Продать игрушку
      </Link>

      {/* Сетка с товарами */}
      {loading ? (
        <div className="text-center py-16 text-4xl animate-bounce">🧸</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">😢</div>
          <p className="text-gray-500 font-bold text-lg">Здесь пока пусто</p>
          <p className="text-gray-400 text-sm mt-1">Будь первым — продай игрушку!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {listings.map(listing => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onBought={loadListings}
            />
          ))}
        </div>
      )}
    </div>
  )
}
