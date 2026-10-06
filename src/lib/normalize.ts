import ingredients from '../data/ingredients.json' with { type: 'json' }

export type Ingredient = {
  id: string
  name: string
  aliases: string[]
  category: string
  isPantry: boolean
  isAromatic?: boolean
  emoji: string
}

export const INGREDIENTS = ingredients as Ingredient[]
export const BY_ID = new Map(INGREDIENTS.map(i => [i.id, i]))
export const AROMATIC_IDS = new Set(INGREDIENTS.filter(i => i.isAromatic).map(i => i.id))

const key = (s: string) => s.replace(/\s+/g, '')

const LOOKUP = new Map<string, string>()
for (const i of INGREDIENTS) {
  for (const n of [i.name, ...i.aliases]) LOOKUP.set(key(n), i.id)
}

/** 재료명(동의어 포함) → 표준 ID. 사전에 없으면 null */
export function normalize(name: string): string | null {
  return LOOKUP.get(key(name)) ?? null
}

/** 자동완성: 이름·별칭이 검색어를 포함하는 재료. 앞에서 일치하는 것 우선 */
export function search(query: string, limit = 8): Ingredient[] {
  const q = key(query)
  if (!q) return []
  const scored: [number, Ingredient][] = []
  for (const i of INGREDIENTS) {
    const names = [i.name, ...i.aliases].map(key)
    if (names.some(n => n.startsWith(q))) scored.push([0, i])
    else if (names.some(n => n.includes(q))) scored.push([1, i])
  }
  return scored.sort((a, b) => a[0] - b[0]).slice(0, limit).map(s => s[1])
}
