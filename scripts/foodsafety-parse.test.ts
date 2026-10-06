import { describe, expect, it } from 'vitest'
import { cleanStep, householdAmount, parseParts } from './foodsafety-parse'

const names = (r: ReturnType<typeof parseParts>) => r.map(p => p.name)

describe('parseParts', () => {
  it('첫 줄의 요리명 제목과 [1인분] 표기를 건너뛴다', () => {
    const r = parseParts('[1인분]조선부추 50g, 날콩가루 7g(1⅓작은술)')
    expect(names(r)).toEqual(['조선부추', '날콩가루'])
    expect(r[0].amount).toBe('50g')
  })
  it('"·양념장 :", "●소스 :" 같은 소제목 뒤의 재료만 읽는다', () => {
    const r = parseParts('●방울토마토 소박이 : \n방울토마토 150g(5개), 양파 10g(3×1cm)\n●양념장 : \n고춧가루 4g(1작은술), 다진 마늘 2.5g(1/2쪽)')
    expect(names(r)).toEqual(['방울토마토', '양파', '고춧가루', '다진 마늘'])
  })
  it('줄 중간의 "소제목:"은 그 항목에서만 떼어낸다', () => {
    const r = parseParts('쇠고기 40g, 홍피망 8g, 식용유 9g [소스소개]쇠고기밑간양념:전분 2g, 달걀 2g')
    expect(names(r)).toEqual(['쇠고기', '홍피망', '식용유', '전분', '달걀'])
  })
  it('"돼지고기(50g)"처럼 양 전체가 괄호 안에 있어도 읽는다', () => {
    const r = parseParts('돼지고기(50g), 저염간장(20g)')
    expect(r.map(p => [p.name, p.amount])).toEqual([['돼지고기', '50g'], ['저염간장', '20g']])
  })
  it('재료 없는 제목 줄은 건너뛴다', () => {
    expect(names(parseParts('새우두부계란찜\n연두부 75g(3/4모), 달걀 30g(1/2개)'))).toEqual(['연두부', '달걀'])
  })
  it('고명 아래 재료와 "약간"인 재료는 optional', () => {
    const r = parseParts('달걀 30g(1/2개), 참깨 약간\n고명\n시금치 10g(3줄기)')
    expect(r.map(p => [p.name, p.optional])).toEqual([['달걀', false], ['참깨', true], ['시금치', true]])
  })
  it('줄 끝 쉼표와 물은 무시한다', () => {
    expect(names(parseParts('북어채 25g(15개), 양파 40g(1/4개),\n물 300ml(1½컵)'))).toEqual(['북어채', '양파'])
  })
})

describe('cleanStep', () => {
  it('앞 번호와 끝에 붙은 군더더기 영문자를 지운다', () => {
    expect(cleanStep('1. 손질된 새우를 끓는 물에 데쳐 건진다.a')).toBe('손질된 새우를 끓는 물에 데쳐 건진다.')
    expect(cleanStep('3. 찜기에 넣고 10분 정도 찐다.c ')).toBe('찜기에 넣고 10분 정도 찐다.')
  })
  it('문장 중간 줄바꿈을 공백으로, 깨진 곱하기 기호(?)를 ×로 바꾼다', () => {
    expect(cleanStep('소금, 후춧가루로\n밑간을 한다.')).toBe('소금, 후춧가루로 밑간을 한다.')
    expect(cleanStep('2cm ? 2cm 크기로 썬다.')).toBe('2cm×2cm 크기로 썬다.')
  })
})

describe('householdAmount', () => {
  it('괄호 안 가정용 계량이 있으면 그것을 쓴다', () => {
    expect(householdAmount('3g(2/3작은술)', true)).toBe('2/3작은술')
    expect(householdAmount('75g(3/4모)', false)).toBe('3/4모')
    expect(householdAmount('20g(5마리)', false)).toBe('5마리')
  })
  it('괄호가 크기(cm)면 그램을 그대로 둔다', () => {
    expect(householdAmount('10g(3×1cm)', false)).toBe('10g')
  })
  it('그램만 있는 양념은 큰술·작은술로 바꾼다 (1큰술=15g, 1작은술=5g)', () => {
    expect(householdAmount('9g', true)).toBe('1/2큰술')
    expect(householdAmount('15ml', true)).toBe('1큰술')
    expect(householdAmount('22g', true)).toBe('1.5큰술')
    expect(householdAmount('5g', true)).toBe('1작은술')
    expect(householdAmount('2g', true)).toBe('1/3작은술')
    expect(householdAmount('0.2g', true)).toBe('약간')
  })
  it('"1마리(220g)"는 가정용 단위를 남기고, 짝 없는 괄호는 지운다', () => {
    expect(householdAmount('1마리(220g)', false)).toBe('1마리')
    expect(householdAmount('120g)', false)).toBe('120g')
    expect(householdAmount('10g).', true)).toBe('1/2큰술')
  })
  it('양념이 아니면 그램을 그대로 둔다', () => {
    expect(householdAmount('40g', false)).toBe('40g')
  })
})
