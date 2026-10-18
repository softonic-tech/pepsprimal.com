/**
 * Upserts selected catalog products + variants into Supabase.
 * Usage: node scripts/seed-new-products.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { PRODUCTS } from '../src/data/products.js'

const NEW_IDS = new Set([
  '5amino',
  'cjcdac',
  'cjcnodac',
  'ipa',
  'dsip',
  'hcg',
  'glutathione',
  'kisspeptin',
  'epithalon',
  'mots', // include so 20mg variant upserts
])

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function readEnv(path) {
  const out = {}
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!m) continue
    out[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '')
  }
  return out
}

const env = readEnv(resolve(root, '.env'))
const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const selected = PRODUCTS.filter((p) => NEW_IDS.has(p.id))

const productRows = selected.map((p) => ({
  id: p.id,
  name: p.name,
  aka: p.aka || [],
  sub: p.sub,
  tag: p.tag,
  cat: p.cat,
  category_label: p.categoryLabel || '',
  cas: p.cas,
  mw: p.mw,
  lot: p.lot,
  form: p.form,
  purity: p.purity,
  storage_lyophilised: p.storageLyophilised,
  storage_reconstituted: p.storageReconstituted,
  reconstitution: p.reconstitution,
  composition: p.composition || [],
  perks: p.perks || [],
  research_focus: p.researchFocus || [],
  description: p.description,
  story: p.story,
  hue: p.hue,
  active: true,
  sort_order: PRODUCTS.findIndex((x) => x.id === p.id),
}))

const { error: pErr } = await supabase.from('products').upsert(productRows, {
  onConflict: 'id',
})
if (pErr) {
  console.error('products upsert failed:', pErr.message)
  process.exit(1)
}
console.log(`Upserted ${productRows.length} products`)

for (const p of selected) {
  for (const [vi, v] of p.variants.entries()) {
    const row = {
      product_id: p.id,
      variant_key: v.id,
      label: v.label,
      price: Number(v.price),
      img: v.img,
      stock: 100,
      active: true,
      sort_order: vi,
    }
    const { error } = await supabase.from('product_variants').upsert(row, {
      onConflict: 'product_id,variant_key',
    })
    if (error) {
      console.error(`variant ${p.id}/${v.id} failed:`, error.message)
      process.exit(1)
    }
  }
}

const variantCount = selected.reduce((n, p) => n + p.variants.length, 0)
console.log(`Upserted ${variantCount} variants`)

const { data, error: qErr } = await supabase
  .from('products')
  .select('id, name, product_variants(variant_key, label, price, img)')
  .in('id', [...NEW_IDS])
  .order('id')

if (qErr) {
  console.error('verify failed:', qErr.message)
  process.exit(1)
}

for (const row of data || []) {
  const keys = (row.product_variants || []).map((v) => v.variant_key).join(', ')
  console.log(`OK ${row.id} — ${row.name} [${keys}]`)
}
