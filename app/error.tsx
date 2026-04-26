'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">😕</div>
      <h2 className="text-xl font-black text-gray-700 mb-2">Что-то пошло не так</h2>
      <p className="text-gray-400 text-sm mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="bg-purple-600 text-white font-bold px-6 py-3 rounded-2xl"
      >
        Попробовать снова
      </button>
    </div>
  )
}
