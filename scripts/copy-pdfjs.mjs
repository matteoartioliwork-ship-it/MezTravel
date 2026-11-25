// Copie les fichiers dont le lecteur PDF a besoin (polices, caractères japonais,
// images de documents scannés) pour qu'ils soient servis par l'app, sans service externe.
import { cpSync, rmSync } from 'node:fs'

rmSync('public/pdfjs', { recursive: true, force: true })
for (const folder of ['cmaps', 'standard_fonts', 'wasm']) {
  cpSync(`node_modules/pdfjs-dist/${folder}`, `public/pdfjs/${folder}`, { recursive: true })
}
