// 식품안전나라 조리식품 레시피 DB(COOKRCP01)를 한 번 받아 앱용 JSON으로 정제한다.
// 실행: npm run import:recipes   (.env의 FOODSAFETY_API_KEY 필요)
import { writeFileSync } from 'node:fs'
import { BY_ID, normalize } from '../src/lib/normalize.ts'
import { cleanStep, householdAmount, parseParts } from './foodsafety-parse.ts'

process.loadEnvFile('.env')
const KEY = process.env.FOODSAFETY_API_KEY
if (!KEY) throw new Error('.env에 FOODSAFETY_API_KEY가 없습니다')

type Row = Record<string, string>

async function fetchAll(): Promise<Row[]> {
  const rows: Row[] = []
  for (let start = 1; ; start += 1000) {
    const res = await fetch(`http://openapi.foodsafetykorea.go.kr/api/${KEY}/COOKRCP01/json/${start}/${start + 999}`)
    const body = await res.json()
    const data = body.COOKRCP01
    if (!data?.row) throw new Error(`API 응답 오류: ${JSON.stringify(data?.RESULT ?? body).slice(0, 200)}`)
    rows.push(...data.row)
    if (rows.length >= Number(data.total_count)) return rows
  }
}

// 사전에 그대로 없으면 꼬리 표현과 조리 상태·품질 수식어를 떼고, 그래도 없으면 마지막 단어로 다시 찾는다
const MODIFIERS = /^(다진|저염|무염|저지방|손질된|손질한|데친|삶은|불린|냉동|조선|국산|생|통|날|볶은|채썬|채 썬|깐|송송 썬|구운|잘게 썬|슬라이스|건)\s*/
const SUFFIX = /\s*(다진\s?것|채|살|즙|가루)$/
function toId(name: string): string | null {
  let n = name
  for (let i = 0; i < 3; i++) {
    const id = normalize(n) ?? normalize(n.replace(SUFFIX, ''))
    if (id) return id
    const stripped = n.replace(MODIFIERS, '')
    if (stripped === n) break
    n = stripped
  }
  const last = n.split(/\s+/).pop()!
  return last !== n ? normalize(last) : null
}

const rows = await fetchAll()
const unmapped = new Map<string, number>()
const recipes = []
for (const r of rows) {
  if (r.RCP_PAT2 === '후식') continue // 저녁 메뉴를 찾는 앱이라 디저트는 뺀다
  const parts = parseParts(r.RCP_PARTS_DTLS ?? '')
  const ingredients = new Map<string, { id: string; amount: string; optional?: boolean }>()
  let ok = parts.length > 0
  for (const p of parts) {
    const id = toId(p.name)
    if (!id) {
      unmapped.set(p.name, (unmapped.get(p.name) ?? 0) + 1)
      if (!p.optional) ok = false // 필수 재료를 모르면 매칭이 틀려지므로 레시피를 뺀다
      continue
    }
    const prev = ingredients.get(id)
    const amount = householdAmount(p.amount, BY_ID.get(id)!.category === '양념' || BY_ID.get(id)!.isPantry)
    if (!prev || (prev.optional && !p.optional)) ingredients.set(id, { id, amount, ...(p.optional && { optional: true }) })
  }
  const steps = Object.keys(r).filter(k => /^MANUAL\d+$/.test(k)).sort().map(k => cleanStep(r[k])).filter(Boolean)
  if (!ok || steps.length === 0) continue
  recipes.push({
    id: `fs${r.RCP_SEQ}`,
    name: r.RCP_NM.trim(),
    minutes: null,
    ingredients: [...ingredients.values()],
    steps,
    // http 주소는 https로 리다이렉트되므로 처음부터 https로 저장 (배포 시 혼합 콘텐츠 차단 방지)
    ...(r.ATT_FILE_NO_MAIN && { image: r.ATT_FILE_NO_MAIN.replace(/^http:/, 'https:') }),
    source: 'foodsafety',
  })
}

writeFileSync('src/data/recipes-foodsafety.json', JSON.stringify(recipes, null, 1))
writeFileSync('scripts/unmapped.txt', [...unmapped].sort((a, b) => b[1] - a[1]).map(([n, c]) => `${c}\t${n}`).join('\n') + '\n')
console.log(`받은 레시피 ${rows.length}개 → 사용 가능 ${recipes.length}개, 매핑 안 된 재료명 ${unmapped.size}종 (scripts/unmapped.txt)`)
