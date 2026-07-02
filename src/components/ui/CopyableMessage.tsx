import { useState } from 'react'
import { Button } from './Button'

export function CopyableMessage({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="rounded-xl bg-ink-900 p-3">
      <pre className="mb-2 max-h-64 overflow-y-auto text-wrap font-sans text-[13px] leading-relaxed whitespace-pre-wrap text-cream-50">
        {text}
      </pre>
      <Button variant="secondary" size="sm" onClick={copy} className="w-full">
        {copied ? '✅ Copiado' : '📋 Copiar para WhatsApp'}
      </Button>
    </div>
  )
}
