'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

type TeamMember = {
  id: string
  name: string
  image_url: string
  created_at: string
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  // Поля формы
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fileRef = useRef<HTMLInputElement>(null)

  async function loadMembers() {
    const res = await fetch('/api/team')
    if (res.ok) setMembers(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadMembers() }, [])

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!photo) { setError('Добавь фото!'); return }
    if (!name.trim()) { setError('Напиши имя!'); return }

    setSaving(true)
    setError('')
    try {
      // Загружаем фото через общий upload endpoint
      const formData = new FormData()
      formData.append('file', photo)
      formData.append('userId', 'team')

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!uploadRes.ok) throw new Error('Ошибка загрузки фото')
      const { url: imageUrl } = await uploadRes.json()

      // Сохраняем участника
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), imageUrl }),
      })
      if (!res.ok) throw new Error('Ошибка сохранения')

      // Сбрасываем форму
      setName('')
      setPhoto(null)
      setPreview(null)
      setAdding(false)
      await loadMembers()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-purple-700">🌟 Наша команда</h2>
        <p className="text-gray-500 text-sm mt-1">Все кто участвует в MiLeOn</p>
      </div>

      {/* Кнопка добавить */}
      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center font-black text-xl py-4 rounded-3xl mb-6 shadow-lg transition-colors"
        >
          ➕ Добавить участника
        </button>
      )}

      {/* Форма добавления */}
      {adding && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-md p-5 mb-6 space-y-4">
          <h3 className="font-black text-lg text-gray-700 text-center">Новый участник</h3>

          {/* Фото */}
          <div
            className="border-4 border-dashed border-purple-300 rounded-3xl overflow-hidden cursor-pointer hover:border-purple-500 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <div className="relative h-48">
                <Image src={preview} alt="preview" fill className="object-cover" />
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-purple-400">
                <div className="text-5xl mb-2">📷</div>
                <p className="font-bold">Нажми чтобы добавить фото</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />

          {/* Имя */}
          <input
            type="text"
            placeholder="Имя участника"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={30}
            className="w-full border-2 border-purple-200 rounded-2xl px-4 py-3 text-lg font-bold focus:border-purple-500 focus:outline-none"
          />

          {error && <p className="text-red-500 font-bold text-center text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setAdding(false); setPreview(null); setName(''); setError('') }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-2xl transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-black py-3 rounded-2xl transition-colors"
            >
              {saving ? '⏳ Сохраняем...' : '✅ Добавить'}
            </button>
          </div>
        </form>
      )}

      {/* Список участников */}
      {loading ? (
        <div className="text-center py-16 text-4xl animate-bounce">⭐</div>
      ) : members.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">👥</div>
          <p className="text-gray-500 font-bold">Команда пока пустая</p>
          <p className="text-gray-400 text-sm mt-1">Добавь первого участника!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {members.map(member => (
            <div key={member.id} className="bg-white rounded-3xl shadow-md overflow-hidden text-center">
              <div className="relative h-44">
                <Image src={member.image_url} alt={member.name} fill className="object-cover" sizes="200px" />
              </div>
              <div className="p-3">
                <p className="font-black text-gray-800 text-lg">{member.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
