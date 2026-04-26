import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// POST /api/buy — купить игрушку: списать монеты у покупателя, зачислить продавцу
export async function POST(req: NextRequest) {
  const { listingId, buyerId } = await req.json()
  if (!listingId || !buyerId) {
    return NextResponse.json({ error: 'listingId and buyerId required' }, { status: 400 })
  }

  const supabase = createServerSupabase()

  // Получаем объявление
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single()

  if (listingError || !listing) {
    return NextResponse.json({ error: 'Объявление не найдено' }, { status: 404 })
  }
  if (listing.sold) {
    return NextResponse.json({ error: 'Игрушка уже продана' }, { status: 400 })
  }
  if (listing.user_id === buyerId) {
    return NextResponse.json({ error: 'Нельзя купить свою игрушку' }, { status: 400 })
  }

  // Получаем покупателя
  const { data: buyer, error: buyerError } = await supabase
    .from('users')
    .select('*')
    .eq('id', buyerId)
    .single()

  if (buyerError || !buyer) {
    return NextResponse.json({ error: 'Покупатель не найден' }, { status: 404 })
  }
  if (buyer.coins < listing.price) {
    return NextResponse.json({ error: 'Недостаточно монет' }, { status: 400 })
  }

  // Все проверки пройдены — выполняем транзакцию
  const [markSold, deductBuyer, creditSeller] = await Promise.all([
    // Отмечаем объявление как проданное
    supabase
      .from('listings')
      .update({ sold: true, buyer_id: buyerId })
      .eq('id', listingId),

    // Снимаем монеты с покупателя
    supabase
      .from('users')
      .update({ coins: buyer.coins - listing.price })
      .eq('id', buyerId),

    // Зачисляем монеты продавцу
    supabase.rpc('add_coins', { user_id: listing.user_id, amount: listing.price }),
  ])

  if (markSold.error || deductBuyer.error || creditSeller.error) {
    return NextResponse.json({ error: 'Ошибка при покупке, попробуй снова' }, { status: 500 })
  }

  return NextResponse.json({ success: true, newBalance: buyer.coins - listing.price })
}
