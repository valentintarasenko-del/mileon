'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useUser } from '@/components/UserProvider'

export default function SellPage() {
  const { user } = useUser()
  const router = useRouter()

  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fileRef = useRef<HTMLInputElement>(null)

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    // Показываем превью сразу
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!photo) { setError('Добавь фото!'); return }
    if (!title.trim()) { setError('Напиши название!'); return }
    const priceNum = parseInt(price)
    if (!priceNum || priceNum < 1) { setError('Напиши цену (минимум 1 монета)'); return }

    setLoading(true)
    setError('')

    try {
      // Шаг 1: загружаем фото
      const formData = new FormData()
      formData.append('file', photo)
      formData.append('userId', user.id)

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!uploadRes.ok) {
        const d = await uploadRes.json()
        throw new Error(d.error || 'Ошибка загрузки фото')
      }
      const { url: imageUrl } = await uploadRes.json()

      // Шаг 2: создаём объявление
      const listingRes = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, title: title.trim(), price: priceNum, imageUrl }),
      })
      if (!listingRes.ok) {
        const d = await listingRes.json()
        throw new Error(d.error || 'Ошибка создания объявления')
      }

      // Всё хорошо — идём в магазин
      router.push('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-purple-700">📸 Продать игрушку</h2>
        <p className="text-gray-500 text-sm mt-1">Сфотографируй и выставь на продажу!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Зона загрузки фото */}
        <div
          className="border-4 border-dashed border-purple-300 rounded-3xl overflow-hidden cursor-pointer hover:border-purple-500 transition-colors bg-white"
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            <div className="relative h-56">
              <Image src={preview} alt="preview" fill className="object-cover" />
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                нажми чтобы сменить
              </div>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-purple-400">
              <div className="text-6xl mb-2">📷</div>
              <p className="font-bold text-lg">Нажми чтобы добавить фото</p>
              <p className="text-sm mt-1">или сделай снимок с камеры</p>
            </div>
          )}
        </div>

        {/* Скрытый input для файла, поддерживает камеру на телефоне */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhoto}
        />

        {/* Название */}
        <input
          type="text"
          placeholder="Название игрушки 🧸"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={50}
          className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3 text-lg font-bold focus:border-purple-500 focus:outline-none"
        />

        {/* Цена */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🪙</span>
          <input
            type="number"
            placeholder="Цена в монетах"
            value={price}
            onChange={e => setPrice(e.target.value)}
            min={1}
            max={9999}
            className="w-full border-2 border-purple-200 rounded-2xl pl-10 pr-4 py-3 text-lg font-bold focus:border-purple-500 focus:outline-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 text-red-600 font-bold text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-black text-xl py-4 rounded-3xl transition-colors shadow-lg"
        >
          {loading ? '⏳ Публикуем...' : '🚀 Выставить на продажу!'}
        </button>
      </form>
    </div>
  )
}
