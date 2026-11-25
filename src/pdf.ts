// Lecture des PDF sur le téléphone avec pdf.js. Rien n'est envoyé sur internet.
// Version « legacy » : compatible avec des iPhone moins récents.
// Chargée seulement quand on en a besoin.
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'

const assets = `${import.meta.env.BASE_URL}pdfjs/`

export async function openPdf(blob: Blob) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
  return pdfjs.getDocument({
    data: new Uint8Array(await blob.arrayBuffer()),
    cMapUrl: `${assets}cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${assets}standard_fonts/`,
    wasmUrl: `${assets}wasm/`,
  })
}

const maxTextPages = 10

export async function readPdfText(blob: Blob): Promise<string> {
  const task = await openPdf(blob)
  try {
    const document = await task.promise
    const pages: string[] = []
    for (let n = 1; n <= Math.min(document.numPages, maxTextPages); n++) {
      const content = await (await document.getPage(n)).getTextContent()
      pages.push(
        content.items.map((item) => ('str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '')).join(''),
      )
    }
    return pages.join('\n')
  } finally {
    await task.destroy()
  }
}
