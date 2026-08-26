// @ts-nocheck
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const date = new URL(req.url).searchParams.get('date') || new Date().toISOString().slice(0,10)
  const sb = createServiceClient()
  const { data } = await sb.from('daily_checkin').select('*').eq('user_id', session.user.id).eq('log_date', date).maybeSingle()
  return NextResponse.json({ checkin: data })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const body = await req.json()
  const sb = createServiceClient()
  const { data, error } = await sb.from('daily_checkin').upsert({
    user_id: session.user.id,
    log_date: body.date || new Date().toISOString().slice(0,10),
    energy_level: body.energy_level,
    stress_level: body.stress_level,
    sleep_hours: body.sleep_hours,
    mood: body.mood,
    notes: body.notes,
  }, { onConflict: 'user_id,log_date' }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ checkin: data })
}
