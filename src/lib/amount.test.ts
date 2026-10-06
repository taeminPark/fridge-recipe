import { describe, expect, it } from 'vitest'
import { spokenAmount } from './amount'

describe('spokenAmount: 말하듯이 + 표준 병기', () => {
  it('큰술은 숟가락으로 말하고 표준 계량을 함께 돌려준다', () => {
    expect(spokenAmount('1/2큰술')).toEqual({ text: '반 숟가락', standard: '1/2큰술' })
    expect(spokenAmount('1큰술')).toEqual({ text: '한 숟가락', standard: '1큰술' })
    expect(spokenAmount('1.5큰술')).toEqual({ text: '한 숟가락 반', standard: '1.5큰술' })
    expect(spokenAmount('2큰술')).toEqual({ text: '두 숟가락', standard: '2큰술' })
    expect(spokenAmount('1/3큰술')).toEqual({ text: '숟가락 1/3', standard: '1/3큰술' })
  })
  it('작은술은 티스푼으로', () => {
    expect(spokenAmount('1작은술')).toEqual({ text: '티스푼 하나', standard: '1작은술' })
    expect(spokenAmount('1/2작은술')).toEqual({ text: '티스푼 반', standard: '1/2작은술' })
    expect(spokenAmount('2/3작은술')).toEqual({ text: '티스푼 2/3', standard: '2/3작은술' })
  })
  it('1/2 + 세는 단위는 "반 대"처럼, 병기 없이', () => {
    expect(spokenAmount('1/2대')).toEqual({ text: '반 대' })
    expect(spokenAmount('1/2개')).toEqual({ text: '반 개' })
  })
  it('그 밖의 양은 그대로', () => {
    expect(spokenAmount('200g')).toEqual({ text: '200g' })
    expect(spokenAmount('약간')).toEqual({ text: '약간' })
    expect(spokenAmount('1공기')).toEqual({ text: '1공기' })
  })
})
