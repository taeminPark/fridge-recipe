import type { Match, Recipe } from './match'
import { BY_ID } from './normalize'

const key = (s: string) => s.replace(/\s+/g, '')
const cache = new Map<string, string[]>()

/** 레시피의 주인공 재료: 요리 이름에 이름·별칭이 나오는 필수 재료 + 공식 레시피에 정해 둔 주재료 */
export function mainsOf(recipe: Recipe): string[] {
  let mains = cache.get(recipe.id)
  if (mains) return mains
  let name = key(recipe.name)
  // 긴 이름부터 지워 가며 찾는다: '배추'를 먼저 잡아야 그 안의 '배'(과일)가 잡히지 않는다
  const words = recipe.ingredients.filter(i => !i.optional).flatMap(i => {
    const ing = BY_ID.get(i.id)
    return ing ? [ing.name, ...ing.aliases].map(w => ({ id: i.id, w: key(w) })) : []
  }).sort((a, b) => b.w.length - a.w.length)
  const found = new Set<string>(recipe.main)
  for (const { id, w } of words) {
    if (w && name.includes(w)) { found.add(id); name = name.replaceAll(w, '|') }
  }
  mains = recipe.ingredients.map(i => i.id).filter(id => found.has(id))
  cache.set(recipe.id, mains)
  return mains
}

const MAX_MISSING = 3

/** mainId가 주인공인 레시피. 부족한 재료가 3개 이하인 것만, 적게 부족한 순 → 내 재료 많이 쓰는 순 */
export function findForMain(recipes: Recipe[], mainId: string, myIds: Set<string>, pantryIds: Set<string>) {
  const now: Match[] = []
  const more: Match[] = []
  for (const recipe of recipes) {
    if (!mainsOf(recipe).includes(mainId)) continue
    const required = recipe.ingredients.filter(i => !i.optional)
    const missing = required.filter(i => !myIds.has(i.id) && !pantryIds.has(i.id))
    if (missing.length > MAX_MISSING) continue
    const used = required.filter(i => myIds.has(i.id)).length
    const m: Match = { recipe, tier: missing.length === 0 ? 'now' : 'oneMore', used, missing }
    ;(missing.length === 0 ? now : more).push(m)
  }
  const sort = (a: Match, b: Match) => a.missing.length - b.missing.length || b.used - a.used
  return { now: now.sort(sort), more: more.sort(sort) }
}
