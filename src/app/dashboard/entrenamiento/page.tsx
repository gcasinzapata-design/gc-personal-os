// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { Dumbbell, CheckCircle2, Circle, Plus, ChevronDown, ChevronRight, Flame, Timer, BarChart2, Loader2 } from 'lucide-react'

// Weekly plan — GC's base program
const PLAN = {
  1: { // Lunes
    name: 'Empuje — Pecho / Hombros / Triceps',
    emoji: '💪',
    type: 'Fuerza + Calistenia',
    exercises: [
      { name: 'Calentamiento: 10 min movilidad articular', sets: null, reps: null, note: 'Hombros, muñecas, torácica' },
      { name: 'Press banca plano (barra o mancuernas)', sets: 4, reps: '8-10', note: 'Progresivo en peso' },
      { name: 'Press militar de pie (barra)', sets: 4, reps: '8-10', note: 'Core activado' },
      { name: 'Flexiones diamante', sets: 3, reps: '12-15', note: 'Codos cerca del cuerpo' },
      { name: 'Elevaciones laterales', sets: 3, reps: '15', note: 'Peso ligero, control total' },
      { name: 'Fondos en paralelas', sets: 3, reps: '10-12', note: 'Cuerpo ligeramente inclinado' },
      { name: 'Push-ups inclinados (pies elevados)', sets: 3, reps: 'max', note: 'Para hombro superior' },
      { name: 'Estiramiento 5 min', sets: null, reps: null, note: 'Pecho, hombros, triceps' },
    ]
  },
  2: { // Martes
    name: 'Tiron — Espalda / Biceps',
    emoji: '🏊',
    type: 'Gym + Opcional: Natacion 20min',
    exercises: [
      { name: 'Calentamiento: 5 min band pulls o natacion libre', sets: null, reps: null, note: '' },
      { name: 'Dominadas (o jalones polea ancha)', sets: 4, reps: '6-10', note: 'Agarre prono, escapulas bajas' },
      { name: 'Remo con barra o mancuerna', sets: 4, reps: '10-12', note: 'Espalda recta, codo 45°' },
      { name: 'Remo en cable (agarre neutro)', sets: 3, reps: '12', note: 'Aprieta escapulas al final' },
      { name: 'Curl biceps con barra EZ', sets: 3, reps: '10-12', note: 'Sin balanceo' },
      { name: 'Curl martillo mancuernas', sets: 3, reps: '12', note: 'Neutro, lento en excéntrico' },
      { name: 'Face pulls con cuerda', sets: 3, reps: '15', note: 'Salud del manguito rotador' },
      { name: 'Natacion (opcional) 20-30 min', sets: null, reps: null, note: 'Estilo libre o espalda — recuperación activa' },
    ]
  },
  3: { // Miercoles
    name: 'Piernas + Core Funcional',
    emoji: '🦵',
    type: 'Fuerza Funcional',
    exercises: [
      { name: 'Calentamiento: peso corporal squats 20 rep + hip circles', sets: null, reps: null, note: '' },
      { name: 'Sentadilla libre (barra)', sets: 4, reps: '8-10', note: 'Profundidad paralela, rodillas afuera' },
      { name: 'Prensa de piernas', sets: 3, reps: '12', note: 'Pies altos para glúteos o bajos para cuadriceps' },
      { name: 'Peso muerto rumano', sets: 3, reps: '10-12', note: 'Bisagra de cadera, espalda recta' },
      { name: 'Zancadas con mancuernas', sets: 3, reps: '10 c/pierna', note: 'Control total, rodilla no pasa puntera' },
      { name: 'Gemelos en máquina', sets: 4, reps: '15-20', note: 'Lento, completo rango' },
      { name: 'Plancha frontal', sets: 3, reps: '45-60 seg', note: 'Glúteos activos, no hundir caderas' },
      { name: 'Plancha lateral', sets: 3, reps: '30 seg c/lado', note: '' },
      { name: 'Dragon flag o rueda ab', sets: 3, reps: '8-10', note: 'Funcional y desafiante' },
    ]
  },
  4: { // Jueves
    name: 'Cardio + Movilidad',
    emoji: '🏃',
    type: 'Cardio Suave / Recuperación',
    exercises: [
      { name: 'Trote suave o caminata rapida', sets: null, reps: '30 min', note: 'Zona 2: puedes hablar sin perder aliento' },
      { name: 'Hip flexors: stretch 90/90', sets: null, reps: '2 min c/lado', note: 'Crítico para quien trabaja sentado' },
      { name: 'Rotacion torácica con foam roller', sets: null, reps: '2 min', note: '' },
      { name: 'Yoga hip openers', sets: null, reps: '10 min', note: 'Paloma, mariposa, guerrero' },
      { name: 'Respiracion box breathing 4-4-4-4', sets: null, reps: '5 min', note: 'Inhala 4s / sostén 4s / exhala 4s / sostén 4s' },
      { name: 'Stretching general', sets: null, reps: '10 min', note: 'Todo el cuerpo, prioriza lo que duela' },
    ]
  },
  5: { // Viernes
    name: 'Funcional + Atletico',
    emoji: '⚡',
    type: 'Entrenamiento Funcional',
    exercises: [
      { name: 'Circuit warm-up: jumping jacks + skipping + armswings 5 min', sets: null, reps: null, note: '' },
      { name: 'Burpees', sets: 4, reps: '10', note: 'Explosivo al subir' },
      { name: 'Turkish get-up (mancuerna)', sets: 3, reps: '5 c/lado', note: 'Lento y controlado, peso moderado' },
      { name: 'Wall ball shots', sets: 4, reps: '15', note: 'Combo de squat + empuje explosivo' },
      { name: 'Pullups con agarre neutro', sets: 3, reps: 'max', note: '' },
      { name: 'Box jumps (o saltos en lugar)', sets: 3, reps: '8', note: 'Aterrizaje suave con rodillas flexionadas' },
      { name: 'Farmer carry (2 mancuernas pesadas)', sets: 3, reps: '20 metros', note: 'Core duro, hombros atrás' },
      { name: 'Dead hang (barra)', sets: 3, reps: '30-60 seg', note: 'Grip + descompresión lumbar' },
    ]
  },
  6: { // Sabado
    name: 'Descanso Activo',
    emoji: '🧘',
    type: 'Recuperacion',
    exercises: [
      { name: 'Paseos con Magno (10am + 4pm + 10pm)', sets: null, reps: '40 min c/u', note: 'NEAT — cuenta como movimiento real' },
      { name: 'Foam rolling cuerpo completo', sets: null, reps: '15 min', note: 'Cuadriceps, IT band, espalda alta' },
      { name: 'Stretching suave', sets: null, reps: '10 min', note: '' },
      { name: 'Respiracion y meditacion', sets: null, reps: '10 min', note: 'Wim Hof, box breathing, o simple mindfulness' },
      { name: 'Hidratacion extra + creatina + omega 3', sets: null, reps: null, note: 'Prioridad en dias de descanso tambien' },
    ]
  },
  0: { // Domingo
    name: 'Futbol ⚽',
    emoji: '⚽',
    type: 'Deporte + Cardio Garantizado',
    exercises: [
      { name: 'Futbol con amigos', sets: null, reps: '60-90 min', note: 'Cardio HIIT natural. Agilidad + velocidad + coordinacion' },
      { name: 'Recuperacion post-partido', sets: null, reps: null, note: 'ISO100 + creatina inmediatamente. Stretching piernas 10 min' },
      { name: 'Hidratacion', sets: null, reps: null, note: '500ml agua antes, 1L durante, 500ml despues' },
    ]
  }
}

