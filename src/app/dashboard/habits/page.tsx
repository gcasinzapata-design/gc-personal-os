// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Plus, Flame, Trash2 } from 'lucide-react'

const EMOJIS = ['✅','💪','📚','🧘','🏃','💧','🥗','😴','🎯','🔥','⭐','🌅','🌙','🧠','💰']
const TIMES = ['Mañana','Tarde','Noche','Cualquier momento']

export default function HabitsPage() {
  const [habits, setHabits] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', emoji: '✅', category: 'Personal', time_of_day: 'Mañana' })
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => { load() }, [])

  async function load() {
    const r = await fetch('/api/habits')
    const d = await r.json()
    setHabits(d.habits || [])
    setTodayLogs(d.todayLogs || [])
    setLoading(false)
  }

  async function addHabit() {
    if (!form.name.trim()) return
    const r = await fetch('/api/habits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await r.json()
    if (d.habit) { setHabits(p => [...p, d.habit]); setForm({ name: '', emoji: '✅', category: 'Personal', time_of_day: 'Mañana' }); setShowAdd(false) }
  }

  async function toggle(habit) {
    const done = todayLogs.includes(habit.id)
    if (done) {
      setTodayLogs(p => p.filter(id => id !== habit.id))
      await fetch('/api/habits', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ habitId: habit.id, date: today }) })
    } else {
      setTodayLogs(p => [...p, habit.id])
      await fetch('/api/habits', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ habitId: habit.id, date: today }) })
    }
  }

  const done = todayLogs.length, total = habits.length
  const pct = total > 0 ? Math.round(done / total * 100) : 0

  return (
    <div className="p-4 md:p-5 space-y-4 max-w-2xl mx-auto" style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Flame size={18} className="text-orange-400" /> Hábitos</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Hoy: {done}/{total} completados · {pct}%</p>
        </div>
        <button onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: 'var(--blue)' }}>
          <Plus size={14} /> Nuevo
        </button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="w-full h-2 rounded-full" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444' }} />
        </div>
      )}

      {showAdd && (
        <div className="card p-4 space-y-3">
          <div className="flex gap-2">
            <select value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
              className="px-3 py-2.5 rounded-xl text-lg"
              style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-1)' }}>
              {EMOJIS.map(e => <option key={e}>{e}</option>)}
            </select>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addHabit()}
              placeholder="Nombre del hábito..." autoFocus
              className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white"
              style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)' }} />
          </div>
          <div className="flex gap-2">
            <select value={form.time_of_day} onChange={e => setForm(f => ({ ...f, time_of_day: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-xl text-xs"
              style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-1)' }}>
              {TIMES.map(t => <option key={t}>{t}</option>)}
            </select>
            <button onClick={addHabit} className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: 'var(--blue)' }}>
              Agregar
            </button>
          </div>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-2xl mb-2">🌱</p>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>Sin hábitos todavía</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>Empieza con uno pequeño y concreto</p>
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map(habit => {
            const isDone = todayLogs.includes(habit.id)
            return (
              <div key={habit.id} className="card flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02]"
                onClick={() => toggle(habit)}>
                {isDone ? <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" /> : <Circle size={20} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDone ? 'line-through' : 'text-white'}`} style={{ color: isDone ? 'var(--text-3)' : undefined }}>
                    {habit.emoji} {habit.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>{habit.time_of_day} · {habit.category}</p>
                </div>
                {habit.streak > 0 && <span className="text-xs text-orange-400 flex-shrink-0">🔥 {habit.streak}d</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
