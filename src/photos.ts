// Réduit les photos sur le téléphone avant de les garder. La nouvelle image ne
// contient plus les informations cachées de l'original (dont la position GPS).
export const maxSide = 1600

export function fitSize(width: number, height: number, max = maxSide) {
  const ratio = Math.min(1, max / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  }
}

export async function shrinkPhoto(file: Blob): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    // Une balise image respecte l'orientation de la photo.
    const image = new Image()
    image.src = url
    await image.decode()
    const size = fitSize(image.naturalWidth, image.naturalHeight)
    const canvas = document.createElement('canvas')
    canvas.width = size.width
    canvas.height = size.height
    const context = canvas.getContext('2d')!
    // Le JPEG n'a pas de transparence : fond blanc.
    context.fillStyle = '#fff'
    context.fillRect(0, 0, size.width, size.height)
    context.drawImage(image, 0, 0, size.width, size.height)
    return await new Promise((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('photo'))),
        'image/jpeg',
        0.82,
      ),
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}
