// Les PDF sont gardés dans IndexedDB, la mémoire du navigateur prévue pour les fichiers.
// On enregistre les octets (et non un objet Blob), plus fiable sur d'anciens iPhone.
type Stored = { bytes: ArrayBuffer }

const storeName = 'files'

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('meztravel', 1)
    request.onupgradeneeded = () => request.result.createObjectStore(storeName)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function run<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  const database = await open()
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const transaction = database.transaction(storeName, mode)
      const request = action(transaction.objectStore(storeName))
      // On attend la fin de la transaction : le fichier est alors vraiment écrit.
      transaction.oncomplete = () => resolve(request ? request.result : undefined)
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally {
    database.close()
  }
}

// Tout est écrit en une seule fois : en cas d'échec, rien n'est enregistré.
export async function putFiles(files: { id: string; bytes: ArrayBuffer }[]): Promise<void> {
  await run('readwrite', (store) => {
    for (const { id, bytes } of files) store.put({ bytes } satisfies Stored, id)
  })
}

export async function getFile(id: string): Promise<Blob | null> {
  const stored = (await run('readonly', (store) => store.get(id))) as Stored | undefined
  return stored ? new Blob([stored.bytes], { type: 'application/pdf' }) : null
}

export async function deleteFiles(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  await run('readwrite', (store) => {
    for (const id of ids) store.delete(id)
  })
}
