'use client'

import { useState } from 'react'
import { recalculateAllPoints } from './actions'

export default function RecalculateButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handle() {
    setLoading(true)
    setResult(null)
    try {
      const res = await recalculateAllPoints()
      if (res?.ok) {
        setResult(`✓ ${res.updated} predicciones actualizadas`)
      } else {
        setResult('Error al recalcular')
      }
    } catch {
      setResult('Error al recalcular')
    }
    setLoading(false)
    setTimeout(() => setResult(null), 4000)
  }

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className={`text-xs font-bold ${result.startsWith('✓') ? 'text-[#00A651]' : 'text-[#C8102E]'}`}>
          {result}
        </span>
      )}
      <button
        onClick={handle}
        disabled={loading}
        className="px-4 py-2 text-sm font-bold bg-[#003087] hover:bg-[#00246b] text-white rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? 'Calculando...' : '🔄 Recalcular todos'}
      </button>
    </div>
  )
}
