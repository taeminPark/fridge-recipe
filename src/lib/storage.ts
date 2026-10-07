function load(key: string): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

function save(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids))
  } catch {
    /* 저장 불가(사파리 개인정보 모드 등) — 메모리 상태로만 동작 */
  }
}

export const storage = {
  myIngredients: () => load('myIngredients'),
  setMyIngredients: (ids: string[]) => save('myIngredients', ids),
  pantryOff: () => load('pantryOff'),
  setPantryOff: (ids: string[]) => save('pantryOff', ids),
  toolsOff: () => load('toolsOff'),
  setToolsOff: (ids: string[]) => save('toolsOff', ids),
  resultView: () => {
    try { return localStorage.getItem('resultView') === 'grid' ? 'grid' : 'list' } catch { return 'list' }
  },
  setResultView: (v: 'list' | 'grid') => {
    try { localStorage.setItem('resultView', v) } catch { /* noop */ }
  },
  clear: () => {
    try {
      localStorage.removeItem('myIngredients')
      localStorage.removeItem('pantryOff')
      localStorage.removeItem('toolsOff')
    } catch { /* noop */ }
  },
}
