import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// POST /api/swap — создать предложение обмена
export async function POST(req: NextRequest) {
  const { listingId, offeredListingId, requesterId } = await req.json()
  if (!listingId || !offeredListingId || !requesterId) {
    return NextResponse.json({ error: 'Не хватает данных' }, { status: 400 })
  }

  const supabase = createServerSupabase()

  // Проверяем что обе игрушки существуют и не проданы
  const { data: wanted } = await supabase.from('listings').select('*').eq('id', listingId).single()
  const { data: offered } = await supabase.from('listings').select('*').eq('id', offeredListingId).single()

  if (!wanted || wanted.sold) return NextResponse.json({ error: 'Игрушка уже продана' }, { status: 400 })
  if (!offered || offered.sold) return NextResponse.json({ error: 'Твоя игрушка уже продана' }, { status: 400 })
  if (wanted.user_id === requesterId) return NextResponse.json({ error: 'Нельзя меняться с самим собой' }, { status: 400 })

  const { data, error } = await supabase
    .from('swap_requests')
    .insert({ listing_id: listingId, offered_listing_id: offeredListingId, requester_id: requesterId, status: 'pending' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
