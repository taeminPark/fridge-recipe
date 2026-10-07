import { useEffect, useMemo, useRef, useState } from 'react'
import recipesData from './data/recipes.json'
import foodsafetyRecipes from './data/recipes-foodsafety.json'
import { findRecipes, type Recipe } from './lib/match'
import { AROMATIC_IDS, BY_ID, INGREDIENTS } from './lib/normalize'
import { storage } from './lib/storage'
import { canMake } from './lib/tools'
import { MyIngredients } from './pages/MyIngredients'
import { PotLoader, Results, type View } from './pages/Results'
import { RecipeDetail } from './pages/RecipeDetail'
import { Settings } from './pages/Settings'

const RECIPES = [...recipesData, ...foodsafetyRecipes] as Recipe[]
const LOADER_MS = 1500

/** 받침 유무에 따라 을/를 */
function withObject(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return word + (code >= 0 && code <= 11171 && code % 28 ? '을' : '를')
}

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter(x => x !== id) : [...list, id])

type Tab = 'mine' | 'find' | 'settings'
const TABS: { id: Tab; label: string }[] = [
  { id: 'mine', label: '내 재료' },
  { id: 'find', label: '요리찾기' },
  { id: 'settings', label: '설정' },
]

export default function App() {
  const [mine, setMine] = useState(storage.myIngredients)
  const [pantryOff, setPantryOff] = useState(storage.pantryOff)
  const [toolsOff, setToolsOff] = useState(storage.toolsOff)
  const [view, setView] = useState<View>(storage.resultView)
  const [tab, setTab] = useState<Tab>('mine')
  const [openId, setOpenId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ id: string } | null>(null)
  const toastTimer = useRef<number>(undefined)

  useEffect(() => { storage.setMyIngredients(mine) }, [mine])
  useEffect(() => { storage.setPantryOff(pantryOff) }, [pantryOff])
  useEffect(() => { storage.setToolsOff(toolsOff) }, [toolsOff])
  useEffect(() => { storage.setResultView(view) }, [view])
  useEffect(() => { window.scrollTo(0, 0) }, [tab, openId])

  // 재료나 양념·도구 설정이 바뀐 뒤 요리찾기를 처음 열 때만 냄비 로딩을 보여준다
  const searchKey = `${mine.join()}|${pantryOff.join()}|${toolsOff.join()}`
  const [shownKey, setShownKey] = useState<string | null>(null)
  const loading = tab === 'find' && !openId && mine.length > 0 && shownKey !== searchKey
  useEffect(() => {
    if (!loading) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = setTimeout(() => setShownKey(searchKey), reduce ? 0 : LOADER_MS)
    return () => clearTimeout(t)
  }, [loading, searchKey])

  const myIds = useMemo(() => new Set(mine), [mine])
  const pantryIds = useMemo(
    () => new Set(INGREDIENTS.filter(i => i.isPantry && !pantryOff.includes(i.id)).map(i => i.id)),
    [pantryOff],
  )
  // 없는 도구(오븐 등)가 꼭 필요한 레시피는 뺀다
  const makeable = useMemo(() => { const off = new Set(toolsOff); return RECIPES.filter(r => canMake(r, off)) }, [toolsOff])
  const results = useMemo(() => findRecipes(makeable, myIds, pantryIds, AROMATIC_IDS), [makeable, myIds, pantryIds])

  const add = (id: string) => setMine(m => (m.includes(id) ? m : [...m, id]))
  const remove = (id: string) => setMine(m => m.filter(x => x !== id))
  const useUp = (id: string) => {
    remove(id)
    setShownKey(`${mine.filter(x => x !== id).join()}|${pantryOff.join()}|${toolsOff.join()}`) // 상세에서 돌아갈 때 로딩을 다시 보이지 않게
    setToast({ id })
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 4000)
  }
  const recipe = openId ? RECIPES.find(r => r.id === openId) : undefined

  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 pb-[calc(env(safe-area-inset-bottom)+5.5rem)]">
      <main>
        {recipe ? (
          <RecipeDetail recipe={recipe} mine={myIds} pantry={pantryIds} back={() => setOpenId(null)} useUp={useUp} />
        ) : tab === 'mine' ? (
          <MyIngredients mine={mine} add={add} remove={remove} pantryOff={pantryOff} />
        ) : tab === 'find' ? (
          <Results {...results} empty={mine.length === 0} open={setOpenId} goMine={() => setTab('mine')}
            view={view} setView={setView}
            loading={loading ? <PotLoader emojis={mine.map(id => BY_ID.get(id)!.emoji)} total={makeable.length} /> : null} />
        ) : (
          <Settings
            pantryOff={pantryOff}
            togglePantry={id => setPantryOff(o => toggle(o, id))}
            toolsOff={toolsOff}
            toggleTool={id => setToolsOff(o => toggle(o, id))}
            reset={() => { storage.clear(); setMine([]); setPantryOff([]); setToolsOff([]) }}
          />
        )}
      </main>

      {toast && (
        <div role="status" className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+5rem)] mx-auto flex max-w-sm items-center justify-between rounded-2xl border border-line bg-card px-4 py-3 text-ink shadow-xl shadow-black/40">
          <span>{withObject(BY_ID.get(toast.id)?.name ?? '')} 내 재료에서 뺐어요</span>
          <button type="button" className="font-bold text-rose" onClick={() => { add(toast.id); setToast(null) }}>되돌리기</button>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <ul className="mx-auto flex max-w-md">
          {TABS.map(t => {
            const active = tab === t.id && !recipe
            return (
              <li key={t.id} className="flex-1">
                <button type="button" aria-current={active ? 'page' : undefined}
                  onClick={() => { setTab(t.id); setOpenId(null) }}
                  className={`relative flex h-16 w-full flex-col items-center justify-center font-title text-lg ${active ? 'text-rose' : 'text-soft/70'}`}>
                  {t.label}
                  {t.id === 'find' && results.now.length > 0 && (
                    <span className="absolute top-2 right-[calc(50%-3.4rem)] min-w-5 rounded-full bg-rose px-1 font-sans text-xs font-bold text-bg">
                      {results.now.length}
                    </span>
                  )}
                  <span aria-hidden className={`mt-1 h-1 w-6 rounded-full ${active ? 'bg-rose' : 'bg-transparent'}`} />
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
