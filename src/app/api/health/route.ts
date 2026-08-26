// @ts-nocheck
export const dynamic = 'force-dynamic'
// Health metrics API — receives data from iOS Shortcut (no session, uses API token)
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// GET /api/health?date=YYYY-MM-DD&token=... -> today's metrics
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10)

  const sb = createServiceClient()

  // Validate token
  const { data: tokenRow } = await sb.from('api_tokens').select('user_id').eq('token', token || '').maybeSingle()
  if (!tokenRow) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

  const { data } = await sb.from('health_metrics').select('*').eq('user_id', tokenRow.user_id).eq('log_date', date).maybeSingle()
  return NextResponse.json({ metrics: data, date })
}

// POST /api/health -> upsert health metrics from Apple Health Shortcut
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { token, date, ...metrics } = body

  if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 401 })

  const sb = createServiceClient()

  // Validate token
  const { data: tokenRow } = await sb.from('api_tokens').select('user_id').eq('token', token).maybeSingle()
  if (!tokenRow) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

  const logDate = date || new Date().toISOString().slice(0, 10)

  const { data, error } = await sb.from('health_metrics').upsert({
    user_id: tokenRow.user_id,
    log_date: logDate,
    sleep_hours: metrics.sleep_hours ?? null,
    sleep_quality: metrics.sleep_quality ?? null,
    resting_hr: metrics.resting_hr ?? null,
    hrv_ms: metrics.hrv_ms ?? null,
    steps: metrics.steps ?? null,
    active_calories: metrics.active_calories ?? null,
    stand_hours: metrics.stand_hours ?? null,
    weight_kg: metrics.weight_kg ?? null,
    source: 'apple_health',
    synced_at: new Date().toISOString(),
  }, { onConflict: 'user_id,log_date' }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also update daily_checkin with sleep hours if provided
  if (metrics.sleep_hours) {
    await sb.from('daily_checkin').upsert({
      user_id: tokenRow.user_id,
      log_date: logDate,
      sleep_hours: metrics.sleep_hours,
    }, { onConflict: 'user_id,log_date' })
  }

  return NextResponse.json({ success: true, metrics: data, message: `Datos del ${logDate} sincronizados` })
}
