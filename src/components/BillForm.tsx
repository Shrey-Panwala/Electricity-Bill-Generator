import { useMemo, useState } from 'react'
import { valid_month, valid_year } from '../lib/validators'
import MonthYearPicker from './MonthYearPicker'

export type BillFormProps = {
  onSubmit: (data: { consumerID: number, month: number, year: number, units_consumed: number }) => void
  knownConsumerIDs: number[]
}

export default function BillForm({ onSubmit, knownConsumerIDs }: BillFormProps) {
  const [consumerIDText, setConsumerIDText] = useState<string>('')
  const now = useMemo(() => new Date(), [])
  const defaultMonthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  const [monthStr, setMonthStr] = useState<string>(defaultMonthStr)
  const [units, setUnits] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const consumerID = parseInt(consumerIDText || '0', 10)
    if (!knownConsumerIDs.includes(consumerID)) { setError('Consumer ID not found. Add consumer first.'); return }
    const [yStr, mStr] = (monthStr || '').split('-')
    const year = parseInt(yStr || '0', 10)
    const month = parseInt(mStr || '0', 10)
    if (!valid_month(month)) { setError('Invalid month (1-12).'); return }
    if (!valid_year(year)) { setError('Invalid year (2000-current).'); return }
    if (!Number.isFinite(units) || units <= 0) { setError('Units must be a positive number.'); return }
    setError(null)
    onSubmit({ consumerID, month, year, units_consumed: units })
    setConsumerIDText(''); setMonthStr(defaultMonthStr); setUnits(0)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded bg-red-100 p-2 text-red-700">{error}</div>}
      <div>
        <label className="block text-sm font-medium">Consumer ID</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="e.g., 1001"
          value={consumerIDText}
          onChange={e => { const v = e.target.value.replace(/\D+/g,''); setConsumerIDText(v) }}
          className="input"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Billing Period (Month/Year)</label>
        <MonthYearPicker value={monthStr} onChange={setMonthStr} minYear={2000} />
      </div>
      <div>
        <label className="block text-sm font-medium">Units Consumed</label>
        <input type="number" placeholder="e.g., 250" value={units} onChange={e => setUnits(parseInt(e.target.value||'0'))} className="input" required />
      </div>
      <button type="submit" className="btn btn-primary">Add Bill</button>
    </form>
  )
}
