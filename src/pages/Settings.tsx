import { INGREDIENTS } from '../lib/normalize'
import { TOOLS } from '../lib/tools'
import { Header } from '../components'

const PANTRY = INGREDIENTS.filter(i => i.isPantry)
const STAPLES = PANTRY.filter(i => i.category !== '양념')
const SEASONINGS = PANTRY.filter(i => i.category === '양념')

function Toggles({ id, title, items, off, toggle }: {
  id: string; title: string; items: { id: string; name: string; emoji: string }[]; off: Set<string>; toggle: (id: string) => void
}) {
  return (
    <section aria-labelledby={id} className="mt-9 first-of-type:mt-0">
      <h2 id={id} className="border-b border-line pb-2.5 font-title text-[1.4rem] leading-none">{title}</h2>
      <ul>
        {items.map(i => (
          <li key={i.id} className="border-b border-line">
            <label className="flex min-h-13 cursor-pointer items-center gap-3 py-2">
              <span aria-hidden className="text-xl">{i.emoji}</span>
              <span className="flex-1">{i.name}</span>
              <input type="checkbox" checked={!off.has(i.id)} onChange={() => toggle(i.id)} className="peer sr-only" />
              <span aria-hidden className="relative h-7 w-12 rounded-full bg-dish-b transition-colors peer-checked:bg-rose peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rose
                after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-ink after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:bg-bg" />
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Settings({ pantryOff, togglePantry, toolsOff, toggleTool, reset }: {
  pantryOff: string[]; togglePantry: (id: string) => void; toolsOff: string[]; toggleTool: (id: string) => void; reset: () => void
}) {
  const off = new Set(pantryOff)
  return (
    <>
      <Header hi="켜 둔 것은 늘 집에 있다고 보고 요리를 찾아요." title="설정" />
      <Toggles id="staples" title="기본 재료" items={STAPLES} off={off} toggle={togglePantry} />
      <Toggles id="pantry" title="기본 양념" items={SEASONINGS} off={off} toggle={togglePantry} />
      <Toggles id="tools" title="조리 도구" items={TOOLS} off={new Set(toolsOff)} toggle={toggleTool} />
      <p className="mt-2.5 text-xs leading-relaxed text-soft">끈 도구가 꼭 필요한 요리는 빼고 찾아요. 오븐 요리는 에어프라이어로도 만들 수 있다고 봐요.</p>
      <section className="mt-10 pb-4">
        <button type="button" onClick={() => { if (confirm('내 재료와 설정을 모두 지울까요?')) reset() }}
          className="press w-full rounded-full border border-alert py-3 font-bold text-alert">
          데이터 초기화
        </button>
      </section>
    </>
  )
}
