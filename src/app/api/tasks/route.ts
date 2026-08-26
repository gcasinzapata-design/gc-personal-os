// @ts-nocheck
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { createServiceClient } from '@/lib/supabase'

const TABLE = 'user_tasks'

// GET /api/tasks?day=1  (0=Dom..6=Sab) - filters recurring tasks for that day
// GET /api/tasks        - returns all tasks
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const dayParam = searchParams.get('day')
  const today = new Date().toISOString().slice(0, 10)
  const sb = createServiceClient()

  let query = sb.from(TABLE).select('*').eq('user_id', session.user.id)

  if (dayParam !== null) {
    const day = parseInt(dayParam)
    // Get: non-recurring tasks (personal todos) + recurring tasks for this day
    const { data: allTasks } = await query
    const tasks = (allTasks || []).filter(t => {
      if (!t.is_recurring) return true // always show personal todos
      if (!t.days_of_week) return false
      if (!t.days_of_week.includes(day)) return false
      // Recurring: show as pending if not completed today
      return t.last_completed_date !== today
    })
    return NextResponse.json({ tasks })
  }

  const { data } = await query.order('created_at', { ascending: false })
  return NextResponse.json({ tasks: data || [] })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const body = await req.json()
  const sb = createServiceClient()
  const { data, error } = await sb.from(TABLE).insert({
    user_id: session.user.id,
    title: body.title,
    category: body.category || 'Personal',
    priority: body.priority || 'medium',
    status: 'pending',
    notes: body.notes || null,
    due_date: body.due_date || null,
    is_recurring: body.is_recurring || false,
    days_of_week: body.days_of_week || null,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ task: data })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const body = await req.json()
  const sb = createServiceClient()
  const today = new Date().toISOString().slice(0, 10)
  const updates: any = {}
  if (body.status !== undefined) updates.status = body.status
  if (body.title !== undefined) updates.title = body.title
  if (body.priority !== undefined) updates.priority = body.priority
  if (body.notes !== undefined) updates.notes = body.notes
  if (body.status === 'done') {
    updates.completed_at = new Date().toISOString()
    updates.last_completed_date = today
  }
  if (body.status === 'pending') {
    updates.completed_at = null
    updates.last_completed_date = null
  }
  const { data, error } = await sb.from(TABLE).update(updates)
    .eq('id', body.id).eq('user_id', session.user.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ task: data })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const { id } = await req.json()
  await createServiceClient().from(TABLE).delete().eq('id', id).eq('user_id', session.user.id)
  return NextResponse.json({ success: true })
}
