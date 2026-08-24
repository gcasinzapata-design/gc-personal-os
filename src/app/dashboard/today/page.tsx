// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Plus, Flame, Target, TrendingDown, Brain, ChevronRight, Sun, Sunset, Moon } from 'lucide-react'
import Link from 'next/link'

const S = (n) => `S/ ${new Intl.NumberFormat('es-PE',{minimumFractionDigits:0}).format(Math.round(n)||0)}`

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return { text: 'Buenos días', icon: Sun, color: '#fbbf24' }
  if (h < 19) return { text: 'Buenas tardes', icon: Sunset, color: '#f97316' }
  return { text: 'Buenas noches', icon: Moon, color: '#8b5cf6' }
}

export default function TodayPage() {
  const [tasks, setTasks] = useState([])
  const [habits, setHabits] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState('')
  const [addingTask, setAddingTask] = useState(false)
  const greeting = getGreeting()
  const GreetIcon = greeting.icon
  const today = new Date().toISOString().slice(0, 10)
  const dayName = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })

  useEffect(() => {
    Promise.all([
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/habits').then(r => r.json()),
      fetch('/api/analytics').then(r => r.json()),
    ]).then(([t, h, a]) => {
      setTasks(t.tasks || [])
      setHabits(h.habits || [])
      setTodayLogs(h.todayLogs || [])
      setAnalytics(a)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const currMonth = analytics?.snapshots?.slice(-1)[0] || {}
  const pendingTasks = tasks.filter(t => t.status !== 'done' && !t.completed_at)
  const doneTasks = tasks.filter(t => t.status === 'done' || t.completed_at)
  const todayHabits = habits.filter(h => h.is_active)
  const completedHabits = todayLogs.length
  const habitPct = todayHabits.length > 0 ? Math.round(completedHabits / todayHabits.length * 100) : 0

  async function toggleTask(task) {
    const done = task.status !== 'done'
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: done ? 'done' : 'pending' } : t))
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, status: done ? 'done' : 'pending' })
    })
  }

  async function toggleHabit(habit) {
    const done = todayLogs.includes(habit.id)
    if (done) {
      setTodayLogs(prev => prev.filter(id => id !== habit.id))
      await fetch('/api/habits', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ habitId: habit.id, date: today }) })
    } else {
      setTodayLogs(prev => [...prev, habit.id])
      await fetch('/api/habits', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ habitId: habit.id, date: today }) })
    }
  }

  async function addTask() {
    if (!newTask.trim()) return
    setAddingTask(true)
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTask.trim(), priority: 'medium' })
    })
    const data = await res.json()
    if (data.task) setTasks(prev => [data.task, ...prev])
    setNewTask('')
    setAddingTask(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-base)' }}>
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-4 md:p-5 space-y-5 max-w-2xl mx-auto" style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>

      {/* Greeting */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${greeting.color}20` }}>
          <GreetIcon size={18} style={{ color: greeting.color }} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">{greeting.text}, Gian</h1>
          <p className="text-xs capitalize" style={{ color: 'var(--text-3)' }}>{dayName}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>Tareas hoy</p>
          <p className="text-2xl font-bold text-white">{pendingTasks.length}</p>
          <p className="text-xs" style={{ color: '#22c55e' }}>{doneTasks.length} hechas</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>Hábitos</p>
          <p className="text-2xl font-bold" style={{ color: habitPct >= 80 ? '#22c55e' : habitPct >= 50 ? '#f59e0b' : '#ef4444' }}>
            {habitPct}%
          </p>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>{completedHabits}/{todayHabits.length} completos</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>Gasto mes</p>
          <p className="text-lg font-bold text-white num">{S(currMonth.totalGastos || 0)}</p>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>de {S(currMonth.totalIngresos || 0)}</p>
        </div>
      </div>

      {/* Tasks */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Target size={14} className="text-blue-400" /> Tareas pendientes
          </h2>
          <Link href="/dashboard/tasks" className="text-xs" style={{ color: 'var(--blue)' }}>Ver todas</Link>
        </div>
        {/* Add task */}
        <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
          <Plus size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <input
            value={newTask} onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="Nueva tarea... (Enter)"
            className="flex-1 text-sm bg-transparent text-white outline-none"
            style={{ caretColor: 'var(--blue)' }} />
          {newTask && (
            <button onClick={addTask} disabled={addingTask}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ background: 'var(--blue)', color: '#fff' }}>
              Agregar
            </button>
          )}
        </div>
        {/* Task list */}
        <div className="divide-y max-h-72 overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
          {pendingTasks.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-2xl mb-1">✅</p>
              <p className="text-sm" style={{ color: 'var(--text-3)' }}>Todo al día</p>
            </div>
          ) : pendingTasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] cursor-pointer"
              onClick={() => toggleTask(task)}>
              <Circle size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{task.title}</p>
                {task.category && <p className="text-xs" style={{ color: 'var(--text-3)' }}>{task.category}</p>}
              </div>
              {task.priority === 'high' && (
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>🔴</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Habits */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Flame size={14} className="text-orange-400" /> Hábitos de hoy
          </h2>
          <Link href="/dashboard/habits" className="text-xs" style={{ color: 'var(--blue)' }}>Gestionar</Link>
        </div>
        {todayHabits.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>Sin hábitos configurados aún</p>
            <Link href="/dashboard/habits" className="text-xs mt-1 block" style={{ color: 'var(--blue)' }}>Agregar hábitos →</Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {todayHabits.map(habit => {
              const done = todayLogs.includes(habit.id)
              return (
                <div key={habit.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02]"
                  onClick={() => toggleHabit(habit)}>
                  {done
                    ? <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
                    : <Circle size={18} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                  }
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${done ? 'line-through' : 'text-white'}`}
                      style={{ color: done ? 'var(--text-3)' : 'inherit' }}>
                      {habit.emoji} {habit.name}
                    </p>
                    {habit.streak > 0 && (
                      <p className="text-xs text-orange-400">🔥 {habit.streak} días seguidos</p>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>{habit.time_of_day || ''}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Finance quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard" className="card p-3 flex items-center gap-2 hover:bg-white/[0.03]">
          <TrendingDown size={14} className="text-red-400" />
          <div>
            <p className="text-xs font-medium text-white">Finanzas</p>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>Dashboard</p>
          </div>
          <ChevronRight size={12} className="ml-auto" style={{ color: 'var(--text-3)' }} />
        </Link>
        <Link href="/dashboard/chat" className="card p-3 flex items-center gap-2 hover:bg-white/[0.03]">
          <Brain size={14} className="text-purple-400" />
          <div>
            <p className="text-xs font-medium text-white">Copiloto</p>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>Pregunta algo</p>
          </div>
          <ChevronRight size={12} className="ml-auto" style={{ color: 'var(--text-3)' }} />
        </Link>
      </div>
    </div>
  )
}
