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
  const { data } = await sb.from('workout_logs').select('*').eq('user_id', session.user.id).gte('log_date', date).order('created_at', { ascending: false }).limit(10)
  return NextResponse.json({ workouts: data || [] })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const body = await req.json()
  const sb = createServiceClient()
  const { data, error } = await sb.from('workout_logs').insert({
    user_id: session.user.id,
    log_date: body.date || new Date().toISOString().slice(0,10),
    workout_type: body.workout_type,
    duration_min: body.duration_min,
    intensity: body.intensity || 3,
    exercises: body.exercises || null,
    notes: body.notes,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ workout: data })
}
