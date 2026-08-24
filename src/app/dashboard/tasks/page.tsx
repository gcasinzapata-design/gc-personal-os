// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Plus, Trash2, Flag, X } from 'lucide-react'

const PRIORITIES = { high: { l: '🔴 Alta', c: '#ef4444' }, medium: { l: '🟡 Media', c: '#f59e0b' }, low: { l: '🟢 Baja', c: '#22c55e' } }
const CATS = ['Work', 'Business', 'Personal', 'Salud', 'Finanzas', 'Aprendizaje', 'Hogar', 'Otro']

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Personal')
  const [priority, setPriority] = useState('medium')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const r = await fetch('/api/tasks')
    const d = await r.json()
    setTasks(d.tasks || [])
    setLoading(false)
  }

  async function addTask() {
    if (!title.trim()) return
    const r = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, category, priority }) })
    const d = await r.json()
    if (d.task) { setTasks(p => [d.task, ...p]); setTitle(''); setShowAdd(false) }
  }

  async function toggle(task) {
    const done = task.status !== 'done'
    setTasks(p => p.map(t => t.id === task.id ? { ...t, status: done ? 'done' : 'pending' } : t))
    await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: task.id, status: done ? 'done' : 'pending' }) })
  }

  async function del(id) {
    setTasks(p => p.filter(t => t.id !== id))
    await fetch('/api/tasks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
  }

  const filtered = tasks.filter(t => filter === 'all' ? true : filter === 'done' ? t.status === 'done' : t.status !== 'done')

  return (
    <div className="p-4 md:p-5 space-y-4 max-w-2xl mx-auto" style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Tareas</h1>
        <button onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: 'var(--blue)' }}>
          <Plus size={14} /> Nueva
        </button>
      </div>

      {showAdd && (
        <div className="card p-4 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="Descripción de la tarea..." autoFocus
            className="w-full px-3 py-2.5 rounded-xl text-sm text-white"
            style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)' }} />
          <div className="flex gap-2 flex-wrap">
            <select value={priority} onChange={e => setPriority(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs"
              style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-1)' }}>
              {Object.entries(PRIORITIES).map(([v, { l }]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs flex-1"
              style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-1)' }}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <button onClick={addTask} className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: 'var(--blue)' }}>
              Agregar
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-card)' }}>
        {[{ v: 'pending', l: `Pendientes (${tasks.filter(t => t.status !== 'done').length})` }, { v: 'done', l: `Hechas (${tasks.filter(t => t.status === 'done').length})` }, { v: 'all', l: 'Todas' }].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className="flex-1 py-2 text-xs font-medium rounded-xl"
            style={{ background: filter === f.v ? 'var(--blue)' : 'transparent', color: filter === f.v ? '#fff' : 'var(--text-3)' }}>
            {f.l}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="card p-8 text-center"><p className="text-2xl mb-2">🎉</p><p className="text-sm" style={{ color: 'var(--text-3)' }}>Sin tareas en esta vista</p></div>
        ) : filtered.map(task => (
          <div key={task.id} className="card flex items-center gap-3 px-4 py-3" style={{ opacity: task.status === 'done' ? 0.6 : 1 }}>
            <button onClick={() => toggle(task)} className="flex-shrink-0">
              {task.status === 'done' ? <CheckCircle2 size={18} className="text-green-400" /> : <Circle size={18} style={{ color: 'var(--text-3)' }} />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through' : 'text-white'}`} style={{ color: task.status === 'done' ? 'var(--text-3)' : undefined }}>
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {task.category && <span className="text-xs" style={{ color: 'var(--text-3)' }}>{task.category}</span>}
                {task.priority && <span className="text-xs font-medium" style={{ color: PRIORITIES[task.priority]?.c }}>{PRIORITIES[task.priority]?.l}</span>}
              </div>
            </div>
            <button onClick={() => del(task.id)} className="p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0">
              <Trash2 size={12} style={{ color: 'var(--text-3)' }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
