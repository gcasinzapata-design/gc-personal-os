// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2, Flame, Beef, Wheat, Droplets } from 'lucide-react'

const MEALS = ['desayuno','almuerzo','cena','snack','pre-entreno','post-entreno']
const TARGETS = { calories: 2300, protein_g: 190, carbs_g: 215, fat_g: 67 }

const QUICK_FOODS = [
  { d: '1 scoop ISO100 + 250ml agua', cal: 130, p: 25, c: 2, f: 0.5, t: 'post-entreno' },
  { d: '3 huevos revueltos + 2 tostadas', cal: 380, p: 22, c: 30, f: 18, t: 'desayuno' },
  { d: 'Arroz con pollo (1 plato)', cal: 520, p: 35, c: 60, f: 8, t: 'almuerzo' },
  { d: 'Quinua con verduras (1 tazón)', cal: 320, p: 12, c: 55, f: 5, t: 'almuerzo' },
  { d: 'Pechuga a la plancha 200g', cal: 220, p: 42, c: 0, f: 4, t: 'almuerzo' },
  { d: 'Avena con leche + plátano', cal: 350, p: 12, c: 62, f: 6, t: 'desayuno' },
  { d: 'Lomo saltado (1 plato)', cal: 580, p: 30, c: 55, f: 20, t: 'almuerzo' },
  { d: 'Ensalada con atún', cal: 280, p: 28, c: 10, f: 12, t: 'cena' },
  { d: '1 plátano', cal: 90, p: 1, c: 23, f: 0, t: 'snack' },
  { d: 'Yogur griego 200g', cal: 130, p: 17, c: 8, f: 3, t: 'snack' },
]

function MacroBar({ label, value, target, color, unit = 'g' }) {
  const pct = Math.min(100, Math.round((value / target) * 100))
  const over = value > target
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span style={{ color: 'var(--text-3)' }}>{label}</span>
        <span className={over ? 'text-orange-400 font-bold' : 'text-white font-medium'}>
          {Math.round(value)}/{target}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: over ? '#f97316' : color }} />
      </div>
    </div>
  )
}

