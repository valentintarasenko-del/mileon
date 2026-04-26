import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from '@/components/UserProvider'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'MiLeOn 👑 — Магазин игрушек',
  description: 'Продавай и покупай игрушки за МиЛеМонеты!',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <UserProvider>
          <Header />
          <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-purple-50 pb-10">
            {children}
          </main>
        </UserProvider>
      </body>
    </html>
  )
}
