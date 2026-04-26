import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/listings — все объявления или только одного пользователя (?userId=xxx)
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  const supabase = createServerSupabase()

  let query = supabase
    .from('listings')
    .select('*, users(name, emoji)')
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/listings — создать объявление
export async function POST(req: NextRequest) {
  const { userId, title, price, imageUrl } = await req.json()
  if (!userId || !title || !price || !imageUrl) {
    return NextResponse.json({ error: 'userId, title, price, imageUrl required' }, { status: 400 })
  }

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('listings')
    .insert({ user_id: userId, title, price, image_url: imageUrl, sold: false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
