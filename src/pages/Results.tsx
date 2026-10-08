import { useEffect, useState, type ReactNode } from 'react'
import type { Match } from '../lib/match'
import { BY_ID } from '../lib/normalize'
import { Header, RecipePhoto, SectionTitle } from '../components'

export type View = 'list' | 'grid'

const missingNames = (m: Match) => m.missing.map(i => BY_ID.get(i.id)?.name).join(', ')

function ListRow({ m, open }: { m: Match; open: (id: string) => void }) {
  return (
    <li className="border-b border-line last:border-0">
      <button type="button" onClick={() => open(m.recipe.id)} className="flex w-full items-center gap-4 py-3.5 text-left active:bg-card">
        <RecipePhoto src={m.recipe.image} name={m.recipe.name} className="size-[4.5rem] shrink-0 text-[0.7rem]" />
        <div className="min-w-0 flex-1">
          <p className="font-title text-[1.15rem] leading-snug">{m.recipe.name}</p>
          <p className="mt-0.5 flex gap-3 text-xs text-soft">
            {m.recipe.minutes != null && <span>{m.recipe.minutes}분</span>}
            {m.used > 0 && <span>내 재료 {m.used}개</span>}
          </p>
          {m.missing.length > 0 && <p className="mt-0.5 text-sm text-rose">{missingNames(m)}만 있으면 돼요</p>}
        </div>
        <span aria-hidden className="text-xl text-soft/60">›</span>
      </button>
    </li>
  )
}

function GridTile({ m, open }: { m: Match; open: (id: string) => void }) {
  return (
    <li>
      <button type="button" onClick={() => open(m.recipe.id)} className="press relative block w-full px-2 text-center">
        <RecipePhoto src={m.recipe.image} name={m.recipe.name} className="plate-lg aspect-square w-full text-[0.95rem]" />
        {m.missing.length > 0 && (
          <span className="absolute top-1 left-1 rounded-full bg-rose px-2 py-0.5 text-xs font-bold text-bg">+{missingNames(m)}</span>
        )}
        <p className="mt-3 font-title text-[1.05rem] leading-snug">{m.recipe.name}</p>
        <p className="text-xs text-soft">
          {[m.recipe.minutes != null && `${m.recipe.minutes}분`, `내 재료 ${m.used}개`].filter(Boolean).join(', ')}
        </p>
      </button>
    </li>
  )
}

function Section({ id, title, items, view, open, empty }: {
  id: string; title: string; items: Match[]; view: View; open: (id: string) => void; empty: string
}) {
  return (
    <section aria-labelledby={id} className="rise">
      <SectionTitle id={id} count={items.length}>{title}</SectionTitle>
      {items.length === 0 ? <p className="py-6 text-soft">{empty}</p>
        : view === 'list' ? <ul>{items.map(m => <ListRow key={m.recipe.id} m={m} open={open} />)}</ul>
        : <ul className="grid grid-cols-2 gap-x-2 gap-y-6 pt-5">{items.map(m => <GridTile key={m.recipe.id} m={m} open={open} />)}</ul>}
    </section>
  )
}

const MAX_DROPS = 6

/** 냄비 폭에 고루 나눈 자리. 연달아 떨어지는 재료끼리는 멀리 떨어지도록 왼쪽 절반·오른쪽 절반을 번갈아 쓴다 */
function dropLeft(n: number, count: number) {
  if (count === 1) return 73
  const half = Math.ceil(count / 2)
  const slot = n % 2 === 0 ? n / 2 : half + (n - 1) / 2
  return 30 + (slot * 86) / (count - 1)
}

