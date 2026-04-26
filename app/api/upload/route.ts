import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// POST /api/upload — загружает фото в Supabase Storage, возвращает публичный URL
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const userId = formData.get('userId') as string | null

  if (!file || !userId) {
    return NextResponse.json({ error: 'file and userId required' }, { status: 400 })
  }

  // Уникальное имя файла: userId/timestamp.ext
  const ext = file.name.split('.').pop() || 'jpg'
  const fileName = `${userId}/${Date.now()}.${ext}`

  const supabase = createServerSupabase()
  const arrayBuffer = await file.arrayBuffer()

  const { error } = await supabase.storage
    .from('toys')
    .upload(fileName, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Получаем публичный URL
  const { data } = supabase.storage.from('toys').getPublicUrl(fileName)
  return NextResponse.json({ url: data.publicUrl }, { status: 201 })
}
