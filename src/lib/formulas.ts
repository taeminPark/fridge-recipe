import type { Recipe, RecipeIngredient } from './match'
import { BY_ID } from './normalize'

/** 받침 유무에 따라 을/를 */
function withObject(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return word + (code >= 0 && code <= 11171 && code % 28 ? '을' : '를')
}

/** 요리 이름·조리 순서에 들어갈 짧은 이름 */
const SHORT: Record<string, string> = {
  tuna_can: '참치', cheese: '치즈', crab_stick: '맛살', egg: '계란', beef_brisket: '차돌',
  king_mushroom: '새송이버섯', oyster_mushroom: '느타리버섯', button_mushroom: '양송이버섯', myeongran: '명란',
}

/** 그냥 썰면 안 되는 재료의 손질법 */
const PREP: Record<string, string> = {
  tuna_can: '참치는 체에 밭쳐 기름을 뺀다',
  clam: '바지락은 소금물에 담가 해감한 뒤 씻는다',
  shrimp: '새우는 껍질을 벗기고 등의 내장을 뺀다',
  squid: '오징어는 내장을 빼고 씻어 한입 크기로 썬다',
  octopus: '낙지는 굵은소금으로 주물러 씻고 한입 크기로 썬다',
  cheese: '치즈는 반으로 자른다',
  laver: '김은 팬 크기에 맞춰 자른다',
  egg: '계란은 곱게 풀어 둔다',
  myeongran: '명란은 껍질을 갈라 알만 긁어낸다',
  rice_cake: '떡은 물에 한 번 헹군다',
  dumpling: '만두는 냉동이면 그대로 쓴다',
}

type Main = { id: string; n: string; obj: string; cat: string }

/** 손질 한 줄. cut: '잘게', '한입 크기로' 같은 썰기 */
const prep = (x: Main, cut: string) => PREP[x.id] || `${x.obj} ${cut} 썬다`

type Formula = {
  key: string
  name: (n: string) => string
  minutes: number
  mains: Record<string, string> // 주재료 ID → 양
  base: RecipeIngredient[]
  steps: (x: Main) => string[]
}

const opt = (id: string, amount: string): RecipeIngredient => ({ id, amount, optional: true })
const req = (id: string, amount: string): RecipeIngredient => ({ id, amount })

