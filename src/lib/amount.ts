// 레시피 양을 말하듯이 바꾼다: 큰술 → 숟가락, 작은술 → 티스푼. 바꾼 경우에만 표준 계량을 함께 준다
export type Spoken = { text: string; standard?: string }

const COUNT = ['', '한', '두', '세', '네', '다섯']
const TSP = ['', '하나', '둘', '셋', '넷', '다섯']

function words(n: number, unit: string, counts: string[]) {
  const whole = Math.floor(n)
  const half = n - whole === 0.5
  if (whole === 0 && half) return `${unit} 반`
  if (!counts[whole]) return null
  return unit === '숟가락' ? `${counts[whole]} 숟가락${half ? ' 반' : ''}` : `${unit} ${counts[whole]}${half ? ' 반' : ''}`
}

export function spokenAmount(amount: string): Spoken {
  const a = amount.trim()
  const spoon = a.match(/^([\d.]+|\d+\/\d+)\s*(큰술|작은술)$/)
  if (spoon) {
    const [, num, std] = spoon
    const unit = std === '큰술' ? '숟가락' : '티스푼'
    let text: string | null = null
    if (num === '1/2') text = std === '큰술' ? '반 숟가락' : '티스푼 반'
    else if (num.includes('/')) text = `${unit} ${num}`
    else text = words(Number(num), unit, std === '큰술' ? COUNT : TSP)
    return text ? { text, standard: a } : { text: a }
  }
  const half = a.match(/^1\/2\s*(\S+)$/)
  if (half && !/[\d]/.test(half[1])) return { text: `반 ${half[1]}` }
  return { text: a }
}
