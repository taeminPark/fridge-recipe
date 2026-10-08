export type RecipeIngredient = { id: string; amount: string; optional?: boolean }
export type Recipe = {
  id: string
  name: string
  minutes: number | null // 공공 레시피는 조리시간 정보가 없다
  ingredients: RecipeIngredient[]
  steps: string[]
  image?: string
  source: string
  main?: string[] // 공식 레시피의 주재료 (요리 이름에서 찾는 주인공에 더한다)
}
export type Match = { recipe: Recipe; tier: 'now' | 'oneMore'; used: number; missing: RecipeIngredient[] }

/** aromaticIds: 대파·양파처럼 어디에나 들어가 '이 재료로 만드는 요리'의 근거가 되지 못하는 재료 */
export function match(recipe: Recipe, myIds: Set<string>, pantryIds: Set<string>, aromaticIds: Set<string> = new Set()) {
  const required = recipe.ingredients.filter(i => !i.optional)
  const missing = required.filter(i => !myIds.has(i.id) && !pantryIds.has(i.id))
  const used = required.filter(i => myIds.has(i.id)).length
  // 내 재료 중 향신 채소가 아닌 것을 최소 1개는 써야 한다 (계란만 있는데 멸치볶음, 대파만 있는데 콩나물무침 방지)
  if (!required.some(i => myIds.has(i.id) && !aromaticIds.has(i.id))) return null
  if (missing.length === 0) return { tier: 'now' as const, used, missing }
  if (missing.length === 1) return { tier: 'oneMore' as const, used, missing }
  return null
}

const minutes = (r: Recipe) => r.minutes ?? Infinity
const byUsefulness = (a: Match, b: Match) => b.used - a.used || minutes(a.recipe) - minutes(b.recipe)

export function findRecipes(recipes: Recipe[], myIds: Set<string>, pantryIds: Set<string>, aromaticIds?: Set<string>) {
  const now: Match[] = []
  const oneMore: Match[] = []
  for (const recipe of recipes) {
    const m = match(recipe, myIds, pantryIds, aromaticIds)
    if (m) (m.tier === 'now' ? now : oneMore).push({ recipe, ...m })
  }
  return { now: now.sort(byUsefulness), oneMore: oneMore.sort(byUsefulness) }
}
