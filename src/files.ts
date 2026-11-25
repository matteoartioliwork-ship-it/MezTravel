// Sur iPhone, le menu de partage permet d'enregistrer dans « Fichiers » ;
// ailleurs, le fichier est téléchargé.
export async function saveFile(
  name: string,
  content: BlobPart,
  type = 'application/json',
): Promise<boolean> {
  const file = new File([content], name, { type })
  const touch = window.matchMedia('(pointer: coarse)').matches

  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return true
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return false
      // Partage refusé : on essaie le téléchargement.
    }
  }

  download(file)
  return true
}

export function download(file: File): void {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
