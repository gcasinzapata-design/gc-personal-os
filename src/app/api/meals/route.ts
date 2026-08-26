// @ts-nocheck
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { createServiceClient } from '@/lib/supabase'
import { callAI } from '@/lib/ai'

// GET /api/meals?date=YYYY-MM-DD  -> today's meals + totals
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const date = new URL(req.url).searchParams.get('date') || new Date().toISOString().slice(0,10)
  const sb = createServiceClient()
  const { data } = await sb.from('meal_logs').select('*').eq('user_id', session.user.id).eq('log_date', date).order('created_at')
  const meals = data || []
  const totals = meals.reduce((acc, m) => ({
    calories: acc.calories + (m.calories||0),
    protein_g: acc.protein_g + Number(m.protein_g||0),
    carbs_g: acc.carbs_g + Number(m.carbs_g||0),
    fat_g: acc.fat_g + Number(m.fat_g||0),
  }), { calories:0, protein_g:0, carbs_g:0, fat_g:0 })
  // Targets
  const targets = { calories: 2300, protein_g: 190, carbs_g: 215, fat_g: 67 }
  const remaining = {
    calories: Math.max(0, targets.calories - totals.calories),
    protein_g: Math.max(0, targets.protein_g - totals.protein_g),
    carbs_g: Math.max(0, targets.carbs_g - totals.carbs_g),
    fat_g: Math.max(0, targets.fat_g - totals.fat_g),
  }
  return NextResponse.json({ meals, totals, targets, remaining, date })
}

// POST /api/meals -> log a meal (AI estimates macros from description)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const body = await req.json()
  const { description, meal_time, date, calories, protein_g, carbs_g, fat_g } = body

  // If macros not provided, estimate with AI
  let macros = { calories: calories||0, protein_g: protein_g||0, carbs_g: carbs_g||0, fat_g: fat_g||0 }
  if (!calories && description) {
    try {
      const raw = await callAI(
        `Estima los macronutrientes de: "${description}". Responde SOLO JSON: {"calories":N,"protein_g":N,"carbs_g":N,"fat_g":N}`,
        'Eres un nutricionista experto. Estima macros de comidas peruanas y comunes. Responde SOLO JSON valido sin markdown.',
        200
      )
      const parsed = JSON.parse(raw.replace(/```json|```/g,'').trim())
      macros = { calories: parsed.calories||0, protein_g: parsed.protein_g||0, carbs_g: parsed.carbs_g||0, fat_g: parsed.fat_g||0 }
    } catch {}
  }

  const sb = createServiceClient()
  const { data, error } = await sb.from('meal_logs').insert({
    user_id: session.user.id,
    log_date: date || new Date().toISOString().slice(0,10),
    meal_time: meal_time || 'snack',
    description,
    ...macros,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ meal: data, macros })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const { id } = await req.json()
  await createServiceClient().from('meal_logs').delete().eq('id', id).eq('user_id', session.user.id)
  return NextResponse.json({ success: true })
}
