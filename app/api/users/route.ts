import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

// GET /api/users?id=xxx — получить пользователя по ID
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(data)
}

// POST /api/users — создать нового пользователя
export async function POST(req: NextRequest) {
  const { name, emoji } = await req.json()
  if (!name || !emoji) return NextResponse.json({ error: 'name and emoji required' }, { status: 400 })

  const id = randomBytes(16).toString('hex')
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('users')
    .insert({ id, name, emoji, coins: 500 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