/** 요리찾기를 열 때 약 1.5초 보여주는 뚝배기: 내 재료가 퐁당 빠지고 김이 오른다 */
export function PotLoader({ emojis, total }: { emojis: string[]; total: number }) {
  const drops = emojis.slice(0, MAX_DROPS)
  const [count, setCount] = useState(0)
  useEffect(() => {
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 1300)
      setCount(Math.round(total * k))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [total])
  return (
    <div role="status" className="grid place-items-center py-14">
      <div className="relative h-40 w-44">
        {drops.map((e, n) => (
          <span key={n} className="pot-drop absolute top-0 text-3xl" style={{ left: `${dropLeft(n, drops.length)}px`, animationDelay: `${n * 0.13}s` }}>{e}</span>
        ))}
        {[0, 1, 2].map(n => (
          <span key={n} className="pot-steam absolute bottom-[5.6rem] h-7 w-1.5 rounded-full bg-ink/35"
            style={{ left: `${62 + n * 24}px`, animationDelay: `${0.55 + n * 0.18}s` }} />
        ))}
        <div className="absolute inset-x-3 bottom-[4.4rem] h-3.5 rounded-full border-2 border-pot-edge bg-[#4A3830]" />
        <div className="absolute inset-x-6 bottom-0 h-[4.6rem] rounded-b-[2.6rem] rounded-t-xl border-2 border-pot-edge bg-pot" />
      </div>
      <p className="mt-5 font-title text-2xl text-rose">보글보글 찾는 중</p>
      <p className="mt-1 text-sm text-soft tabular-nums">레시피 {count}개 확인</p>
    </div>
  )
}

/** 주재료 고르기: 누른 재료가 주인공인 요리만 본다 */
function MainPicker({ mine, main, setMain }: { mine: string[]; main: string | null; setMain: (id: string | null) => void }) {
  const chip = (on: boolean) => `press flex shrink-0 items-center gap-1 rounded-full border px-3.5 py-1.5 text-sm ${
    on ? 'border-rose bg-rose font-bold text-bg' : 'border-line text-ink'}`
  return (
    <div className="mb-5">
      <p className="mb-2 text-sm text-soft">오늘의 주인공</p>
      <div role="group" aria-label="주재료 고르기" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button type="button" aria-pressed={main === null} onClick={() => setMain(null)} className={chip(main === null)}>전체</button>
        {mine.map(id => {
          const ing = BY_ID.get(id)
          return (
            <button key={id} type="button" aria-pressed={main === id} onClick={() => setMain(main === id ? null : id)} className={chip(main === id)}>
              <span aria-hidden>{ing?.emoji}</span>{ing?.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Results({ now, oneMore, mine, main, setMain, empty, open, goMine, view, setView, loading }: {
  now: Match[]; oneMore: Match[]; mine: string[]; main: string | null; setMain: (id: string | null) => void
  empty: boolean; open: (id: string) => void; goMine: () => void
  view: View; setView: (v: View) => void; loading: ReactNode
}) {
  const mainName = main ? BY_ID.get(main)?.name ?? '' : ''
  if (empty) {
    return (
      <>
        <Header hi="오늘의 한 상" title="요리찾기" />
        <div className="py-12 text-center">
          <p className="leading-relaxed text-soft">재료를 넣으면 지금 만들 수 있는 요리가 여기 나와요.</p>
          <button type="button" onClick={goMine} className="press mt-5 rounded-full bg-rose px-6 py-3 font-bold text-bg">재료 추가하기</button>
        </div>
      </>
    )
  }
  return (
    <>
      <Header hi="오늘의 한 상" title="요리찾기" />
      {loading ?? (
        <>
          <MainPicker mine={mine} main={main} setMain={setMain} />
          <div className="mb-6 flex items-center gap-3">
            <p className="min-w-0 flex-1 text-sm text-soft">
              {main ? `${mainName} 요리: 지금 ${now.length}개, 조금만 더 있으면 ${oneMore.length}개` : `지금 ${now.length}개, 하나만 더 있으면 ${oneMore.length}개`}
            </p>
            <div role="group" aria-label="보기 방식" className="flex rounded-full border border-line p-0.5 text-sm font-bold">
              {([['list', '목록'], ['grid', '사진']] as const).map(([v, label]) => (
                <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}
                  className={`rounded-full px-3.5 py-1 ${view === v ? 'bg-ink text-bg' : 'text-soft'}`}>{label}</button>
              ))}
            </div>
          </div>
          <div className="space-y-10">
            <Section id="now" title="지금 만들 수 있어요" items={now} view={view} open={open}
              empty={main ? `${mainName}만으로 바로 되는 요리는 아직 없어요. 아래를 보세요.` : '아직 딱 맞는 요리가 없어요. 아래에서 하나만 더 있으면 되는 요리를 보세요.'} />
            <Section id="one" title={main ? '조금만 더 있으면' : '1개만 더 있으면'} items={oneMore} view={view} open={open}
              empty={main ? `${mainName} 요리를 더 찾지 못했어요.` : '해당하는 요리가 없어요.'} />
          </div>
        </>
      )}
    </>
  )
}
