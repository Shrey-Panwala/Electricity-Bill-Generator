import { useEffect, useMemo, useRef, useState } from 'react'

export type MonthYearPickerProps = {
  value: string // YYYY-MM
  onChange: (value: string) => void
  minYear?: number
  maxYear?: number
}

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function MonthYearPicker({ value, onChange, minYear = 2000, maxYear }: MonthYearPickerProps) {
  const now = useMemo(() => new Date(), [])
  const currentYear = maxYear ?? now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const [open, setOpen] = useState(false)

  const [year, setYear] = useState<number>(() => {
    const [y] = (value || '').split('-')
    const parsed = parseInt(y || String(currentYear), 10)
    return Number.isFinite(parsed) ? parsed : currentYear
  })

  const [month, setMonth] = useState<number>(() => {
    const [, m] = (value || '').split('-')
    const parsed = parseInt(m || String(currentMonth), 10)
    return Number.isFinite(parsed) ? parsed : currentMonth
  })

  const containerRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const display = `${monthNames[Math.max(0, Math.min(11, month - 1))]}, ${year}`

  const apply = (y: number, m: number) => {
    const mm = String(m).padStart(2, '0')
    onChange(`${y}-${mm}`)
    setOpen(false)
  }

  const disabled = (y: number, m: number) => {
    if (y < minYear) return true
    if (y > currentYear) return true
    if (y === currentYear && m > currentMonth) return true
    return false
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-2">
        <input readOnly value={display} className="input cursor-pointer" onClick={() => setOpen(v => !v)} />
        <button type="button" className="btn btn-secondary" onClick={() => { setYear(currentYear); setMonth(currentMonth); apply(currentYear, currentMonth) }}>This Month</button>
        <button type="button" className="btn" onClick={() => setOpen(v => !v)}>Pick</button>
      </div>
      {open && (
        <div className="absolute z-20 mt-2 w-[420px] rounded border bg-white p-3 shadow-lg dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <button type="button" className="btn" onClick={() => setYear(y => Math.max(minYear, y - 1))}>{'<'}</button>
            <div className="text-lg font-semibold">{year}</div>
            <button type="button" className="btn" onClick={() => setYear(y => Math.min(currentYear, y + 1))}>{'>'}</button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {monthNames.map((name, idx) => {
              const m = idx + 1
              const isDisabled = disabled(year, m)
              const isActive = m === month && year === parseInt((value||'').split('-')[0] || String(year), 10)
              return (
                <button
                  key={name}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => { setMonth(m); apply(year, m) }}
                  className={`rounded px-4 py-3 text-sm ${isDisabled ? 'bg-gray-200 text-gray-500 dark:bg-slate-700 dark:text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'} ${isActive ? 'ring-2 ring-yellow-400' : ''}`}
                >
                  {name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
