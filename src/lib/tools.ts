import type { Recipe } from './match'

export type ToolId = 'oven' | 'airfryer' | 'microwave' | 'blender'

export const TOOLS: { id: ToolId; name: string; emoji: string }[] = [
  { id: 'oven', name: '오븐', emoji: '🔥' },
  { id: 'airfryer', name: '에어프라이어', emoji: '🍟' },
  { id: 'microwave', name: '전자레인지', emoji: '📡' },
  { id: 'blender', name: '믹서기', emoji: '🌀' },
]

/** 레시피 단계 글에서 찾는 도구. 하나의 need는 그중 하나만 있으면 된다 (오븐 ↔ 에어프라이어) */
const NEEDS: { anyOf: ToolId[]; pattern: RegExp }[] = [
  // '190℃에서 15분 굽는다'처럼 오븐이라는 말 없이 굽는 빵 레시피도 있다
  { anyOf: ['oven', 'airfryer'], pattern: /오븐|에어\s?프라이|윗\s?불|아랫\s?불|℃에서[^.]*굽/ },
  { anyOf: ['microwave'], pattern: /전자\s?레인지|전자렌지/ },
  { anyOf: ['blender'], pattern: /믹서|블렌더/ },
]

const cache = new Map<string, ToolId[][]>()

/** 레시피에 필요한 도구 묶음들. 각 묶음에서 하나씩은 있어야 만들 수 있다 */
export function requiredTools(recipe: Recipe): ToolId[][] {
  let needs = cache.get(recipe.id)
  if (!needs) {
    // '팬 또는 오븐에 굽는다'는 오븐이 없어도 된다
    const text = recipe.steps.join('\n').replace(/팬\s*또는\s*오븐/g, '팬')
    needs = NEEDS.filter(n => n.pattern.test(text)).map(n => n.anyOf)
    cache.set(recipe.id, needs)
  }
  return needs
}

export const canMake = (recipe: Recipe, toolsOff: Set<string>) =>
  requiredTools(recipe).every(anyOf => anyOf.some(t => !toolsOff.has(t)))
