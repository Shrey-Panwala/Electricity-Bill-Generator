import { useEffect, useRef } from 'react'
import type { Bill } from '../lib/types'

function aggregateMonthlyRevenue(bills: Bill) {
  return bills
}

function groupByMonth(bills: Bill[]) {
  const map = new Map<string, number>()
  for (const b of bills) {
    const key = `${b.year}-${String(b.month).padStart(2,'0')}`
    map.set(key, (map.get(key) || 0) + b.amt)
  }
  // Sort chronological
  const entries = Array.from(map.entries()).sort((a,b)=> a[0] < b[0] ? -1 : 1)
  return entries
}

export default function RevenueChart({ bills }: { bills: Bill[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const data = groupByMonth(bills).slice(-12) // last 12 months
    const labels = data.map(([k]) => k)
    const values = data.map(([,v]) => v)

    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0,0,width,height)

    // Padding
    const padL = 40
    const padR = 10
    const padT = 20
    const padB = 40

    const chartW = width - padL - padR
    const chartH = height - padT - padB

    const maxV = Math.max(10, ...values)
    const barW = chartW / Math.max(1, values.length)

    // Axes
    ctx.strokeStyle = '#94a3b8'
    ctx.beginPath()
    ctx.moveTo(padL, padT)
    ctx.lineTo(padL, padT + chartH)
    ctx.lineTo(padL + chartW, padT + chartH)
    ctx.stroke()

    // Bars
    for (let i = 0; i < values.length; i++) {
      const x = padL + i * barW + 6
      const h = (values[i] / maxV) * chartH
      const y = padT + chartH - h
      ctx.fillStyle = '#22d3ee'
      ctx.fillRect(x, y, Math.max(8, barW - 12), h)
    }

    // Labels (x-axis)
    ctx.fillStyle = '#e5e7eb'
    ctx.font = '10px system-ui'
    for (let i = 0; i < labels.length; i++) {
      const x = padL + i * barW + (barW/2)
      ctx.textAlign = 'center'
      ctx.fillText(labels[i], x, height - 18)
    }

    // Title
    ctx.font = '12px system-ui'
    ctx.textAlign = 'left'
    ctx.fillText('Monthly Revenue (₹)', padL, 14)
  }, [bills])

  return (
    <div className="card p-3">
      <canvas ref={canvasRef} width={800} height={300} />
    </div>
  )
}
