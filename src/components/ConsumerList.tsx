import { useMemo, useState } from 'react'
import type { Consumer } from '../lib/types'

export default function ConsumerList({ consumers, onRemove }: { consumers: Consumer[]; onRemove: (id:number)=>void }) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    const sorted = [...consumers].sort((a, b) => a.consumerID - b.consumerID)
    if (!query) return sorted
    return sorted.filter(c => String(c.consumerID).includes(query) || c.name.toLowerCase().includes(query))
  }, [q, consumers])

  if (consumers.length === 0) return <p className="text-gray-500">No consumer records found.</p>
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <input className="input" placeholder="Search by ID or name" value={q} onChange={e => setQ(e.target.value)} />
        <div className="text-sm text-gray-600 dark:text-slate-300">Total: {consumers.length}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border bg-white dark:bg-slate-800">
          <thead>
            <tr className="bg-gray-100 dark:bg-slate-700">
              <th className="p-2 text-left">Consumer ID</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Address</th>
              <th className="p-2 text-left">Mobile No.</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.consumerID} className="border-t dark:border-slate-700">
                <td className="p-2">{c.consumerID}</td>
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.address}</td>
                <td className="p-2">{c.mobile_no}</td>
                <td className="p-2">
                  <button className="btn btn-danger" onClick={() => onRemove(c.consumerID)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
