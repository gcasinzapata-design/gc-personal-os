// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Plus, Flame, TrendingDown, Brain, ChevronRight, Sun, Sunset, Moon, Home, Dumbbell } from 'lucide-react'
import Link from 'next/link'

const S = (n) => `S/ ${new Intl.NumberFormat('es-PE',{minimumFractionDigits:0}).format(Math.round(n)||0)}`

const DAY_NAMES = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado']
const DAY_PLANS = {
  1: { label:'Empuje 💪', type:'gym' }, 2: { label:'Tiron + Natacion 🏊', type:'gym' },
  3: { label:'Piernas + Core 🦵', type:'gym' }, 4: { label:'Cardio + Movilidad 🏃', type:'cardio' },
  5: { label:'Funcional ⚡', type:'gym' }, 6: { label:'Descanso activo 🧘', type:'rest' },
  0: { label:'Futbol ⚽', type:'sport' }
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return { text:'Buenos dias', icon: Sun, color:'#fbbf24' }
  if (h < 19) return { text:'Buenas tardes', icon: Sunset, color:'#f97316' }
  return { text:'Buenas noches', icon: Moon, color:'#8b5cf6' }
}

export default function TodayPage() {
  const today = new Date()
  const todayDay = today.getDay()
  const todayStr = today.toISOString().slice(0,10)
  const dayName = today.toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long'})
  const greeting = getGreeting()
  const GreetIcon = greeting.icon
  const plan = DAY_PLANS[todayDay]

  const [personalTasks, setPersonalTasks] = useState([])
  const [homeTasks, setHomeTasks]     = useState([])
  const [habits, setHabits]           = useState([])
  const [todayLogs, setTodayLogs]     = useState([])
  const [nutrition, setNutrition]     = useState({ calories:0, protein_g:0 })
  const [analytics, setAnalytics]     = useState(null)
  const [loading, setLoading]         = useState(true)
  const [newTask, setNewTask]         = useState('')
  const [adding, setAdding]           = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const [taskRes, habitRes, mealRes, analyticsRes] = await Promise.all([
      fetch(`/api/tasks?day=${todayDay}`).then(r=>r.json()),
      fetch('/api/habits').then(r=>r.json()),
      fetch(`/api/meals?date=${todayStr}`).then(r=>r.json()),
      fetch('/api/analytics').then(r=>r.json()),
    ])

    const allTasks = taskRes.tasks || []
    setPersonalTasks(allTasks.filter(t => !t.is_recurring))
    setHomeTasks(allTasks.filter(t => t.is_recurring))
    setHabits(habitRes.habits || [])
    setTodayLogs(habitRes.todayLogs || [])
    setNutrition(mealRes.totals || { calories:0, protein_g:0 })
    setAnalytics(analyticsRes)
    setLoading(false)
  }

  async function toggleTask(task) {
    const done = task.status !== 'done' && task.last_completed_date !== todayStr
    const newStatus = done ? 'done' : 'pending'
    // Optimistic update
    const update = t => t.id === task.id ? { ...t, status: newStatus, last_completed_date: done ? todayStr : null } : t
    if (task.is_recurring) setHomeTasks(p=>p.map(update))
    else setPersonalTasks(p=>p.map(update))
    await fetch('/api/tasks', {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id: task.id, status: newStatus })
    })
  }

  async function toggleHabit(habit) {
    const done = todayLogs.includes(habit.id)
    if (done) {
      setTodayLogs(p=>p.filter(id=>id!==habit.id))
      await fetch('/api/habits',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({habitId:habit.id,date:todayStr})})
    } else {
      setTodayLogs(p=>[...p,habit.id])
      await fetch('/api/habits',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({habitId:habit.id,date:todayStr})})
    }
  }

  async function addTask() {
    if (!newTask.trim()) return
    setAdding(true)
    const r = await fetch('/api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:newTask.trim(),priority:'medium'})})
    const d = await r.json()
    if (d.task) setPersonalTasks(p=>[d.task,...p])
    setNewTask(''); setAdding(false)
  }

  const doneTasks = [...personalTasks,...homeTasks].filter(t=>t.status==='done'||t.last_completed_date===todayStr).length
  const totalTasks = personalTasks.length + homeTasks.length
  const doneHabits = todayLogs.length
  const totalHabits = habits.length
  const calPct = Math.round((nutrition.calories/2300)*100)
  const currMonth = analytics?.snapshots?.slice(-1)[0] || {}

  if (loading) return <div className="flex items-center justify-center h-screen" style={{background:'var(--bg-base)'}}><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/></div>

  return (
    <div className="p-4 md:p-5 space-y-4 max-w-2xl mx-auto" style={{background:'var(--bg-base)',minHeight:'100vh',paddingBottom:'6rem'}}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background:`${greeting.color}20`}}>
          <GreetIcon size={18} style={{color:greeting.color}}/>
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">{greeting.text}, Gian</h1>
          <p className="text-xs capitalize" style={{color:'var(--text-3)'}}>{dayName}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          {l:'Tareas',v:`${doneTasks}/${totalTasks}`,c:doneTasks===totalTasks&&totalTasks>0?'#22c55e':'#94a3b8'},
          {l:'Habitos',v:`${doneHabits}/${totalHabits}`,c:doneHabits===totalHabits&&totalHabits>0?'#22c55e':doneHabits/totalHabits>0.5?'#f59e0b':'#94a3b8'},
          {l:'Calorias',v:`${calPct}%`,c:calPct>=90?'#22c55e':calPct>=50?'#f59e0b':'#3b82f6'},
          {l:'Gasto mes',v:S(currMonth.totalGastos||0).replace('S/ ','S/'),c:'#94a3b8'},
        ].map((k,i)=>(
          <div key={i} className="card p-2.5 text-center">
            <p className="text-xs" style={{color:'var(--text-3)'}}>{k.l}</p>
            <p className="text-sm font-bold num mt-0.5" style={{color:k.c}}>{k.v}</p>
          </div>
        ))}
      </div>

      {/* Entrenamiento del dia */}
      <Link href="/dashboard/entrenamiento" className="card p-3.5 flex items-center gap-3 hover:bg-white/[0.03] block">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(59,130,246,0.15)'}}>
          <Dumbbell size={16} className="text-blue-400"/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium" style={{color:'var(--text-3)'}}>Entrenamiento de hoy</p>
          <p className="text-sm font-semibold text-white">{plan.label}</p>
        </div>
        <ChevronRight size={14} style={{color:'var(--text-3)'}}/>
      </Link>

      {/* Habitos */}
      <div className="card overflow-hidden">
        <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{borderColor:'var(--border)'}}>
          <h2 className="text-sm font-semibold text-white flex items-center gap-1.5"><Flame size={13} className="text-orange-400"/>Habitos de hoy</h2>
          <span className="text-xs" style={{color:'var(--text-3)'}}>{doneHabits}/{totalHabits}</span>
        </div>
        <div className="divide-y" style={{borderColor:'var(--border)'}}>
          {habits.map(h=>{
            const done=todayLogs.includes(h.id)
            return (
              <div key={h.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/[0.02]"
                onClick={()=>toggleHabit(h)}>
                {done?<CheckCircle2 size={16} className="text-green-400 flex-shrink-0"/>:<Circle size={16} style={{color:'var(--text-3)',flexShrink:0}}/>}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${done?'line-through':'font-medium text-white'}`} style={{color:done?'var(--text-3)':undefined}}>
                    {h.emoji} {h.name}
                  </p>
                </div>
                <p className="text-xs flex-shrink-0" style={{color:'var(--text-3)'}}>{h.time_of_day}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tareas del hogar HOY */}
      {homeTasks.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{borderColor:'var(--border)'}}>
            <Home size={13} className="text-purple-400"/>
            <h2 className="text-sm font-semibold text-white">Hogar — hoy</h2>
            <span className="text-xs ml-auto" style={{color:'var(--text-3)'}}>
              {homeTasks.filter(t=>t.status==='done'||t.last_completed_date===todayStr).length}/{homeTasks.length}
            </span>
          </div>
          <div className="divide-y" style={{borderColor:'var(--border)'}}>
            {homeTasks.map(t=>{
              const done=t.status==='done'||t.last_completed_date===todayStr
              return (
                <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/[0.02]"
                  onClick={()=>toggleTask(t)} style={{opacity:done?0.5:1}}>
                  {done?<CheckCircle2 size={16} className="text-green-400 flex-shrink-0"/>:<Circle size={16} style={{color:'var(--text-3)',flexShrink:0}}/>}
                  <p className={`text-sm flex-1 ${done?'line-through':'text-white'}`} style={{color:done?'var(--text-3)':undefined}}>{t.title}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tareas personales */}
      <div className="card overflow-hidden">
        <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{borderColor:'var(--border)'}}>
          <h2 className="text-sm font-semibold text-white">Pendientes personales</h2>
          <Link href="/dashboard/tasks" className="text-xs" style={{color:'var(--blue)'}}>Ver todas</Link>
        </div>
        {/* Quick add */}
        <div className="px-4 py-2 border-b flex items-center gap-2" style={{borderColor:'var(--border)'}}>
          <Plus size={13} style={{color:'var(--text-3)',flexShrink:0}}/>
          <input value={newTask} onChange={e=>setNewTask(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&addTask()}
            placeholder="Nueva tarea... (Enter)"
            className="flex-1 text-sm bg-transparent text-white outline-none"/>
          {newTask && <button onClick={addTask} disabled={adding}
            className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
            style={{background:'var(--blue)',color:'#fff'}}>
            {adding?'...':'OK'}
          </button>}
        </div>
        <div className="divide-y max-h-60 overflow-y-auto" style={{borderColor:'var(--border)'}}>
          {personalTasks.filter(t=>t.status!=='done').length===0?(
            <div className="px-4 py-5 text-center">
              <p className="text-2xl mb-1">✅</p>
              <p className="text-sm" style={{color:'var(--text-3)'}}>Todo al dia</p>
            </div>
          ):personalTasks.filter(t=>t.status!=='done').map(t=>(
            <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/[0.02]"
              onClick={()=>toggleTask(t)}>
              <Circle size={16} style={{color:'var(--text-3)',flexShrink:0}}/>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{t.title}</p>
                {t.category&&t.category!=='Personal'&&<p className="text-xs" style={{color:'var(--text-3)'}}>{t.category}</p>}
              </div>
              {t.priority==='high'&&<span className="text-xs flex-shrink-0" style={{color:'#fca5a5'}}>🔴</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-2.5">
        <Link href="/dashboard/nutricion" className="card p-3 flex items-center gap-2 hover:bg-white/[0.03]">
          <Flame size={14} className="text-orange-400 flex-shrink-0"/>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white">Nutricion</p>
            <p className="text-xs truncate" style={{color:'var(--text-3)'}}>{nutrition.calories} / 2300 kcal</p>
          </div>
          <ChevronRight size={12} className="ml-auto flex-shrink-0" style={{color:'var(--text-3)'}}/>
        </Link>
        <Link href="/dashboard/chat" className="card p-3 flex items-center gap-2 hover:bg-white/[0.03]">
          <Brain size={14} className="text-purple-400 flex-shrink-0"/>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white">GC Coach</p>
            <p className="text-xs" style={{color:'var(--text-3)'}}>Pregunta algo</p>
          </div>
          <ChevronRight size={12} className="ml-auto flex-shrink-0" style={{color:'var(--text-3)'}}/>
        </Link>
      </div>

    </div>
  )
}
