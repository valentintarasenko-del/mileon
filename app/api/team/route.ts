import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/team — все участники команды
export async function GET() {
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/team — добавить участника
export async function POST(req: NextRequest) {
  const { name, imageUrl } = await req.json()
  if (!name || !imageUrl) {
    return NextResponse.json({ error: 'name и imageUrl обязательны' }, { status: 400 })
  }

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('team_members')
    .insert({ name, image_url: imageUrl })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
