// Zero-dependency PWA icon generator.
// Produces brand-green rounded icons with a white medical cross.
// Uses only Node built-ins (zlib + fs). Runs via predev/prebuild hooks.
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public')
mkdirSync(outDir, { recursive: true })

// ---------- Minimal PNG encoder ----------
const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = -1
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crc])
}

function encodePng(w, h, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  const stride = w * 4 + 1
  const raw = Buffer.alloc(stride * h)
  for (let y = 0; y < h; y++) {
    raw[y * stride] = 0 // filter: none
    rgba.copy(raw, y * stride + 1, y * w * 4, (y + 1) * w * 4)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

// ---------- Drawing helpers (4x supersampled) ----------
const BRAND = [4, 171, 108] // #04AB6C
const WHITE = [255, 255, 255]

function inRoundedRect(x, y, size, radius) {
  const min = radius
  const max = size - radius
  if (x < min && y < min) return (x - min) ** 2 + (y - min) ** 2 <= radius ** 2
  if (x > max && y < min) return (x - max) ** 2 + (y - min) ** 2 <= radius ** 2
  if (x < min && y > max) return (x - min) ** 2 + (y - max) ** 2 <= radius ** 2
  if (x > max && y > max) return (x - max) ** 2 + (y - max) ** 2 <= radius ** 2
  return true
}

function inCross(x, y, size, armW, armL, round) {
  const c = size / 2
  const halfW = armW / 2
  const halfL = armL / 2
  // horizontal bar
  const inH = y >= c - halfW && y <= c + halfW && x >= c - halfL && x <= c + halfL
  // vertical bar
  const inV = x >= c - halfW && x <= c + halfW && y >= c - halfL && y <= c + halfL
  if (!round) return inH || inV
  const r = halfW
  const corners = [
    [c - halfL + r, c - halfW + r],
    [c + halfL - r, c - halfW + r],
    [c - halfL + r, c + halfW - r],
    [c + halfL - r, c + halfW - r]
  ]
  const inBar = inH || inV
  if (inBar) {
    // must not fall into the "outer corner" of each bar end
    for (const [cx, cy] of corners) {
      const dx = Math.abs(x - cx)
      const dy = Math.abs(y - cy)
      if (dx > r || dy > r) continue
      if (dx > 0 && dy > 0 && dx * dx + dy * dy > r * r) return false
    }
  }
  return inBar
}

/**
 * Render icon.
 * @param {number} size final PNG size
 * @param {object} opts { maskable:boolean, withBackground:boolean }
 */
function renderIcon(size, opts = {}) {
  const SS = 4
  const s = size * SS
  const rgba = Buffer.alloc(size * size * 4)
  const radiusRatio = opts.maskable ? 0 : 0.22
  const radius = s * radiusRatio
  const bgPad = opts.maskable ? 0 : 0
  const crossScale = opts.maskable ? 0.42 : 0.58 // arm length ratio (of size)
  const armL = s * crossScale
  const armW = armL * 0.34
  const coverage = new Float32Array(s * s) // supersample coverage per pixel

  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      let color = null
      if (opts.withBackground !== false && inRoundedRect(x, y, s, radius) && (bgPad === 0 || true)) {
        if (radiusRatio === 0 || inRoundedRect(x, y, s, radius)) color = BRAND
      }
      if (inCross(x, y, s, armW, armL, true)) color = WHITE
      if (color) coverage[y * s + x] = 1
    }
  }

  // Downsample into final RGBA
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let cov = 0
      let white = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const gx = px * SS + sx
          const gy = py * SS + sy
          if (coverage[gy * s + gx]) {
            cov++
            // decide color at supersample resolution (white cross over brand bg)
            if (inCross(gx, gy, s, armW, armL, true)) white++
          }
        }
      }
      const idx = (py * size + px) * 4
      if (cov === 0) {
        rgba[idx + 3] = 0
      } else {
        const wFrac = white / cov
        const base = wFrac > 0.5 ? WHITE : BRAND
        const a = cov / (SS * SS)
        rgba[idx] = base[0]
        rgba[idx + 1] = base[1]
        rgba[idx + 2] = base[2]
        rgba[idx + 3] = Math.round(a * 255)
      }
    }
  }
  return encodePng(size, size, rgba)
}

const targets = [
  { file: 'pwa-192x192.png', size: 192, opts: {} },
  { file: 'pwa-512x512.png', size: 512, opts: {} },
  { file: 'apple-touch-icon.png', size: 180, opts: {} },
  { file: 'maskable-icon-512.png', size: 512, opts: { maskable: true } }
]

for (const t of targets) {
  const png = renderIcon(t.size, t.opts)
  writeFileSync(join(outDir, t.file), png)
  console.log(`[icons] generated ${t.file} (${png.length} bytes)`)
}
console.log('[icons] done')
