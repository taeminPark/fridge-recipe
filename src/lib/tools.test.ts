import { describe, expect, it } from 'vitest'
import type { Recipe } from './match'
import { canMake, requiredTools } from './tools'

let n = 0
const recipe = (...steps: string[]): Recipe => ({ id: `t${n++}`, name: '', minutes: null, ingredients: [], steps, source: 'manual' })

describe('requiredTools', () => {
  it('오븐이나 에어프라이어로 굽는 요리는 둘 중 하나가 필요하다', () => {
    expect(requiredTools(recipe('180℃로 예열한 오븐에 10분 굽는다.'))).toEqual([['oven', 'airfryer']])
    expect(requiredTools(recipe('고등어는 에어프라이어에 넣어 굽는다.'))).toEqual([['oven', 'airfryer']])
  })
  it('오븐이라는 말 없이 온도만 적힌 빵 굽기도 알아본다 (고구마 공갈빵)', () => {
    expect(requiredTools(recipe('팬닝된 반죽을 눌러준다.', '190℃에서 15분 정도 굽는다.'))).toEqual([['oven', 'airfryer']])
  })
  it('튀김 기름 온도는 오븐이 아니다', () => {
    expect(requiredTools(recipe('170℃ 기름에서 튀긴다.'))).toEqual([])
  })
  it("'팬 또는 오븐'이면 오븐이 없어도 된다", () => {
    expect(requiredTools(recipe('팬 또는 오븐(180℃, 15분)에 노릇하게 굽는다.'))).toEqual([])
  })
  it('전자레인지와 믹서기', () => {
    expect(requiredTools(recipe('단호박은 전자레인지에 2분 돌린다.', '믹서기에 곱게 간다.'))).toEqual([['microwave'], ['blender']])
    expect(requiredTools(recipe('전자렌지에 치즈가 녹을 정도로 익힌다.'))).toEqual([['microwave']])
  })
})

describe('canMake', () => {
  const baked = recipe('오븐에 굽는다.')
  it('오븐을 꺼도 에어프라이어가 있으면 만들 수 있다', () => {
    expect(canMake(baked, new Set(['oven']))).toBe(true)
    expect(canMake(baked, new Set(['oven', 'airfryer']))).toBe(false)
  })
  it('도구가 필요 없는 요리는 언제나 만들 수 있다', () => {
    expect(canMake(recipe('끓인다.'), new Set(['oven', 'airfryer', 'microwave', 'blender']))).toBe(true)
  })
})
