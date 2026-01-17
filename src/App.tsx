import { useEffect, useState } from 'react'
import ConsumerForm from './components/ConsumerForm'
import ConsumerList from './components/ConsumerList'
import BillForm from './components/BillForm'
import GenerateBill from './components/GenerateBill'
import RevenueChart from './components/RevenueChart'
import type { AppState, Consumer } from './lib/types'
import { add_bill, add_consumer, loadState, remove_consumer, api_get_state, api_add_consumer, api_add_bill, api_delete_consumer } from './lib/storage'
import { setCostPerUnit } from './lib/billing'
import ToastContainer, { useToast } from './components/Toast'

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [tab, setTab] = useState<'dashboard'|'add-consumer'|'list-consumers'|'add-bill'|'generate-bill'|'settings'>('dashboard')
  const { toasts, show, dismiss } = useToast()

  // Initialize from API state on mount
  useEffect(() => {
    api_get_state().then(s => setState(s))
  }, [])

  const handleAddConsumer = async (consumer: Consumer) => {
    const ok = await api_add_consumer(consumer)
    if (ok) {
      const s = await api_get_state()
      setState(s)
      show('Consumer added successfully.', 'success')
    } else {
      show('Consumer ID already exists or invalid.', 'error')
    }
  }

  const handleAddBill = async (data: { consumerID: number, month: number, year: number, units_consumed: number }) => {
    if (!state.consumers.find(c => c.consumerID === data.consumerID)) {
      show('Consumer ID not found. Please add consumer first.', 'error')
      return
    }
    const ok = await api_add_bill(data)
    if (ok) {
      const s = await api_get_state()
      setState(s)
      show('Bill added successfully.', 'success')
    } else {
      show('Bill already exists for month/year or invalid.', 'error')
    }
  }

  const handleRemoveConsumer = async (id: number) => {
    await api_delete_consumer(id)
    const s = await api_get_state()
    setState(s)
    show('Consumer deleted (and related bills removed).', 'success')
  }

  return (
    <div className="container">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Electricity Bill System</h1>
        <p className="text-sm text-gray-600 dark:text-slate-300">Modern, responsive UI aligned with your C++ logic.</p>
      </header>

      <nav className="mb-4 flex flex-wrap gap-2">
        {[
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'add-consumer', label: 'Add Consumer' },
          { key: 'list-consumers', label: 'List Consumers' },
          { key: 'add-bill', label: 'Add Bill' },
          { key: 'generate-bill', label: 'Generate Bill' },
          { key: 'settings', label: 'Settings' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} className={`btn ${tab===t.key? 'btn-primary':'btn-secondary'}`}>{t.label}</button>
        ))}
      </nav>

      <main className="space-y-6">
        {tab === 'dashboard' && (
          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="card p-4">
                <div className="text-sm text-gray-500">Total Consumers</div>
                <div className="text-2xl font-semibold">{state.consumers.length}</div>
              </div>
              <div className="card p-4">
                <div className="text-sm text-gray-500">Total Bills</div>
                <div className="text-2xl font-semibold">{state.bills.length}</div>
              </div>
              <div className="card p-4">
                <div className="text-sm text-gray-500">Total Revenue</div>
                <div className="text-2xl font-semibold">₹{state.bills.reduce((s,b)=>s+b.amt,0).toFixed(2)}</div>
              </div>
            </div>
            <RevenueChart bills={state.bills} />
          </section>
        )}
        {tab === 'add-consumer' && (
          <section className="card p-4">
            <h2 className="mb-3 text-xl font-semibold">Add Consumer</h2>
            <ConsumerForm onSubmit={handleAddConsumer} />
          </section>
        )}

        {tab === 'list-consumers' && (
          <section className="card p-4">
            <h2 className="mb-3 text-xl font-semibold">Consumers</h2>
            <ConsumerList consumers={state.consumers} onRemove={handleRemoveConsumer} />
          </section>
        )}

        {tab === 'add-bill' && (
          <section className="card p-4">
            <h2 className="mb-3 text-xl font-semibold">Add Bill</h2>
            <BillForm onSubmit={handleAddBill} knownConsumerIDs={state.consumers.map(c => c.consumerID)} />
          </section>
        )}

        {tab === 'generate-bill' && (
          <section className="card p-4">
            <h2 className="mb-3 text-xl font-semibold">Generate Bill</h2>
            <GenerateBill state={state} />
          </section>
        )}

        {tab === 'settings' && (
          <section className="card p-4">
            <h2 className="mb-3 text-xl font-semibold">Settings</h2>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Cost per unit (₹)</label>
              <input
                type="number"
                step={0.01}
                value={state.cost_per_unit}
                onChange={e => {
                  const v = parseFloat(e.target.value || '0')
                  if (!Number.isFinite(v) || v <= 0) {
                    show('Enter a valid positive rate.', 'error')
                    return
                  }
                  setState(setCostPerUnit(state, v))
                  show('Cost per unit updated.', 'success')
                }}
                className="input w-32"
              />
            </div>
          </section>
        )}
      </main>

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  )
}