const DAY_NAMES = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab']

function IntensityDots({ value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {[1,2,3,4,5].map(v => (
        <button key={v} onClick={() => onChange(v)}
          className="w-6 h-6 rounded-full text-xs font-bold"
          style={{ background: v <= value ? '#3b82f6' : 'var(--border)', color: v <= value ? '#fff' : 'var(--text-3)' }}>
          {v}
        </button>
      ))}
    </div>
  )
}

export default function EntrenamientoPage() {
  const today = new Date()
  const todayDay = today.getDay() // 0=Sun, 1=Mon...
  const plan = PLAN[todayDay]
  const [done, setDone] = useState(new Set())
  const [logging, setLogging] = useState(false)
  const [logSaved, setLogSaved] = useState(false)
  const [workoutLog, setWorkoutLog] = useState({ duration_min: 60, intensity: 3, notes: '' })
  const [history, setHistory] = useState([])
  const [checkin, setCheckin] = useState({ energy_level: 3, stress_level: 2 })
  const [showHistory, setShowHistory] = useState(false)
  const [expandedDay, setExpandedDay] = useState(todayDay)

  const isLightDay = checkin.energy_level <= 2 || checkin.stress_level >= 4

  useEffect(() => {
    // Load today's check-in and workout history
    fetch(`/api/checkin?date=${today.toISOString().slice(0,10)}`).then(r=>r.json()).then(d=>{
      if (d.checkin) setCheckin({ energy_level: d.checkin.energy_level, stress_level: d.checkin.stress_level })
    })
    fetch(`/api/workouts?date=${new Date(Date.now()-7*86400000).toISOString().slice(0,10)}`).then(r=>r.json()).then(d=>{
      setHistory(d.workouts || [])
    })
  }, [])

  function toggleExercise(i) {
    const next = new Set(done)
    if (next.has(i)) next.delete(i); else next.add(i)
    setDone(next)
  }

  async function logWorkout() {
    setLogging(true)
    const exercises = plan.exercises.filter((_,i) => done.has(i)).map(e => e.name)
    await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workout_type: plan.name,
        duration_min: workoutLog.duration_min,
        intensity: workoutLog.intensity,
        exercises,
        notes: workoutLog.notes,
        date: today.toISOString().slice(0,10),
      })
    })
    setLogSaved(true)
    setLogging(false)
    // Refresh history
    fetch(`/api/workouts?date=${new Date(Date.now()-7*86400000).toISOString().slice(0,10)}`).then(r=>r.json()).then(d=>setHistory(d.workouts||[]))
  }

  const exercises = isLightDay
    ? [{ name: 'Dia de energia baja — sesion ligera recomendada', sets: null, reps: null, note: 'Movilidad 15 min + caminar con Magno. Reprograma sesion fuerte para manana.' },
       { name: 'Stretching completo', sets: null, reps: '15 min', note: '' },
       { name: 'Respiracion y meditacion', sets: null, reps: '10 min', note: 'Box breathing 4-4-4-4' }]
    : plan.exercises

  return (
    <div className="p-4 md:p-5 space-y-4 max-w-2xl mx-auto" style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Dumbbell size={20} className="text-blue-400" /> Entrenamiento
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
          {DAY_NAMES[todayDay]} — {plan.emoji} {plan.name}
        </p>
      </div>

      {/* Energy state alert */}
      {isLightDay && (
        <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}>
          <p className="text-sm font-semibold text-yellow-400">
            ⚠️ Energia {checkin.energy_level}/5 · Estres {checkin.stress_level}/5 — Dia adaptado
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
            Sesion ligera hoy. La sesion de {plan.name} se reprograma para manana.
          </p>
        </div>
      )}

      {/* Today's plan */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="text-sm font-semibold text-white">{plan.emoji} {isLightDay ? 'Sesion Ligera (adaptada)' : plan.name}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{isLightDay ? 'Recuperacion activa' : plan.type}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: 'var(--blue)', color: '#fff' }}>
            {done.size}/{exercises.filter(e=>e.sets||e.reps).length} hechos
          </span>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {exercises.map((ex, i) => {
            const isToggleable = ex.sets || ex.reps
            const isDone = done.has(i)
            return (
              <div key={i}
                className={`flex items-start gap-3 px-4 py-3 ${isToggleable ? 'cursor-pointer hover:bg-white/[0.02]' : ''}`}
                style={{ opacity: isDone ? 0.5 : 1 }}
                onClick={() => isToggleable && toggleExercise(i)}>
                <div className="flex-shrink-0 mt-0.5">
                  {isToggleable
                    ? isDone ? <CheckCircle2 size={18} className="text-green-400" /> : <Circle size={18} style={{ color: 'var(--text-3)' }} />
                    : <div className="w-4 h-4 rounded-full mt-0.5" style={{ background: 'var(--border)' }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDone ? 'line-through' : 'text-white'}`} style={{ color: isDone ? 'var(--text-3)' : undefined }}>
                    {ex.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {ex.sets && <span className="text-xs font-medium text-blue-400">{ex.sets} series × {ex.reps}</span>}
                    {ex.reps && !ex.sets && <span className="text-xs font-medium text-blue-400">{ex.reps}</span>}
                    {ex.note && <span className="text-xs" style={{ color: 'var(--text-3)' }}>{ex.note}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Log workout */}
      {!logSaved ? (
        <div className="card p-4 space-y-3">
          <p className="text-sm font-semibold text-white flex items-center gap-2">
            <BarChart2 size={14} className="text-blue-400" /> Registrar sesion
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs mb-1.5" style={{ color: 'var(--text-3)' }}>Duracion (min)</p>
              <div className="flex gap-1.5">
                {[30,45,60,75,90].map(v => (
                  <button key={v} onClick={() => setWorkoutLog(w=>({...w,duration_min:v}))}
                    className="flex-1 py-1.5 rounded-lg text-xs"
                    style={{ background: workoutLog.duration_min===v?'var(--blue)':'var(--bg-card2)', color: workoutLog.duration_min===v?'#fff':'var(--text-2)', border:'1px solid var(--border)' }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs mb-1.5" style={{ color: 'var(--text-3)' }}>Intensidad</p>
              <IntensityDots value={workoutLog.intensity} onChange={v=>setWorkoutLog(w=>({...w,intensity:v}))} />
            </div>
          </div>
          <input value={workoutLog.notes} onChange={e=>setWorkoutLog(w=>({...w,notes:e.target.value}))}
            placeholder="Notas: como te sentiste, PRs, etc."
            className="w-full px-3 py-2 rounded-xl text-sm text-white"
            style={{ background:'var(--bg-card2)', border:'1px solid var(--border)' }} />
          <button onClick={logWorkout} disabled={logging || done.size === 0}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: done.size===0?'var(--border)':'#059669' }}>
            {logging ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {done.size===0 ? 'Marca ejercicios primero' : `Guardar sesion (${done.size} ejercicios)`}
          </button>
        </div>
      ) : (
        <div className="px-4 py-3 rounded-xl" style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)' }}>
          <p className="text-sm font-semibold text-green-400">✅ Sesion registrada — el Coach toma nota</p>
        </div>
      )}

      {/* Weekly schedule */}
      <div className="card overflow-hidden">
        <button className="w-full px-4 py-3 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border)' }}
          onClick={() => setShowHistory(!showHistory)}>
          <p className="text-sm font-semibold text-white">Plan semanal completo</p>
          {showHistory ? <ChevronDown size={14} style={{ color:'var(--text-3)' }} /> : <ChevronRight size={14} style={{ color:'var(--text-3)' }} />}
        </button>
        {showHistory && (
          <div className="divide-y" style={{ borderColor:'var(--border)' }}>
            {[1,2,3,4,5,6,0].map(d => {
              const p = PLAN[d]
              const isToday = d === todayDay
              return (
                <div key={d} className="px-4 py-3" style={{ background: isToday ? 'rgba(59,130,246,0.05)' : undefined }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold w-6" style={{ color: isToday ? '#3b82f6' : 'var(--text-3)' }}>
                      {DAY_NAMES[d]}
                    </span>
                    <span className="text-sm">{p.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-3)' }}>{p.type}</p>
                    </div>
                    {isToday && <span className="text-xs px-2 py-0.5 rounded-full text-blue-400" style={{ background:'rgba(59,130,246,0.15)' }}>Hoy</span>}
                  </div>
                  {expandedDay === d && (
                    <div className="mt-2 ml-8 space-y-1">
                      {p.exercises.map((ex,i) => (
                        <p key={i} className="text-xs" style={{ color:'var(--text-3)' }}>
                          {ex.sets ? `• ${ex.name} — ${ex.sets}×${ex.reps}` : `• ${ex.name}${ex.reps?' ('+ex.reps+')':''}`}
                        </p>
                      ))}
                    </div>
                  )}
                  <button className="ml-8 mt-1 text-xs" style={{ color:'var(--blue)' }}
                    onClick={() => setExpandedDay(expandedDay===d?-1:d)}>
                    {expandedDay===d ? 'Ocultar' : 'Ver ejercicios'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent history */}
      {history.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-2.5 border-b" style={{ borderColor:'var(--border)' }}>
            <p className="text-sm font-semibold text-white">Ultimos 7 dias</p>
          </div>
          <div className="divide-y" style={{ borderColor:'var(--border)' }}>
            {history.map(w => (
              <div key={w.id} className="px-4 py-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white truncate flex-1 mr-2">{w.workout_type}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {w.duration_min && <span className="text-xs" style={{ color:'var(--text-3)' }}>{w.duration_min}min</span>}
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(v => (
                        <div key={v} className="w-2 h-2 rounded-full" style={{ background: v<=w.intensity?'#3b82f6':'var(--border)' }} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs mt-0.5" style={{ color:'var(--text-3)' }}>
                  {new Date(w.log_date).toLocaleDateString('es-PE',{weekday:'short',day:'numeric',month:'short'})}
                  {w.notes && ` — ${w.notes}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
