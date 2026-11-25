// Sur iPhone, le menu de partage permet d'enregistrer dans « Fichiers » ;
// ailleurs, le fichier est téléchargé.
export async function saveFile(name: string, text: string): Promise<boolean> {
  const file = new File([text], name, { type: 'application/json' })
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

  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return true
}
