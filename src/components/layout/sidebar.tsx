'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { signOut } from '@/app/actions/auth'
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-slate-700/50 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 0-4 4-4 9s4 9 4 9M8 7.5c0 0 2 2 4 4.5s4 4.5 4 4.5M16 7.5c0 0-2 2-4 4.5" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white leading-none">Meru Chikitsa</p>
          <p className="text-xs text-slate-400 mt-0.5">Practice Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="border-t border-slate-700/50 p-3">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-56 lg:flex-col lg:bg-slate-800 lg:fixed lg:inset-y-0">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-600">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 0-4 4-4 9s4 9 4 9M8 7.5c0 0 2 2 4 4.5s4 4.5 4 4.5" />
            </svg>
          </div>
          <span className="font-semibold text-slate-900 text-sm">Meru Chikitsa</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-1 text-slate-500 hover:text-slate-700">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-slate-800 flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  )
}
