// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { Flame, TrendingUp, Award, Calendar } from 'lucide-react'

const WEEK = ['D','L','M','X','J','V','S']

function HeatmapRow({ habit, grid }) {
  const today = new Date().toISOString().slice(0,10)
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="text-base flex-shrink-0 w-6 text-center">{habit.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-white truncate">{habit.name}</p>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {habit.streak > 0 && (
              <span className="text-xs text-orange-400 flex items-center gap-0.5">
                🔥{habit.streak}d
              </span>
            )}
            <span className="text-xs font-bold" style={{
              color: habit.pct >= 80 ? '#22c55e' : habit.pct >= 50 ? '#f59e0b' : '#ef4444'
            }}>{habit.pct}%</span>
          </div>
        </div>
        {/* Heatmap grid - last 30 days as dots */}
        <div className="flex gap-0.5 flex-wrap">
          {grid.slice(-28).map((g, i) => (
            <div key={i}
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{
                background: g.done ? '#22c55e' : g.date === today ? 'rgba(59,130,246,0.3)' : 'var(--border)',
                opacity: g.date > today ? 0.2 : 1
              }}
              title={`${g.date}: ${g.done ? '✅' : '—'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TrackingPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'habits'|'week'>('habits')

  useEffect(() => {
    fetch('/api/tracking').then(r=>r.json()).then(d=>{setData(d);setLoading(false)})
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64" style={{background:'var(--bg-base)'}}>
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  const { habits, dailyScore, overallPct } = data

  // Last 7 days for week view
  const last7 = dailyScore.slice(-7)
  const topHabit = [...habits].sort((a,b)=>b.pct-a.pct)[0]
  const needsWork = [...habits].sort((a,b)=>a.pct-b.pct)[0]
  const bestStreak = Math.max(...habits.map(h=>h.streak), 0)

  return (
    <div className="p-4 md:p-5 space-y-4 max-w-2xl mx-auto" style={{background:'var(--bg-base)',minHeight:'100vh',paddingBottom:'6rem'}}>

      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp size={20} className="text-green-400"/> Tracking
        </h1>
        <p className="text-xs mt-0.5" style={{color:'var(--text-3)'}}>Cumplimiento últimos 30 días</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="card p-3 text-center">
          <Award size={16} className="mx-auto mb-1 text-yellow-400"/>
          <p className="text-2xl font-bold num" style={{color: overallPct>=70?'#22c55e':overallPct>=50?'#f59e0b':'#ef4444'}}>
            {overallPct}%
          </p>
          <p className="text-xs mt-0.5" style={{color:'var(--text-3)'}}>Promedio global</p>
        </div>
        <div className="card p-3 text-center">
          <Flame size={16} className="mx-auto mb-1 text-orange-400"/>
          <p className="text-2xl font-bold num text-white">{bestStreak}</p>
          <p className="text-xs mt-0.5" style={{color:'var(--text-3)'}}>Mejor racha</p>
        </div>
        <div className="card p-3 text-center">
          <Calendar size={16} className="mx-auto mb-1 text-blue-400"/>
          <p className="text-2xl font-bold num text-white">
            {dailyScore.filter(d=>d.pct>=80).length}
          </p>
          <p className="text-xs mt-0.5" style={{color:'var(--text-3)'}}>Días ≥80%</p>
        </div>
      </div>

      {/* This week bar chart */}
      <div className="card p-4">
        <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Calendar size={13} className="text-blue-400"/> Esta semana
        </p>
        <div className="flex items-end gap-2 h-16">
          {last7.map((d, i) => {
            const day = new Date(d.date)
            const isToday = d.date === new Date().toISOString().slice(0,10)
            const height = Math.max(4, (d.pct / 100) * 56)
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg transition-all" style={{
                  height: `${height}px`,
                  background: isToday ? '#3b82f6' : d.pct >= 80 ? '#22c55e' : d.pct >= 50 ? '#f59e0b' : '#ef4444',
                  opacity: isToday ? 1 : 0.8,
                  minHeight: '4px'
                }}/>
                <p className="text-xs font-medium" style={{color: isToday?'#3b82f6':'var(--text-3)'}}>
                  {WEEK[day.getDay()]}
                </p>
                <p className="text-xs" style={{color:'var(--text-3)'}}>{d.pct}%</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Highlights */}
      {topHabit && (
        <div className="grid grid-cols-2 gap-2.5">
          <div className="card p-3" style={{borderLeft:'2px solid #22c55e'}}>
            <p className="text-xs font-medium text-green-400 mb-1">💪 Más consistente</p>
            <p className="text-sm font-semibold text-white">{topHabit.emoji} {topHabit.name}</p>
            <p className="text-xs" style={{color:'var(--text-3)'}}>{topHabit.done}/30 días · {topHabit.pct}%</p>
          </div>
          {needsWork && needsWork.pct < 70 && (
            <div className="card p-3" style={{borderLeft:'2px solid #f59e0b'}}>
              <p className="text-xs font-medium text-yellow-400 mb-1">⚠️ Mejorar aquí</p>
              <p className="text-sm font-semibold text-white">{needsWork.emoji} {needsWork.name}</p>
              <p className="text-xs" style={{color:'var(--text-3)'}}>{needsWork.done}/30 días · {needsWork.pct}%</p>
            </div>
          )}
        </div>
      )}

      {/* Heatmap por hábito */}
      <div className="card overflow-hidden">
        <div className="px-4 py-2.5 border-b" style={{borderColor:'var(--border)'}}>
          <p className="text-sm font-semibold text-white">Hábitos — últimos 28 días</p>
          <p className="text-xs mt-0.5" style={{color:'var(--text-3)'}}>🟩 Cumplido &nbsp;⬜ Pendiente</p>
        </div>
        <div className="px-4 py-2 divide-y" style={{borderColor:'var(--border)'}}>
          {habits.map(h => (
            <HeatmapRow key={h.id} habit={h} grid={h.grid}/>
          ))}
        </div>
      </div>

    </div>
  )
}