const FORMULAS: Formula[] = [
  {
    key: 'friedrice', name: n => `${n} 볶음밥`, minutes: 15,
    mains: {
      bacon: '3줄', spam: '1/3캔', sausage: '3개', tuna_can: '1/2캔', shrimp: '8마리', pork: '100g', ground_beef: '100g',
      chicken: '100g', beef: '100g', crab_stick: '3개', fish_cake: '1장', zucchini: '1/3개', potato: '1개', carrot: '1/3개',
      cabbage: '1/8통', king_mushroom: '1개', shiitake: '2개', corn: '3큰술', myeongran: '1개', kimchi: '1컵',
    },
    base: [req('rice', '1공기'), req('oil', '1큰술'), req('soy_sauce', '1/2큰술'), req('salt', '약간'), req('pepper', '약간'),
      opt('pa', '1/4대'), opt('egg', '1개'), opt('sesame_oil', '약간')],
    steps: x => [
      `${prep(x, '잘게')}. 대파가 있으면 송송 썬다`,
      '팬에 기름을 두르고 대파를 먼저 볶아 파기름을 낸다 (대파가 없으면 건너뛴다)',
      `${x.obj} 넣고 익을 때까지 볶는다`,
      '밥을 넣고 주걱으로 누르듯 펴 가며 고루 볶는다',
      '팬 가장자리에 간장을 둘러 눌린 뒤 섞고, 소금·후추로 간한다',
      '계란이 있으면 한쪽에서 스크램블해 섞고, 참기름을 조금 둘러 마무리한다',
    ],
  },
  {
    key: 'donburi', name: n => `${n} 덮밥`, minutes: 20,
    mains: {
      pork: '150g', pork_belly: '150g', chicken: '150g', beef: '150g', beef_brisket: '150g', duck: '150g', tofu: '1/2모',
      spam: '1/3캔', shrimp: '10마리', eggplant: '1개', king_mushroom: '2개', oyster_mushroom: '한 줌',
    },
    base: [req('rice', '1공기'), req('soy_sauce', '2큰술'), req('sugar', '1큰술'), req('oil', '1큰술'),
      opt('onion', '1/2개'), opt('pa', '1/4대'), opt('starch', '1작은술'), opt('sesame', '약간')],
    steps: x => [
      `${prep(x, '한입 크기로')}. 양파가 있으면 채 썬다`,
      '간장 2큰술, 설탕 1큰술, 물 4큰술을 섞어 소스를 만든다',
      `팬에 기름을 두르고 ${x.obj} 넣어 볶는다. 양파가 있으면 함께 볶는다`,
      '소스를 붓고 자작하게 졸인다. 전분이 있으면 물에 풀어 넣어 걸쭉하게 만든다',
      '밥 위에 얹고 대파나 깨를 뿌린다',
    ],
  },
  {
    key: 'gochujang', name: n => `${n} 고추장볶음`, minutes: 20,
    mains: {
      pork_belly: '200g', pork_neck: '200g', chicken: '250g', chicken_wing: '6개', duck: '200g', octopus: '1마리',
      fish_cake: '2장', jinmi: '한 줌', king_mushroom: '2개',
    },
    base: [req('gochujang', '1.5큰술'), req('gochugaru', '1큰술'), req('soy_sauce', '1큰술'), req('sugar', '1큰술'),
      req('garlic', '1작은술'), req('oil', '1큰술'), opt('sesame_oil', '약간'), opt('onion', '1/2개'), opt('pa', '1/2대'), opt('cabbage', '한 줌')],
    steps: x => [
      `${prep(x, '한입 크기로')}. 양파·대파·양배추가 있으면 함께 썬다`,
      '고추장 1.5큰술, 고춧가루·간장·설탕 1큰술씩, 다진 마늘 1작은술을 섞어 양념장을 만든다',
      `${x.obj} 양념장에 버무린다`,
      '달군 팬에 기름을 두르고 센 불에서 볶는다. 채소가 있으면 함께 넣는다',
      '속까지 다 익으면 참기름을 조금 둘러 마무리한다',
    ],
  },
  {
    key: 'stirfry', name: n => `${n}볶음`, minutes: 15,
    mains: {
      zucchini: '1개', eggplant: '2개', king_mushroom: '2개', oyster_mushroom: '한 줌', shiitake: '4개', carrot: '1개',
      mung_sprout: '한 봉지', garlic_stem: '한 줌', bracken: '한 줌', cabbage: '1/4통', broccoli: '1송이', dried_shrimp: '한 줌',
      kimchi: '2컵', bacon: '4줄', sausage: '6개', spam: '1/2캔', fish_cake: '2장',
    },
    base: [req('soy_sauce', '1큰술'), req('sugar', '1/2큰술'), req('oil', '1큰술'), req('garlic', '1/2작은술'),
      opt('onion', '1/2개'), opt('sesame', '약간')],
    steps: x => [
      prep(x, '먹기 좋게'),
      '팬에 기름을 두르고 다진 마늘을 볶아 향을 낸다',
      `${x.obj} 넣고 볶는다. 양파가 있으면 채 썰어 함께 넣는다`,
      '간장 1큰술, 설탕 1/2큰술을 넣고 고루 볶아 간을 맞춘다',
      '불을 끄고 깨를 뿌린다',
    ],
  },
  {
    key: 'doenjang', name: n => `${n} 된장찌개`, minutes: 25,
    mains: {
      tofu: '1/2모', zucchini: '1/2개', clam: '한 줌', beef: '100g', beef_brisket: '100g', pork: '100g', potato: '1개',
      oyster_mushroom: '한 줌', napa: '3장',
    },
    base: [req('doenjang', '2큰술'), req('garlic', '1/2작은술'), opt('gochugaru', '1/2작은술'), opt('zucchini', '1/3개'),
      opt('onion', '1/2개'), opt('tofu', '1/2모'), opt('pa', '1/4대'), opt('chili', '1개')],
    steps: x => [
      `${prep(x, '한입 크기로')}. 애호박·양파·두부가 있으면 깍둑 썬다`,
      '냄비에 물 2컵을 붓고 된장 2큰술을 풀어 끓인다',
      `끓어오르면 ${x.obj} 넣는다`,
      '채소와 다진 마늘을 넣고 10분쯤 더 끓인다',
      '대파·고추가 있으면 넣고 한소끔 끓여 마무리한다',
    ],
  },
  {
    key: 'kimchistew', name: n => `${n} 김치찌개`, minutes: 30,
    mains: { pork: '150g', pork_belly: '150g', tuna_can: '1캔', spam: '1/2캔', bacon: '4줄', mackerel: '1마리' },
    base: [req('kimchi', '1.5컵'), req('gochugaru', '1/2큰술'), req('garlic', '1/2작은술'), req('oil', '1큰술'), req('salt', '약간'),
      opt('tofu', '1/2모'), opt('onion', '1/2개'), opt('pa', '1/4대')],
    steps: x => [
      `${prep(x, '한입 크기로')}. 김치도 한입 크기로 썬다`,
      `냄비에 기름을 두르고 김치와 ${x.obj} 넣어 5분쯤 볶는다`,
      '물 2컵과 고춧가루, 다진 마늘을 넣고 15분쯤 끓인다',
      '두부·양파가 있으면 넣고 5분 더 끓인다',
      '대파를 넣고 소금으로 간을 맞춘다',
    ],
  },
  {
    key: 'jeon', name: n => `${n}전`, minutes: 25,
    mains: { pa: '3대', potato: '2개', tuna_can: '1캔', corn: '1컵', cabbage: '1/4통', squid: '1마리', kimchi: '1컵' },
    base: [req('flour', '1/2컵'), req('salt', '약간'), req('oil', '3큰술'), opt('egg', '1개'), opt('soy_sauce', '약간'), opt('vinegar', '약간')],
    steps: x => [
      x.id === 'potato' ? '감자는 껍질을 벗기고 가늘게 채 썬다' : x.id === 'pa' ? '대파는 팬 길이에 맞춰 길게 자른다' : prep(x, '잘게'),
      '밀가루 1/2컵, 물 1/2컵, 소금 약간을 섞어 반죽을 만든다. 계란이 있으면 하나 넣는다',
      `반죽에 ${x.obj} 넣고 고루 섞는다`,
      '팬에 기름을 넉넉히 두르고 반죽을 얇게 펴서 중불에 굽는다',
      '가장자리가 노릇해지면 뒤집어 반대쪽도 바삭하게 굽는다',
      '간장에 식초를 조금 섞어 찍어 먹는다',
    ],
  },
  {
    key: 'eggfry', name: n => `${n} 계란볶음`, minutes: 10,
    mains: { tomato: '2개', chive: '한 줌', shrimp: '8마리', crab_stick: '3개', mung_sprout: '한 줌', spinach: '한 줌' },
    base: [req('egg', '3개'), req('salt', '약간'), req('oil', '2큰술'), opt('sugar', '약간'), opt('pa', '1/4대')],
    steps: x => [
      prep(x, '한입 크기로'),
      '계란 3개에 소금 약간을 넣고 곱게 푼다',
      '팬에 기름을 넉넉히 두르고 계란물을 부어 반쯤 익으면 덜어 둔다',
      `같은 팬에 ${x.obj} 넣고 센 불에서 빠르게 볶는다`,
      '계란을 다시 넣고 소금으로 간해 한 번 더 섞는다. 토마토라면 설탕을 조금 넣으면 신맛이 덜하다',
    ],
  },
  {
    key: 'eggroll', name: n => `${n} 계란말이`, minutes: 15,
    mains: { bacon: '2줄', spam: '1/4캔', crab_stick: '2개', cheese: '1장', laver: '1장', myeongran: '1/2개', chive: '한 줌' },
    base: [req('egg', '3개'), req('salt', '약간'), req('oil', '1큰술')],
    steps: x => [
      prep(x, '잘게'),
      '계란 3개에 소금 약간을 넣고 곱게 푼다',
      '약불로 달군 팬에 기름을 얇게 두르고 계란물의 절반을 붓는다',
      `반쯤 익으면 ${x.obj} 올리고 끝에서부터 돌돌 만다`,
      '남은 계란물을 이어 붓고 다시 말아 모양을 잡는다',
      '한 김 식혀 먹기 좋게 썬다',
    ],
  },
  {
    key: 'aglio', name: n => `${n} 오일 파스타`, minutes: 20,
    mains: {
      bacon: '3줄', shrimp: '8마리', clam: '한 줌', king_mushroom: '1개', button_mushroom: '4개', broccoli: '1/3송이',
      tuna_can: '1/2캔', sausage: '3개', myeongran: '1개', tomato: '1개', asparagus: '4대', spinach: '한 줌',
    },
    base: [req('pasta', '100g'), req('garlic', '4쪽'), req('oil', '4큰술'), req('salt', '약간'), req('pepper', '약간'),
      opt('chili', '1개'), opt('parsley', '약간')],
    steps: x => [
      '끓는 물에 소금을 넣고 면을 8분쯤 삶는다. 면수 반 컵은 남겨 둔다',
      `마늘은 편 썬다. ${prep(x, '먹기 좋게')}`,
      '팬에 기름을 넉넉히 두르고 약불에서 마늘을 볶아 향을 낸다. 청양고추가 있으면 함께 넣는다',
      `${x.obj} 넣고 익을 때까지 볶는다`,
      '삶은 면과 면수를 넣고 센 불에서 1~2분 섞어 소스가 면에 붙게 한다',
      '소금·후추로 간하고, 파슬리가 있으면 뿌린다',
    ],
  },
  {
    key: 'ramyeon', name: n => `${n}라면`, minutes: 10,
    mains: { cheese: '1장', kimchi: '1/2컵', egg: '1개', rice_cake: '한 줌', dumpling: '4개', bean_sprout: '한 줌' },
    base: [req('ramyeon', '1개'), opt('pa', '1/4대'), opt('egg', '1개')],
    steps: x => [
      '냄비에 물 550ml를 붓고 끓인다',
      x.id === 'cheese' || x.id === 'egg' ? '물이 끓으면 면과 스프를 넣는다'
        : `물이 끓으면 면과 스프, ${x.obj} 함께 넣는다`,
      x.id === 'egg' ? '1분 남았을 때 계란을 깨 넣는다' : x.id === 'cheese' ? '불을 끄기 직전 치즈를 올린다' : '면이 익으면 계란이 있으면 깨 넣는다',
      '대파를 송송 썰어 올려 마무리한다',
    ],
  },
  {
    key: 'gui', name: n => `${n}구이`, minutes: 20,
    mains: {
      pork_belly: '200g', pork_neck: '200g', beef: '200g', duck: '200g', mackerel: '1마리', spanish_mackerel: '1토막',
      hairtail: '2토막', salmon: '1토막', eel: '1마리', squid: '1마리', tofu: '1모', king_mushroom: '2개', eggplant: '1개',
      spam: '1/2캔', sausage: '6개',
    },
    base: [req('salt', '약간'), req('pepper', '약간'), req('oil', '1큰술')],
    steps: x => [
      x.cat === '육류' || x.cat === '해산물' ? `${x.obj} 키친타월로 물기를 닦고 소금·후추를 앞뒤로 뿌린다`
        : x.cat === '가공식품' && x.id !== 'tofu' ? `${x.obj} 도톰하게 썬다` : `${x.obj} 도톰하게 썰어 소금을 살짝 뿌린다`,
      '팬을 달군 뒤 기름을 얇게 두른다',
      `${x.obj} 올려 중불에서 한쪽이 노릇해질 때까지 굽는다`,
      '뒤집어 반대쪽도 속까지 익힌다',
      x.cat === '해산물' ? '간장이나 레몬을 곁들인다' : x.cat === '육류' ? '참기름에 소금·후추를 섞은 기름장에 찍어 먹는다' : '그대로 먹거나 간장을 곁들인다',
    ],
  },
  {
    key: 'guk', name: n => `${n}국`, minutes: 20,
    mains: { egg: '2개', fish_cake: '2장', potato: '1개', radish: '1/4개', bean_sprout: '한 봉지', dried_pollock: '한 줌' },
    base: [req('soy_sauce', '1큰술'), req('salt', '약간'), req('garlic', '1/2작은술'), opt('pa', '1/4대'), opt('anchovy', '5마리'), opt('kelp', '1장')],
    steps: x => [
      x.id === 'egg' ? '계란은 곱게 풀어 둔다' : prep(x, '먹기 좋게'),
      '냄비에 물 3컵을 붓고 끓인다. 멸치나 다시마가 있으면 먼저 넣어 10분 우린 뒤 건진다',
      x.id === 'egg' ? '국물이 끓으면 계란물을 줄을 긋듯 천천히 붓는다' : `${x.obj} 넣고 익을 때까지 끓인다`,
      '간장 1큰술과 소금으로 간하고 다진 마늘을 조금 넣는다',
      '대파를 송송 썰어 넣고 한소끔 끓인다',
    ],
  },
]

