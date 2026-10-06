import { describe, expect, it } from 'vitest'
import { normalize } from './normalize'
import { findRecipes, match, type Recipe } from './match'

const friedRice: Recipe = {
  id: 'r1', name: '대파 달걀볶음밥', minutes: 15, steps: [], source: 'manual',
  ingredients: [
    { id: 'rice', amount: '1공기' },
    { id: 'egg', amount: '2개' },
    { id: 'pa', amount: '1/2대' },
    { id: 'soy_sauce', amount: '1큰술' },
    { id: 'sesame', amount: '약간', optional: true },
  ],
}
const pantry = new Set(['soy_sauce', 'salt'])

describe('normalize', () => {
  it('동의어를 같은 표준 ID로 바꾼다', () => {
    expect(normalize('계란')).toBe('egg')
    expect(normalize('달걀')).toBe('egg')
    expect(normalize('쪽파')).toBe('pa')
    expect(normalize('돼지고기 앞다리')).toBe('pork')
  })
  it('공백 차이를 무시한다', () => {
    expect(normalize(' 대 파 ')).toBe('pa')
  })
  it('모르는 재료는 null', () => {
    expect(normalize('용가리치킨')).toBeNull()
  })
})

describe('match', () => {
  it('동의어로 입력한 재료도 매칭된다', () => {
    const mine = new Set(['밥', '계란', '쪽파'].map(n => normalize(n)!))
    expect(match(friedRice, mine, pantry)?.tier).toBe('now')
  })
  it('기본 양념은 내 재료에 없어도 부족으로 치지 않는다', () => {
    const r = match(friedRice, new Set(['rice', 'egg', 'pa']), pantry)
    expect(r?.missing).toEqual([])
  })
  it('기본 양념을 끄면 부족 재료가 된다', () => {
    const r = match(friedRice, new Set(['rice', 'egg', 'pa']), new Set())
    expect(r?.tier).toBe('oneMore')
    expect(r?.missing.map(i => i.id)).toEqual(['soy_sauce'])
  })
  it('optional 재료는 없어도 감점하지 않는다', () => {
    const r = match(friedRice, new Set(['rice', 'egg', 'pa']), pantry)
    expect(r?.tier).toBe('now')
  })
  it('1개 부족이면 oneMore와 부족 재료를 돌려준다', () => {
    const r = match(friedRice, new Set(['rice', 'egg']), pantry)
    expect(r?.tier).toBe('oneMore')
    expect(r?.missing.map(i => i.id)).toEqual(['pa'])
  })
  it('내 재료를 하나도 안 쓰는 레시피는 숨긴다 (계란만 있는데 멸치볶음이 나오면 안 됨)', () => {
    const anchovy: Recipe = { ...friedRice, id: 'r9', name: '멸치볶음',
      ingredients: [{ id: 'anchovy', amount: '1컵' }, { id: 'soy_sauce', amount: '1큰술' }] }
    expect(match(anchovy, new Set(['egg']), pantry)).toBeNull()
  })
  it('optional로만 쓰이는 내 재료는 사용으로 치지 않는다', () => {
    const garnish: Recipe = { ...friedRice, id: 'r8',
      ingredients: [{ id: 'kimchi', amount: '1컵' }, { id: 'egg', amount: '1개', optional: true }] }
    expect(match(garnish, new Set(['egg']), pantry)).toBeNull()
  })
  it('대파·양파 같은 향신 채소만 겹치는 레시피는 숨긴다 (대파만 있는데 콩나물무침이 나오면 안 됨)', () => {
    const sprout: Recipe = { ...friedRice, id: 'r7', name: '콩나물무침',
      ingredients: [{ id: 'bean_sprout', amount: '1봉' }, { id: 'pa', amount: '1/4대' }] }
    expect(match(sprout, new Set(['pa']), pantry, new Set(['pa']))).toBeNull()
    expect(match(sprout, new Set(['bean_sprout']), pantry, new Set(['pa']))?.tier).toBe('oneMore')
  })
  it('2개 이상 부족하면 null', () => {
    expect(match(friedRice, new Set(['rice']), pantry)).toBeNull()
  })
  it('used는 기본 양념을 빼고 내 재료만 센다', () => {
    expect(match(friedRice, new Set(['rice', 'egg', 'pa', 'soy_sauce']), pantry)?.used).toBe(4)
    expect(match(friedRice, new Set(['rice', 'egg', 'pa']), pantry)?.used).toBe(3)
  })
})

describe('findRecipes', () => {
  const quick: Recipe = { ...friedRice, id: 'r2', name: '빠른 것', minutes: 5,
    ingredients: [{ id: 'egg', amount: '1개' }, { id: 'rice', amount: '1공기' }] }
  const big: Recipe = { ...friedRice, id: 'r3', name: '많이 쓰는 것', minutes: 30 }
  const slowSmall: Recipe = { ...quick, id: 'r4', name: '느린 것', minutes: 20 }

  it('사용하는 내 재료 수 많은 순 → 조리시간 짧은 순', () => {
    const { now } = findRecipes([slowSmall, quick, big], new Set(['rice', 'egg', 'pa']), pantry)
    expect(now.map(r => r.recipe.id)).toEqual(['r3', 'r2', 'r4'])
  })
  it('두 섹션으로 나눈다', () => {
    const { now, oneMore } = findRecipes([quick, big], new Set(['rice', 'egg']), pantry)
    expect(now.map(r => r.recipe.id)).toEqual(['r2'])
    expect(oneMore.map(r => r.recipe.id)).toEqual(['r3'])
  })
})
