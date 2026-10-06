import type { Recipe } from '../lib/match'
import { spokenAmount } from '../lib/amount'
import { BY_ID } from '../lib/normalize'
import { Header } from '../components'

export function RecipeDetail({ recipe, mine, pantry, back, useUp }: {
  recipe: Recipe; mine: Set<string>; pantry: Set<string>; back: () => void; useUp: (id: string) => void
}) {
  const required = recipe.ingredients.filter(i => !i.optional)
  const facts = [
    ['내 재료', recipe.ingredients.filter(i => mine.has(i.id)).length],
    ['부족', required.filter(i => !mine.has(i.id) && !pantry.has(i.id)).length],
    ['기본 양념', recipe.ingredients.filter(i => !mine.has(i.id) && pantry.has(i.id)).length],
  ] as const
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

      <div className="mt-4 mb-8 grid grid-cols-3 gap-2">
        {facts.map(([label, n]) => (
          <div key={label} className="grid justify-items-center rounded-2xl border border-line py-2.5">
            <b className={`font-title text-2xl ${label === '부족' && n > 0 ? 'text-alert' : 'text-rose'}`}>{n}</b>
            <span className="text-xs text-soft">{label}</span>
          </div>
        ))}
      </div>

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
                  <span className="text-xs text-soft">{isPantry ? '기본 양념' : i.optional ? '없어도 돼요' : '없어요'}</span>
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
              <p className="leading-relaxed">{s}</p>
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
