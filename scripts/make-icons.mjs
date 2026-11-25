// Dessine l'icône : carte du monde + route Italie → Japon + nom de l'app.
// Données cartographiques : Natural Earth (domaine public) via world-atlas.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { geoMercator, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import sharp from 'sharp'

const size = 1024
const world = JSON.parse(readFileSync('node_modules/world-atlas/land-110m.json', 'utf8'))
const land = feature(world, world.objects.land)

const rome = [12.5, 41.9]
const tokyo = [139.7, 35.7]

// Carte centrée entre l'Italie et le Japon, avec une marge pour les coins arrondis.
const projection = geoMercator()
  .rotate([-76, 0])
  .center([0, 34])
  .scale(325)
  .translate([size / 2, 470])
  .clipExtent([[0, 0], [size, size]])
const path = geoPath(projection)

const [x1, y1] = projection(rome)
const [x2, y2] = projection(tokyo)
const route = `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${Math.min(y1, y2) - 230} ${x2} ${y2}`

const pin = (x, y) => `
  <circle cx="${x}" cy="${y}" r="30" fill="#ffffff"/>
  <circle cx="${x}" cy="${y}" r="16" fill="#8c0b20"/>`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#c8102e"/>
  <path d="${path(land)}" fill="#f3b8c0"/>
  <path d="${route}" fill="none" stroke="#8c0b20" stroke-width="30" stroke-linecap="round"/>
  <path d="${route}" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" stroke-dasharray="26 30"/>
  ${pin(x1, y1)}
  ${pin(x2, y2)}
  <rect x="152" y="696" width="720" height="164" rx="82" fill="#8c0b20"/>
  <text x="512" y="817" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="112" font-weight="700" fill="#ffffff">MezTravel</text>
</svg>`

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon.svg', svg)

for (const [name, pixels] of [
  ['icon-512', 512],
  ['icon-192', 192],
  ['apple-touch-icon', 180],
  ['favicon', 64],
]) {
  await sharp(Buffer.from(svg)).resize(pixels, pixels).png().toFile(`public/icons/${name}.png`)
}
console.log('Icônes créées dans public/icons')
