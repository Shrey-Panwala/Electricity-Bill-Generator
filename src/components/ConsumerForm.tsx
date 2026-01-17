import { useState } from 'react'
import type { Consumer } from '../lib/types'
import { valid_address, valid_num, valid_consumer_id } from '../lib/validators'

export type ConsumerFormProps = {
  onSubmit: (consumer: Consumer) => void
}

export default function ConsumerForm({ onSubmit }: ConsumerFormProps) {
  const [consumerIDText, setConsumerIDText] = useState<string>('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [mobile_no, setMobileNo] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const consumerID = parseInt(consumerIDText || '0', 10)
    if (!valid_consumer_id(consumerID)) {
      setError('Enter a valid Consumer ID (> 0).')
      return
    }
    if (!valid_address(address)) {
      setError('Invalid address (min 7 chars).')
      return
    }
    if (!valid_num(mobile_no)) {
      setError('Invalid mobile number (10 digits).')
      return
    }
    setError(null)
    onSubmit({ consumerID, name, address, mobile_no })
    setConsumerIDText(''); setName(''); setAddress(''); setMobileNo('')
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
        <label className="block text-sm font-medium">Name</label>
        <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="input" required />
      </div>
      <div>
        <label className="block text-sm font-medium">Address</label>
        <input placeholder="Street, City" value={address} onChange={e => setAddress(e.target.value)} className="input" required />
      </div>
      <div>
        <label className="block text-sm font-medium">Mobile Number</label>
        <input placeholder="10-digit number" value={mobile_no} onChange={e => setMobileNo(e.target.value)} className="input" required />
      </div>
      <button type="submit" className="btn btn-primary">Add Consumer</button>
    </form>
  )
}
