'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sun, Flame, Dumbbell, MessageSquareText, LayoutDashboard } from 'lucide-react'

const TABS = [
  { href: '/dashboard/today', icon: Sun, label: 'Hoy' },
  { href: '/dashboard/nutricion', icon: Flame, label: 'Nutrición' },
  { href: '/dashboard/entrenamiento', icon: Dumbbell, label: 'Entreno' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Finanzas' },
  { href: '/dashboard/chat', icon: MessageSquareText, label: 'Coach' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden z-50 safe-area-pb"
      style={{
        background: 'rgba(10,10,15,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-stretch h-16">
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95"
              style={{ color: active ? '#3b82f6' : 'rgba(255,255,255,0.4)' }}
            >
              <div
                className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                style={{ background: active ? 'rgba(59,130,246,0.15)' : 'transparent' }}
              >
                <Icon size={18} />
              </div>
              <span className="text-xs font-medium leading-tight">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
