import { INGREDIENTS } from '../lib/normalize'
import { Header } from '../components'

const PANTRY = INGREDIENTS.filter(i => i.isPantry)

export function Settings({ pantryOff, togglePantry, reset }: {
  pantryOff: string[]; togglePantry: (id: string) => void; reset: () => void
}) {
  const off = new Set(pantryOff)
  return (
    <>
      <Header hi="켜 둔 양념은 늘 집에 있다고 보고 요리를 찾아요." title="설정" />
      <section aria-labelledby="pantry">
        <h2 id="pantry" className="border-b border-line pb-2.5 font-title text-[1.4rem] leading-none">기본 양념</h2>
        <ul>
          {PANTRY.map(i => (
            <li key={i.id} className="border-b border-line">
              <label className="flex min-h-13 cursor-pointer items-center gap-3 py-2">
                <span aria-hidden className="text-xl">{i.emoji}</span>
                <span className="flex-1">{i.name}</span>
                <input type="checkbox" checked={!off.has(i.id)} onChange={() => togglePantry(i.id)} className="peer sr-only" />
                <span aria-hidden className="relative h-7 w-12 rounded-full bg-dish-b transition-colors peer-checked:bg-rose peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rose
                  after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-ink after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:bg-bg" />
              </label>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10 pb-4">
        <button type="button" onClick={() => { if (confirm('내 재료와 양념 설정을 모두 지울까요?')) reset() }}
          className="press w-full rounded-full border border-alert py-3 font-bold text-alert">
          데이터 초기화
        </button>
      </section>
    </>
  )
}
