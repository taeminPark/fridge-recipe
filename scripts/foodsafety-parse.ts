// 식품안전나라 COOKRCP01의 자유 텍스트 재료(RCP_PARTS_DTLS)와 조리 단계(MANUALxx) 정리

export type Part = { name: string; amount: string; optional: boolean }

// 물과 육수류는 집에서 늘 만들 수 있다고 보고 재료로 치지 않는다
const IGNORE = new Set(['물', '따뜻한물', '찬물', '뜨거운물', '얼음', '얼음물', '탄산수', '쌀뜨물', '육수', '닭육수', '해물육수', '채소육수', '멸치육수', '다시마국물', '다시마물'])
const AMOUNT_START = /[\d½⅓⅔¼¾]|약간|적당량|조금|少/

export function parseParts(text: string): Part[] {
  const parts: Part[] = []
  let garnish = false
  for (let line of text.split('\n')) {
    line = line.replace(/^[\s●·•\-]+/, '').replace(/\[[^\]]*\]/g, ',').trim()
    if (!line) continue
    // 수량이 하나도 없는 줄은 제목(요리명, "고명", "●양념장 :" 등)
    if (!AMOUNT_START.test(line)) {
      garnish = line.replace(/[\s:]/g, '') === '고명'
      continue
    }
    const lineGarnish = garnish || /^고명\s*:/.test(line)
    for (const token of splitOutsideParens(line)) {
      // "양념장 : 간장 1큰술"처럼 항목 앞에 붙은 소제목은 그 항목에서만 떼어낸다
      const t = token.slice(token.lastIndexOf(':') + 1).trim()
      if (!t) continue
      // "돼지고기(50g)": 양 전체가 괄호 안
      const whole = t.match(/^([^(\d]+)\(([\d.½⅓⅔¼¾][^()]*)\)$/)
      if (whole) {
        const name = whole[1].trim()
        if (!IGNORE.has(name.replace(/\s/g, ''))) parts.push({ name, amount: whole[2].trim(), optional: lineGarnish })
        continue
      }
      const m = t.match(AMOUNT_START)
      const name = (m ? t.slice(0, m.index) : t).replace(/\(.*$/, '').trim()
      const amount = m ? t.slice(m.index).trim() : ''
      if (!name || IGNORE.has(name.replace(/\s/g, ''))) continue
      parts.push({ name, amount: amount || '약간', optional: lineGarnish || /^(약간|적당량|조금)/.test(amount) })
    }
  }
  return parts
}

function splitOutsideParens(s: string) {
  const out: string[] = []
  let depth = 0, cur = ''
  for (const c of s) {
    if (c === '(') depth++
    if (c === ')') depth = Math.max(0, depth - 1)
    if (c === ',' && depth === 0) { out.push(cur); cur = '' } else cur += c
  }
  out.push(cur)
  return out
}

export function cleanStep(s: string) {
  return s
    .replace(/\s*\n\s*/g, ' ')
    .replace(/(\d\s*(?:cm|mm))\s*\?\s*(?=\d)/g, '$1×')
    .trim()
    .replace(/^\d+\.\s*/, '')
    .replace(/(?<=[.!?)])[a-zA-Z]$/, '')
    .trim()
}

/** "3g(2/3작은술)" → "2/3작은술". 그램만 있는 양념은 1큰술=15g, 1작은술=5g으로 바꾼다 */
export function householdAmount(amount: string, isSeasoning: boolean): string {
  // 원문 괄호가 잘려 남은 ")" 정리
  if (!amount.includes('(')) amount = amount.replace(/\)\.?$/, '').trim()
  // "1마리(220g)": 앞쪽이 이미 가정용 단위
  const unitFirst = amount.match(/^(.*[^\d.\s]\D*?)\s*\(\s*[\d.]+\s*(g|ml|mL|cc)\s*\)$/)
  if (unitFirst && !/^[\d.]+\s*(g|ml|mL|cc)$/.test(unitFirst[1])) return unitFirst[1].trim()
  const withParen = amount.match(/^([\d.]+)\s*(g|ml|mL|cc)\s*\((.+)\)\s*$/)
  if (withParen) return withParen[3].includes('cm') ? `${withParen[1]}${withParen[2]}` : withParen[3].trim()
  const plain = amount.match(/^([\d.]+)\s*(g|ml|mL|cc)$/)
  if (!plain || !isSeasoning) return amount
  const grams = Number(plain[1])
  if (grams >= 7) {
    const tbsp = Math.max(0.5, Math.round((grams / 15) * 2) / 2)
    return tbsp === 0.5 ? '1/2큰술' : `${tbsp}큰술`
  }
  const tsp = grams / 5
  if (tsp < 0.2) return '약간'
  if (tsp >= 1) return `${Math.round(tsp * 2) / 2}작은술`
  return Math.round(tsp * 3) === 1 ? '1/3작은술' : '2/3작은술'
}
