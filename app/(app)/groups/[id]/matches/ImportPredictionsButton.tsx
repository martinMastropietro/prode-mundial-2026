'use client'

import { useState, useTransition } from 'react'
import { importPredictions } from './importActions'

type SourceGroup = { id: string; name: string; public_id: string; count: number }

type Props = {
  targetGroupId: string
  sourceGroups: SourceGroup[]
}

export default function ImportPredictionsButton({ targetGroupId, sourceGroups }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<SourceGroup | null>(null)
  const [result, setResult] = useState<{ success?: boolean; count?: number; error?: string } | null>(null)
  const [pending, startTransition] = useTransition()

  if (sourceGroups.length === 0) return null

  function handleImport() {
    if (!selected) return
    setResult(null)
    startTransition(async () => {
      const res = await importPredictions(selected.id, targetGroupId)
      setResult(res)
      if (res.success) {
        setOpen(false)
        setSelected(null)
      }
    })
  }

  return (
    <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2D4A] p-4 mb-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">Importar predicciones</p>
          <p className="text-[#8B8FA8] text-xs mt-0.5">
            Copiá las predicciones de otro grupo. Cada grupo sigue siendo independiente.
          </p>
        </div>
        <button
          onClick={() => { setOpen(!open); setResult(null) }}
          className="text-xs font-bold px-3 py-1.5 bg-[#003087] hover:bg-[#00246b] text-white rounded-lg transition-colors ml-4 flex-shrink-0"
        >
          {open ? 'Cerrar' : '📥 Importar'}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-[#8B8FA8]">
            Elegí el grupo de origen. Solo se importan predicciones de partidos que todavía no empezaron.
          </p>

          <div className="grid gap-2">
            {sourceGroups.map(g => (
              <button
                key={g.id}
                onClick={() => setSelected(selected?.id === g.id ? null : g)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-colors text-left ${
                  selected?.id === g.id
                    ? 'bg-[#003087]/30 border-[#003087] text-white'
                    : 'bg-[#0D0D1A] border-[#2A2D4A] text-[#D0D0D0] hover:border-[#003087]/50'
                }`}
              >
                <div>
                  <span className="font-medium">{g.name}</span>
                  <span className="text-[#8B8FA8] ml-2 text-xs font-mono">{g.public_id}</span>
                </div>
                <span className="text-[#8B8FA8] text-xs flex-shrink-0">
                  {g.count} predicción{g.count !== 1 ? 'es' : ''}
                </span>
              </button>
            ))}
          </div>

          {selected && (
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleImport}
                disabled={pending}
                className="flex-1 py-2.5 bg-[#C8102E] hover:bg-[#a50d26] disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm"
              >
                {pending
                  ? 'Importando...'
                  : `Importar desde "${selected.name}"`}
              </button>
              <button
                onClick={() => setSelected(null)}
                className="px-3 py-2.5 text-[#8B8FA8] hover:text-white border border-[#2A2D4A] rounded-xl text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}

          {result?.success && (
            <div className="bg-[#00A651]/10 border border-[#00A651]/30 rounded-xl px-4 py-3 text-sm text-[#00A651] font-medium">
              ✓ {result.count} predicciones importadas. Podés editarlas libremente.
            </div>
          )}
          {result?.error && (
            <div className="bg-[#C8102E]/10 border border-[#C8102E]/30 rounded-xl px-4 py-3 text-sm text-[#C8102E]">
              {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
