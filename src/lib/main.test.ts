import { describe, expect, it } from 'vitest'
import recipesData from '../data/recipes.json'
import foodsafetyRecipes from '../data/recipes-foodsafety.json'
import type { Recipe } from './match'
import { findForMain, mainsOf } from './main'
import { formulaRecipes } from './formulas'
import { INGREDIENTS } from './normalize'

const base = [...recipesData, ...foodsafetyRecipes] as Recipe[]
const ALL = [...base, ...formulaRecipes(base)]
const pantry = new Set(INGREDIENTS.filter(i => i.isPantry).map(i => i.id))
const r = (name: string, ids: string[], main?: string[]): Recipe =>
  ({ id: name, name, minutes: 10, steps: [], source: 'manual', main, ingredients: ids.map(id => ({ id, amount: '1' })) })

describe('mainsOf', () => {
  it('요리 이름에 들어간 재료가 주인공이다', () => {
    expect(mainsOf(r('베이컨 가지 말이', ['bacon', 'eggplant', 'onion']))).toEqual(['bacon', 'eggplant'])
  })
  it('긴 이름이 먼저 잡혀서 배추 안의 배는 주인공이 아니다', () => {
    expect(mainsOf(r('배추 겉절이', ['napa', 'pear']))).toEqual(['napa'])
  })
  it('별칭으로도 찾는다 (계란말이 → 달걀)', () => {
    expect(mainsOf(r('계란말이', ['egg', 'pa']))).toEqual(['egg'])
  })
  it('공식 레시피는 정해 둔 주재료를 쓴다', () => {
    expect(mainsOf(r('아무 이름', ['bacon', 'rice'], ['bacon']))).toEqual(['bacon'])
  })
})

describe('formulaRecipes', () => {
  it('베이컨만 있어도 베이컨 볶음밥을 지금 만들 수 있다', () => {
    const { now } = findForMain(ALL, 'bacon', new Set(['bacon']), pantry)
    expect(now.map(m => m.recipe.name)).toContain('베이컨 볶음밥')
  })
  it('고등어만 있어도 고등어구이가 나온다 (식약처 고등어구이와 겹치면 간단 고등어구이)', () => {
    const { now } = findForMain(ALL, 'mackerel', new Set(['mackerel']), pantry)
    expect(now.map(m => m.recipe.name)).toContain('간단 고등어구이')
  })
  it('손으로 쓴 요리와 같은 이름은 다시 만들지 않는다', () => {
    const names = ALL.map(x => x.name.replace(/\s+/g, ''))
    expect(names.filter(n => n === '김치볶음밥')).toHaveLength(1)
  })
  it('모든 공식 레시피의 재료가 재료 사전에 있다', () => {
    const ids = new Set(INGREDIENTS.map(i => i.id))
    for (const x of formulaRecipes(base)) for (const i of x.ingredients) expect(ids.has(i.id), `${x.name}: ${i.id}`).toBe(true)
  })
})

describe('findForMain', () => {
  const recipes = [
    r('베이컨 볶음밥', ['bacon', 'rice'], ['bacon']),
    r('베이컨 김치찌개', ['bacon', 'kimchi'], ['bacon']),
    r('클럽 샌드위치', ['bread', 'bacon', 'egg', 'lettuce', 'tomato', 'cheese']),
    r('스팸 볶음밥', ['spam', 'rice', 'bacon'], ['spam']),
  ]
  it('주인공이 아닌 레시피는 빼고, 부족한 재료가 3개 넘으면 뺀다', () => {
    const { now, more } = findForMain(recipes, 'bacon', new Set(['bacon']), new Set(['rice']))
    expect(now.map(m => m.recipe.name)).toEqual(['베이컨 볶음밥'])
    expect(more.map(m => m.recipe.name)).toEqual(['베이컨 김치찌개'])
  })
  it('부족한 재료 적은 순으로 정렬한다', () => {
    const x = [r('A', ['bacon', 'kimchi', 'tofu']), r('B 베이컨', ['bacon', 'kimchi']), r('C 베이컨', ['bacon', 'kimchi', 'tofu', 'egg'])]
    const { more } = findForMain(x, 'bacon', new Set(['bacon']), new Set())
    expect(more.map(m => m.recipe.id)).toEqual(['B 베이컨', 'C 베이컨'])
  })
})