export default function NutricionPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [data, setData] = useState({ meals: [], totals: { calories:0, protein_g:0, carbs_g:0, fat_g:0 }, remaining: TARGETS })
  const [desc, setDesc] = useState('')
  const [mealTime, setMealTime] = useState('almuerzo')
  const [adding, setAdding] = useState(false)
  const [checkin, setCheckin] = useState({ energy_level: 3, stress_level: 2, sleep_hours: 7 })
  const [savingCheckin, setSavingCheckin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const r = await fetch(`/api/meals?date=${today}`)
    const d = await r.json()
    setData(d)
    const cr = await fetch(`/api/checkin?date=${today}`)
    const cd = await cr.json()
    if (cd.checkin) setCheckin(cd.checkin)
    setLoading(false)
  }

  async function addMeal(food = null) {
    const description = food ? food.d : desc.trim()
    if (!description) return
    setAdding(true)
    await fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description, meal_time: food?.t || mealTime, date: today,
        ...(food ? { calories: food.cal, protein_g: food.p, carbs_g: food.c, fat_g: food.f } : {})
      })
    })
    setDesc('')
    await load()
    setAdding(false)
  }

  async function deleteMeal(id) {
    await fetch('/api/meals', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    await load()
  }

  async function saveCheckin() {
    setSavingCheckin(true)
    await fetch('/api/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...checkin, date: today }) })
    setSavingCheckin(false)
  }

  const { totals } = data
  const calPct = Math.min(100, Math.round((totals.calories / TARGETS.calories) * 100))

  return (
    <div className="p-4 md:p-5 space-y-4 max-w-2xl mx-auto" style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Flame size={20} className="text-orange-400" /> Nutrición
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
          Target: 2,300 kcal · 190g proteína · 215g carbs · 67g grasa
        </p>
      </div>

      {/* Calorie ring + macros */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-4">
          {/* Calorie circle */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke={calPct >= 100 ? '#f97316' : '#3b82f6'} strokeWidth="3"
                strokeDasharray={`${calPct} ${100 - calPct}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold text-white num">{totals.calories}</span>
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>kcal</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <MacroBar label="Proteína" value={totals.protein_g} target={TARGETS.protein_g} color="#ef4444" />
            <MacroBar label="Carbos" value={totals.carbs_g} target={TARGETS.carbs_g} color="#f59e0b" />
            <MacroBar label="Grasa" value={totals.fat_g} target={TARGETS.fat_g} color="#8b5cf6" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { l: 'Faltan kcal', v: Math.max(0, TARGETS.calories - totals.calories), c: '#3b82f6' },
            { l: 'Faltan prot.', v: `${Math.max(0, Math.round(TARGETS.protein_g - totals.protein_g))}g`, c: '#ef4444' },
            { l: 'Progreso', v: `${calPct}%`, c: calPct >= 90 ? '#22c55e' : '#f59e0b' },
          ].map((k, i) => (
            <div key={i} className="text-center p-2 rounded-xl" style={{ background: 'var(--bg-card2)' }}>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>{k.l}</p>
              <p className="text-sm font-bold num" style={{ color: k.c }}>{k.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add meal */}
      <div className="card p-4 space-y-3">
        <p className="text-sm font-semibold text-white flex items-center gap-2">
          <Plus size={14} /> Registrar comida
        </p>
        <div className="flex gap-2">
          <select value={mealTime} onChange={e => setMealTime(e.target.value)}
            className="px-2 py-2 rounded-xl text-xs flex-shrink-0"
            style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-1)' }}>
            {MEALS.map(m => <option key={m}>{m}</option>)}
          </select>
          <input value={desc} onChange={e => setDesc(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMeal()}
            placeholder="Ej: 2 huevos, arroz con pollo, proteína..."
            className="flex-1 px-3 py-2 rounded-xl text-sm text-white"
            style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)' }} />
          <button onClick={() => addMeal()} disabled={adding || !desc.trim()}
            className="px-3 py-2 rounded-xl text-sm font-semibold text-white flex-shrink-0 flex items-center gap-1"
            style={{ background: adding || !desc.trim() ? 'var(--border)' : '#059669' }}>
            {adding ? <Loader2 size={12} className="animate-spin" /> : 'Add'}
          </button>
        </div>
        {/* Quick add buttons */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_FOODS.map((f, i) => (
            <button key={i} onClick={() => addMeal(f)}
              className="text-xs px-2 py-1 rounded-lg hover:opacity-80"
              style={{ background: 'var(--bg-card2)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
              {f.d.split(' ').slice(0, 4).join(' ')}
            </button>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
          La IA estima los macros automaticamente si no los escribes
        </p>
      </div>

      {/* Meal list */}
      {data.meals.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm font-semibold text-white">Comidas de hoy</p>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {data.meals.map(m => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{m.description}</p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {m.meal_time} · {m.calories} kcal · {Math.round(m.protein_g)}g P · {Math.round(m.carbs_g)}g C · {Math.round(m.fat_g)}g G
                  </p>
                </div>
                <button onClick={() => deleteMeal(m.id)} className="p-1 hover:bg-white/10 rounded flex-shrink-0">
                  <Trash2 size={12} style={{ color: 'var(--text-3)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily check-in */}
      <div className="card p-4 space-y-3">
        <p className="text-sm font-semibold text-white">Como estas hoy</p>
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>El Coach adapta el entrenamiento segun esto</p>
        {[
          { key: 'energy_level', label: 'Energia', emoji: ['😴','😑','😐','😊','🔥'] },
          { key: 'stress_level', label: 'Estres', emoji: ['😌','🙂','😐','😤','🤯'] },
        ].map(field => (
          <div key={field.key}>
            <p className="text-xs mb-1.5" style={{ color: 'var(--text-3)' }}>{field.label}: {field.emoji[checkin[field.key]-1]}</p>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(v => (
                <button key={v} onClick={() => setCheckin(c => ({ ...c, [field.key]: v }))}
                  className="flex-1 py-2 rounded-xl text-xs font-bold"
                  style={{ background: checkin[field.key] === v ? 'var(--blue)' : 'var(--bg-card2)', color: checkin[field.key] === v ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)' }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div>
          <p className="text-xs mb-1.5" style={{ color: 'var(--text-3)' }}>Horas de sueno anoche</p>
          <div className="flex gap-2">
            {[5,6,6.5,7,7.5,8,9].map(v => (
              <button key={v} onClick={() => setCheckin(c => ({ ...c, sleep_hours: v }))}
                className="flex-1 py-1.5 rounded-xl text-xs"
                style={{ background: checkin.sleep_hours === v ? 'var(--blue)' : 'var(--bg-card2)', color: checkin.sleep_hours === v ? '#fff' : 'var(--text-2)', border: '1px solid var(--border)' }}>
                {v}h
              </button>
            ))}
          </div>
        </div>
        <button onClick={saveCheckin} disabled={savingCheckin}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#059669' }}>
          {savingCheckin ? 'Guardando...' : 'Guardar check-in'}
        </button>
      </div>
    </div>
  )
}