const key = (s: string) => s.replace(/\s+/g, '')

function mainOf(id: string): Main {
  const ing = BY_ID.get(id)
  if (!ing) throw new Error(`공식 레시피에 없는 재료: ${id}`)
  const n = SHORT[id] ?? ing.name
  return { id, n, obj: withObject(n), cat: ing.category }
}

/** 공식 × 주재료로 레시피를 만든다. 손으로 쓴 요리와 이름(띄어쓰기 무시)이 같으면 건너뛰고,
 *  식약처 요리와 같으면 '간단'을 붙여 둘 다 남긴다 (식약처 고등어구이는 꿀·발사믹식초까지 필요하다) */
export function formulaRecipes(existing: Recipe[]): Recipe[] {
  const manual = new Set(existing.filter(r => r.source === 'manual').map(r => key(r.name)))
  const other = new Set(existing.filter(r => r.source !== 'manual').map(r => key(r.name)))
  const out: Recipe[] = []
  for (const f of FORMULAS) {
    for (const [id, amount] of Object.entries(f.mains)) {
      const x = mainOf(id)
      let name = f.name(x.n)
      if (manual.has(key(name))) continue
      if (other.has(key(name))) name = `간단 ${name}`
      manual.add(key(name))
      out.push({
        id: `f-${f.key}-${id}`, name, minutes: f.minutes, source: 'formula', main: [id],
        ingredients: [{ id, amount }, ...f.base.filter(i => i.id !== id)],
        steps: f.steps(x),
      })
    }
  }
  return out
}
