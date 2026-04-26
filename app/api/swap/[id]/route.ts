import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/swap/[id] — получить данные о предложении обмена
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('swap_requests')
    .select(`
      *,
      listing:listing_id (*, users!listings_user_id_fkey(name, emoji)),
      offered_listing:offered_listing_id (*, users!listings_user_id_fkey(name, emoji)),
      requester:requester_id (name, emoji)
    `)
    .eq('id', params.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
  return NextResponse.json(data)
}

// POST /api/swap/[id] — принять или отклонить обмен
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { action, userId } = await req.json()
  if (!action || !userId) return NextResponse.json({ error: 'Не хватает данных' }, { status: 400 })

  const supabase = createServerSupabase()

  // Получаем запрос на обмен
  const { data: swap } = await supabase
    .from('swap_requests')
    .select('*, listing:listing_id(*), offered_listing:offered_listing_id(*)')
    .eq('id', params.id)
    .single()

  if (!swap) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
  if (swap.status !== 'pending') return NextResponse.json({ error: 'Обмен уже завершён' }, { status: 400 })
  if (swap.listing.user_id !== userId) return NextResponse.json({ error: 'Нет прав' }, { status: 403 })

  if (action === 'decline') {
    await supabase.from('swap_requests').update({ status: 'declined' }).eq('id', params.id)
    return NextResponse.json({ success: true, status: 'declined' })
  }

  if (action === 'accept') {
    // Помечаем обе игрушки как проданные (обменянные)
    await Promise.all([
      supabase.from('listings').update({ sold: true, buyer_id: swap.requester_id }).eq('id', swap.listing_id),
      supabase.from('listings').update({ sold: true, buyer_id: userId }).eq('id', swap.offered_listing_id),
      supabase.from('swap_requests').update({ status: 'accepted' }).eq('id', params.id),
    ])
    return NextResponse.json({ success: true, status: 'accepted' })
  }

  return NextResponse.json({ error: 'Неизвестное действие' }, { status: 400 })
}
