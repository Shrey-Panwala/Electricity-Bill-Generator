import { useState, useRef, useMemo } from 'react'
import type { AppState, Bill, Consumer } from '../lib/types'
import { get_bill, get_consumer, get_previous_bills } from '../lib/storage'
import { formatINR } from '../lib/billing'
import MonthYearPicker from './MonthYearPicker'

export default function GenerateBill({ state }: { state: AppState }) {
  const [consumerIDText, setConsumerIDText] = useState<string>('')
  const now = useMemo(() => new Date(), [])
  const defaultMonthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  const [monthStr, setMonthStr] = useState<string>(defaultMonthStr)
  const [result, setResult] = useState<{ consumer?: Consumer, bill?: Bill, prev: Bill[] } | null>(null)

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    const [yStr, mStr] = (monthStr || '').split('-')
    const year = parseInt(yStr || '0', 10)
    const month = parseInt(mStr || '0', 10)
    const consumerID = parseInt(consumerIDText || '0', 10)
    const consumer = get_consumer(state, consumerID)
    const bill = get_bill(state, consumerID, month, year)
    const prev = get_previous_bills(state, consumerID, month, year)
    setResult({ consumer, bill, prev })
  }

  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (!printRef.current) return
    const printContents = printRef.current.innerHTML
    const w = window.open('', '', 'height=700,width=900')
    if (!w) return
    w.document.write('<html><head><title>Bill</title></head><body>')
    w.document.write(printContents)
    w.document.write('</body></html>')
    w.document.close()
    w.focus()
    w.print()
    w.close()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Consumer ID</label>
            <input type="text" inputMode="numeric" pattern="[0-9]*" value={consumerIDText} onChange={e => setConsumerIDText(e.target.value.replace(/\D+/g,''))} className="mt-1 w-full rounded border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Billing Period (Month/Year)</label>
            <MonthYearPicker value={monthStr} onChange={setMonthStr} minYear={2000} />
          </div>
        </div>
        <button type="submit" className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Generate Bill</button>
      </form>

      {result && (
        <div className="space-y-3">
          {!result.consumer && <div className="text-red-600">Consumer not found.</div>}
          {result.consumer && !result.bill && <div className="text-red-600">No bill found for the given month and year.</div>}
          {result.consumer && result.bill && (
            <div ref={printRef} className="card p-4">
              <h3 className="text-lg font-semibold">Bill for {monthStr} (Consumer {consumerIDText || '—'})</h3>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <div><span className="font-medium">Consumer Name:</span> {result.consumer.name}</div>
                  <div><span className="font-medium">Address:</span> {result.consumer.address}</div>
                  <div><span className="font-medium">Mobile Number:</span> {result.consumer.mobile_no}</div>
                </div>
                <div>
                  <div><span className="font-medium">Units Consumed:</span> {result.bill.units_consumed}</div>
                  <div><span className="font-medium">Amount Due:</span> {formatINR(result.bill.amt)}</div>
                </div>
              </div>
            </div>
          )}

          {result.prev.length > 0 ? (
            <div className="card p-4">
              <h4 className="font-semibold">Previous Bills</h4>
              <ul className="mt-2 space-y-1">
                {result.prev.map(b => (
                  <li key={`${b.year}-${b.month}`}>
                    Month: {b.month}/{b.year} - Amount: {formatINR(b.amt)}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-gray-600">No complete bill details for the last 3 consecutive months.</div>
          )}

          {result.consumer && result.bill && (
            <button onClick={handlePrint} className="btn btn-secondary">Print Bill</button>
          )}
        </div>
      )}
    </div>
  )
}
