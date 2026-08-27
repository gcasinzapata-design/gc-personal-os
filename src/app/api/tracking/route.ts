// @ts-nocheck
export const dynamic = 'force-dynamic'
// Habit + task compliance tracking — last 30 days
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const uid = session.user.id
  const sb = createServiceClient()

  // Last 30 days
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().slice(0, 10)
  })
  const from = days[0], to = days[29]

  const [habitsR, logsR, tasksR] = await Promise.all([
    sb.from('user_habits').select('id,name,emoji').eq('user_id', uid).eq('is_active', true).order('sort_order'),
    sb.from('user_habit_logs').select('habit_id,log_date').eq('user_id', uid).gte('log_date', from).lte('log_date', to),
    sb.from('user_tasks').select('id,title,last_completed_date,days_of_week,is_recurring').eq('user_id', uid).eq('is_recurring', true),
  ])

  const habits = habitsR.data || []
  const logs = logsR.data || []

  // Build habit grid: for each habit, which days were completed
  const habitStats = habits.map(h => {
    const doneDays = logs.filter(l => l.habit_id === h.id).map(l => l.log_date)
    const doneSet = new Set(doneDays)
    const total = days.length
    const done = doneDays.length
    
    // Streak: consecutive days from today backwards
    let streak = 0
    for (let i = 29; i >= 0; i--) {
      if (doneSet.has(days[i])) streak++
      else break
    }

    return {
      id: h.id,
      name: h.name,
      emoji: h.emoji,
      total,
      done,
      pct: Math.round((done / total) * 100),
      streak,
      grid: days.map(d => ({ date: d, done: doneSet.has(d) })),
    }
  })

  // Overall score per day
  const dailyScore = days.map(d => {
    const dayLogs = logs.filter(l => l.log_date === d)
    const pct = habits.length > 0 ? Math.round((dayLogs.length / habits.length) * 100) : 0
    return { date: d, done: dayLogs.length, total: habits.length, pct }
  })

  const overallPct = habitStats.length > 0
    ? Math.round(habitStats.reduce((s, h) => s + h.pct, 0) / habitStats.length)
    : 0

  return NextResponse.json({ habits: habitStats, dailyScore, days, overallPct })
}
