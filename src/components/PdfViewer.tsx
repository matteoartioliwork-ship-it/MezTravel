// Affiche le PDF dans l'app : fiable sur iPhone et utilisable sans internet.
import { useEffect, useRef, useState } from 'react'
import { saveFile } from '../files'
import { getFile } from '../fileStore'
import type { Dictionary } from '../i18n'
import { openPdf } from '../pdf'

type Props = { t: Dictionary; file: { id: string; name: string }; onClose: () => void }

export default function PdfViewer({ t, file, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const pages = useRef<HTMLDivElement>(null)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading')

  useEffect(() => {
    if (!dialog.current!.open) dialog.current!.showModal()
  }, [])

  useEffect(() => {
    let active = true
    let destroy: (() => void) | undefined

    async function show() {
      const stored = await getFile(file.id)
      if (!active) return
      if (!stored) return setState('missing')
      setBlob(stored)
      const task = await openPdf(stored)
      destroy = () => void task.destroy()
      const pdf = await task.promise
      pages.current!.replaceChildren()
      for (let n = 1; n <= pdf.numPages && active; n++) {
        const page = await pdf.getPage(n)
        // Assez net pour les codes QR, sans dépasser la mémoire d'un téléphone.
        const width = page.getViewport({ scale: 1 }).width
        const viewport = page.getViewport({ scale: Math.min(3, 1400 / width) })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        pages.current?.append(canvas)
        await page.render({ canvas, viewport }).promise
        if (active) setState('ready')
      }
    }

    show().catch(() => active && setState('error'))
    return () => {
      active = false
      destroy?.()
    }
  }, [file.id])

  return (
    <dialog ref={dialog} className="viewer" onClose={onClose}>
      <div className="viewer-bar">
        <button type="button" onClick={onClose}>
          {t.close}
        </button>
        {blob && (
          <button type="button" onClick={() => saveFile(file.name, blob, 'application/pdf')}>
            {t.sharePdf}
          </button>
        )}
      </div>
      <p className="muted">{file.name}</p>
      {state === 'loading' && <p role="status">{t.pdfLoading}</p>}
      {state === 'missing' && <p role="alert">{t.pdfMissing}</p>}
      {state === 'error' && <p role="alert">{t.pdfError}</p>}
      <div ref={pages} className="viewer-pages" />
    </dialog>
  )
}
