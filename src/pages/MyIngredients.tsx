import { useState } from 'react'
import { BY_ID, INGREDIENTS, search } from '../lib/normalize'
import { Header, SectionTitle } from '../components'

const CATEGORIES: [string, string][] = [
  ['채소', '🥬'], ['육류', '🥩'], ['해산물', '🐟'], ['유제품·달걀', '🥚'],
  ['가공식품', '🥫'], ['곡물·면', '🍚'], ['과일·견과', '🍎'],
]

export function MyIngredients({ mine, add, remove, pantryOff }: {
  mine: string[]; add: (id: string) => void; remove: (id: string) => void; pantryOff: string[]
}) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string | null>(null)
  const have = new Set(mine)
  const suggestions = search(q)
  // 설정에서 켜 둔 기본 재료·양념은 이미 있는 것으로 본다
  const always = (id: string) => BY_ID.get(id)!.isPantry && !pantryOff.includes(id)
  const unknown = q.trim() !== '' && suggestions.length === 0
  const first = suggestions.find(i => !always(i.id))

  const pick = (id: string) => { add(id); setQ('') }

  return (
    <>
      <Header hi="오늘 냉장고 사정" title="내 재료" />

      <form className="relative" onSubmit={e => { e.preventDefault(); if (first) pick(first.id) }}>
        <label htmlFor="q" className="sr-only">재료 검색</label>
        <input id="q" value={q} onChange={e => setQ(e.target.value)} autoComplete="off" enterKeyHint="done"
          placeholder="재료 이름 (예: 계란, 대파)"
          className="w-full rounded-2xl border border-line bg-card px-4 py-3 text-[1.05rem] placeholder:text-soft focus:border-rose focus:outline-none" />
        {q.trim() !== '' && (
          <ul className="absolute inset-x-0 top-full z-10 mt-1.5 overflow-hidden rounded-2xl border border-line bg-card shadow-xl shadow-black/40">
            {suggestions.map(i => (
              <li key={i.id}>
                <button type="button" onClick={() => pick(i.id)} disabled={have.has(i.id) || always(i.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-dish-b disabled:text-soft">
                  <span aria-hidden className="text-xl">{i.emoji}</span>
                  <span className="flex-1 font-medium">{i.name}</span>
                  <span className="text-sm text-soft">{have.has(i.id) ? '이미 있어요' : always(i.id) ? '기본으로 있어요' : i.category}</span>
                </button>
              </li>
            ))}
            {unknown && <li className="px-4 py-3 text-soft">'{q.trim()}'는 아직 재료 사전에 없어요. 비슷한 이름으로 찾아보세요.</li>}
          </ul>
        )}
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {CATEGORIES.map(([c, emoji]) => (
          <button key={c} type="button" onClick={() => setCat(cat === c ? null : c)} aria-pressed={cat === c}
            className={`press flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm ${
              cat === c ? 'border-rose bg-rose font-bold text-bg' : 'border-line'}`}>
            <span aria-hidden>{emoji}</span>{c}
          </button>
        ))}
      </div>

      {cat && (
        <div className="mt-3 flex flex-wrap gap-x-1.5 gap-y-2 rounded-2xl bg-card p-3">
          {INGREDIENTS.filter(i => i.category === cat).map(i => (
            <button key={i.id} type="button" onClick={() => (have.has(i.id) ? remove(i.id) : add(i.id))} aria-pressed={have.has(i.id)}
              className={`press rounded-xl px-2.5 py-1.5 text-[0.95rem] ${have.has(i.id) ? 'bg-rose text-bg' : 'bg-dish-a'}`}>
              {i.name}
            </button>
          ))}
        </div>
      )}

      <section className="mt-9" aria-labelledby="fridge">
        <SectionTitle id="fridge" count={mine.length} aside="누르면 빠져요">냉장고 안</SectionTitle>
        {mine.length === 0 ? (
          <p className="py-10 text-center leading-relaxed text-soft">
            아직 비어 있어요.<br />위에서 검색하거나 카테고리를 눌러 재료를 추가하세요.
          </p>
        ) : (
          <ul className="grid grid-cols-4 gap-x-2 gap-y-4 pt-5">
            {mine.map(id => {
              const ing = BY_ID.get(id)
              return (
                <li key={id}>
                  <button type="button" onClick={() => remove(id)} aria-label={`${ing?.name} 내 재료에서 빼기`}
                    className="press grid w-full justify-items-center gap-1.5">
                    <span aria-hidden className="dish grid size-16 place-items-center rounded-full text-[1.7rem]">{ing?.emoji}</span>
                    <span className="text-sm">{ing?.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}
