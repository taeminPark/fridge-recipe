import { useState } from 'react'
import type { Recipe } from '../lib/match'
import { spokenAmount } from '../lib/amount'
import { GLOSSARY_RE, lookupTerm } from '../lib/glossary'
import { BY_ID } from '../lib/normalize'
import { requiredTools, TOOLS } from '../lib/tools'
import { Header } from '../components'

const TOOL_NAME = new Map(TOOLS.map(t => [t.id, t.name]))

/** 조리 단계 글. 어려운 말은 점선 밑줄이 있고, 누르면 아래에 뜻이 나온다 */
function StepText({ text }: { text: string }) {
  const [open, setOpen] = useState<string | null>(null)
  const parts = text.split(GLOSSARY_RE) // 홀수 칸이 사전에 있는 말
  const term = open ? lookupTerm(open) : undefined
  return (
    <div className="min-w-0 flex-1">
      <p className="leading-relaxed">
        {parts.map((part, n) => n % 2 === 0 ? part : (
          <button key={n} type="button" onClick={() => setOpen(open === part ? null : part)} aria-expanded={open === part}
            className="underline decoration-rose/70 decoration-dotted decoration-2 underline-offset-4">
            {part}
          </button>
        ))}
      </p>
      {term && (
        <p role="note" className="mt-2 rounded-xl bg-card px-3 py-2 text-sm leading-relaxed text-soft">
          <b className="mr-1.5 font-title text-rose">{term.term}</b>{term.desc}
        </p>
      )}
    </div>
  )
}

export function RecipeDetail({ recipe, mine, pantry, back, useUp }: {
  recipe: Recipe; mine: Set<string>; pantry: Set<string>; back: () => void; useUp: (id: string) => void
}) {
  const required = recipe.ingredients.filter(i => !i.optional)
  const facts = [
    ['내 재료', recipe.ingredients.filter(i => mine.has(i.id)).length],
    ['부족', required.filter(i => !mine.has(i.id) && !pantry.has(i.id)).length],
    ['기본 재료·양념', recipe.ingredients.filter(i => !mine.has(i.id) && pantry.has(i.id)).length],
  ] as const
  const tools = requiredTools(recipe).map(anyOf => anyOf.map(t => TOOL_NAME.get(t)).join(' 또는 '))
  const backButton = (
    <button type="button" onClick={back} aria-label="요리찾기로 돌아가기"
      className="press absolute top-[calc(env(safe-area-inset-top)+0.75rem)] left-4 z-10 grid size-10 place-items-center rounded-full bg-bg/70 text-2xl leading-none backdrop-blur">
      ‹
    </button>
  )
  return (
    <article>
      {recipe.image ? (
        <div className="relative -mx-4">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img src={recipe.image} alt={recipe.name} className="size-full scale-[1.12] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-bg" />
          </div>
          {backButton}
          <div className="relative -mt-14 px-4">
            <p className="text-xs text-rose">식품안전나라 레시피</p>
            <h1 className="mt-0.5 font-title text-[2rem] leading-tight">{recipe.name}</h1>
          </div>
        </div>
      ) : (
        <div className="relative">
          {backButton}
          <div className="pt-12"><Header brand={false} hi={recipe.minutes != null ? `${recipe.minutes}분 걸려요` : undefined} title={recipe.name} /></div>
        </div>
      )}

      <div className={`mt-4 grid grid-cols-3 gap-2 ${tools.length ? 'mb-3' : 'mb-8'}`}>
        {facts.map(([label, n]) => (
          <div key={label} className="grid justify-items-center rounded-2xl border border-line py-2.5">
            <b className={`font-title text-2xl ${label === '부족' && n > 0 ? 'text-alert' : 'text-rose'}`}>{n}</b>
            <span className="text-xs text-soft">{label}</span>
          </div>
        ))}
      </div>
      {tools.length > 0 && <p className="mb-8 text-sm text-soft">필요한 도구 <b className="ml-1 text-ink">{tools.join(', ')}</b></p>}

      <section aria-labelledby="ing">
        <h2 id="ing" className="border-b border-line pb-2.5 font-title text-[1.4rem] leading-none">재료</h2>
        <ul>
          {recipe.ingredients.map(i => {
            const ing = BY_ID.get(i.id)
            const have = mine.has(i.id)
            const isPantry = !have && pantry.has(i.id)
            const missing = !have && !isPantry
            const amt = spokenAmount(i.amount)
            return (
              <li key={i.id} className="flex min-h-14 flex-wrap items-center gap-x-2.5 gap-y-1 border-b border-line py-2.5">
                <span aria-hidden className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  have ? 'bg-rose text-bg' : isPantry ? 'border border-soft text-soft' : i.optional ? 'border border-dashed border-soft/50' : 'border border-alert text-alert'}`}>
                  {have || isPantry ? '✓' : missing && !i.optional ? '!' : ''}
                </span>
                <span className={missing && !i.optional ? 'text-alert' : ''}>
                  <span aria-hidden className="mr-1">{ing?.emoji}</span>{ing?.name ?? i.id}
                </span>
                <span className="font-bold">{amt.text}</span>
                {amt.standard && <span className="text-xs text-soft">{amt.standard}</span>}
                {(isPantry || missing) && (
                  <span className="text-xs text-soft">{isPantry ? (ing?.category === '양념' ? '기본 양념' : '기본 재료') : i.optional ? '없어도 돼요' : '없어요'}</span>
                )}
                {have && (
                  <button type="button" onClick={() => useUp(i.id)}
                    className="press ml-auto shrink-0 rounded-full border border-rose px-3 py-1 text-sm text-rose">
                    다 썼어요
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mt-9" aria-labelledby="steps">
        <h2 id="steps" className="border-b border-line pb-2.5 font-title text-[1.4rem] leading-none">만드는 법</h2>
        <ol className="mt-1">
          {recipe.steps.map((s, n) => (
            <li key={n} className="flex gap-4 border-b border-line py-4 last:border-0">
              <span className="w-5 shrink-0 font-title text-xl leading-none text-rose">{n + 1}</span>
              <StepText text={s} />
            </li>
          ))}
        </ol>
      </section>

      {recipe.source === 'foodsafety' && (
        <p className="mt-6 text-sm text-soft">출처: 식품의약품안전처 식품안전나라 조리식품 레시피 DB</p>
      )}
    </article>
  )
}
