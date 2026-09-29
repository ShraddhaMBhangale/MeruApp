'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  active: string
  setActive: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue>({ active: '', setActive: () => {} })

export function Tabs({
  defaultValue,
  children,
  className,
}: {
  defaultValue: string
  children: React.ReactNode
  className?: string
}) {
  const [active, setActive] = React.useState(defaultValue)
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex gap-1 rounded-lg bg-slate-100 p-1 overflow-x-auto',
        className
      )}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { active, setActive } = React.useContext(TabsContext)
  return (
    <button
      onClick={() => setActive(value)}
      className={cn(
        'flex-shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
        active === value
          ? 'bg-white text-teal-700 shadow-sm'
          : 'text-slate-600 hover:text-slate-900',
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { active } = React.useContext(TabsContext)
  if (active !== value) return null
  return <div className={cn('mt-4', className)}>{children}</div>
}
