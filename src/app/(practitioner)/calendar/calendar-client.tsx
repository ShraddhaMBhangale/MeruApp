'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Session = {
  id: string
  session_number: number
  session_date: string
  session_time: string | null
  duration_minutes: number
  status: string
  client_id: string
  clients: { id: string; full_name: string } | null
}

interface Props {
  sessions: Session[]
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function fmt12(time: string | null): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h < 12 ? 'am' : 'pm'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

export function CalendarClient({ sessions }: Props) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<string | null>(
    today.toISOString().split('T')[0]
  )

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  // Build calendar grid — weeks start Monday
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  // Monday = 0, Sunday = 6
  const startOffset = (firstDay.getDay() + 6) % 7
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7

  const cells: (Date | null)[] = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startOffset + 1
    if (dayNum < 1 || dayNum > lastDay.getDate()) return null
    return new Date(year, month, dayNum)
  })

  // Group sessions by date string
  const byDate = sessions.reduce<Record<string, Session[]>>((acc, s) => {
    acc[s.session_date] = acc[s.session_date] ?? []
    acc[s.session_date].push(s)
    return acc
  }, {})

  const todayStr = today.toISOString().split('T')[0]
  const selectedSessions = selectedDay ? (byDate[selectedDay] ?? []) : []

  function prevMonth() { setViewDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setViewDate(new Date(year, month + 1, 1)) }
  function goToday() {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDay(todayStr)
  }

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="text-sm text-slate-500">{sessions.length} sessions in view</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
          <Link href="/clients">
            <Button size="sm">
              <Plus className="h-4 w-4" />New session
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Month grid */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Month nav */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <h2 className="text-base font-semibold text-slate-900">
                {MONTH_NAMES[month]} {year}
              </h2>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-slate-100">
              {DAY_LABELS.map(d => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {cells.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="min-h-[80px] border-b border-r border-slate-50 bg-slate-50/50" />
                }
                const dateStr = date.toISOString().split('T')[0]
                const daySessions = byDate[dateStr] ?? []
                const isToday = dateStr === todayStr
                const isSelected = dateStr === selectedDay
                const isPast = date < new Date(todayStr)

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDay(dateStr)}
                    className={`min-h-[80px] p-1.5 text-left border-b border-r border-slate-100 transition-colors hover:bg-slate-50 ${
                      isSelected ? 'bg-teal-50 hover:bg-teal-50' : ''
                    } ${isPast && !isToday ? 'opacity-60' : ''}`}
                  >
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday
                        ? 'bg-teal-600 text-white'
                        : isSelected
                        ? 'bg-teal-100 text-teal-700'
                        : 'text-slate-700'
                    }`}>
                      {date.getDate()}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {daySessions.slice(0, 2).map(s => (
                        <div
                          key={s.id}
                          className={`truncate rounded px-1 py-0.5 text-[10px] font-medium border ${STATUS_COLORS[s.status] ?? STATUS_COLORS.scheduled}`}
                        >
                          {s.session_time ? `${fmt12(s.session_time)} · ` : ''}{s.clients?.full_name?.split(' ')[0]}
                        </div>
                      ))}
                      {daySessions.length > 2 && (
                        <div className="text-[10px] text-slate-400 pl-1">+{daySessions.length - 2} more</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 px-1">
            {[['scheduled', 'Scheduled'], ['completed', 'Completed'], ['cancelled', 'Cancelled']].map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`h-3 w-3 rounded-sm border ${STATUS_COLORS[key]}`} />
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">
                {selectedDay
                  ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
                  : 'Select a day'}
              </p>
            </div>

            <div className="p-3">
              {selectedSessions.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <CalendarDays className="h-8 w-8 text-slate-200" />
                  <p className="text-sm text-slate-400">No sessions</p>
                  {selectedDay && (
                    <Link href="/clients">
                      <Button size="sm" variant="outline" className="text-xs">
                        <Plus className="h-3.5 w-3.5" />Schedule one
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <ul className="space-y-2">
                  {selectedSessions
                    .sort((a, b) => (a.session_time ?? '').localeCompare(b.session_time ?? ''))
                    .map(s => (
                      <li key={s.id}>
                        <Link
                          href={`/clients/${s.client_id}/sessions/${s.id}`}
                          className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 hover:border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          <div className={`mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                            s.status === 'completed' ? 'bg-emerald-500' :
                            s.status === 'cancelled' ? 'bg-red-400' : 'bg-blue-500'
                          }`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {s.clients?.full_name}
                            </p>
                            <p className="text-xs text-slate-500">
                              Session #{s.session_number}
                              {s.session_time && ` · ${fmt12(s.session_time)}`}
                              {` · ${s.duration_minutes} min`}
                            </p>
                            <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium border ${STATUS_COLORS[s.status]}`}>
                              {s.status}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
