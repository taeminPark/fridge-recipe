import type { ReactNode } from 'react'

/** 로고: 테이프에 체크를 오려낸 마크 (brand/mark.svg와 같은 도형) */
export function Mark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} aria-hidden>
      <path fill="currentColor" fillRule="evenodd" d={MARK_PATH} />
    </svg>
  )
}

export function Header({ hi, title, brand = true }: { hi?: ReactNode; title: ReactNode; brand?: boolean }) {
  return (
    <header className="pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-5">
      {brand && (
        <p className="flex items-center gap-1.5 font-title text-sm text-rose">
          <Mark className="size-6" />있잖아
        </p>
      )}
      {hi && <p className="mt-4 text-sm text-soft">{hi}</p>}
      <h1 className="mt-0.5 font-title text-[2.4rem] leading-tight">{title}</h1>
    </header>
  )
}

export function SectionTitle({ id, children, count, aside }: { id?: string; children: ReactNode; count?: number; aside?: ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-line pb-2.5">
      <h2 id={id} className="font-title text-[1.4rem] leading-none">{children}</h2>
      {count !== undefined && (
        <span className="grid h-6 min-w-6 place-items-center rounded-full border border-rose px-1.5 text-xs font-bold text-rose">{count}</span>
      )}
      {aside && <span className="ml-auto text-xs text-soft">{aside}</span>}
    </div>
  )
}

/** 금테 두른 동그란 접시에 담긴 레시피 사진. 사진이 없으면 빈 접시에 요리 이름.
 * 테는 box-shadow 대신 박스 안쪽 border로 그리고 사진에 transform을 쓰지 않는다:
 * iOS 사파리에서 탭을 바꿀 때 원 바깥 그림자가 지워지지 않고 잔상으로 남았다 */
export function RecipePhoto({ src, name, className = '' }: { src?: string; name: string; className?: string }) {
  return (
    <div className={`rounded-full border border-rose/35 bg-card p-[3px] ${className}`}>
      <div className="size-full overflow-hidden rounded-full">
        {src ? (
          // 사진 가장자리 여백을 잘라내려고 12% 크게 (scale 대신 크기·여백으로)
          <img src={src} alt="" loading="lazy" className="-m-[6%] size-[112%] max-w-none object-cover" />
        ) : (
          <div className="grid size-full place-items-center p-[12%] text-center font-title leading-tight text-rose">{name}</div>
        )}
      </div>
    </div>
  )
}

const MARK_PATH = 'M28.8 83.4 L211.0 57.8 L203.3 67.2 L213.3 74.2 L205.6 83.6 L215.6 90.6 L207.9 100.0 L218.0 107.0 L210.2 116.4 L220.3 123.4 L212.5 132.9 L222.6 139.8 L214.8 149.3 L224.9 156.2 L217.1 165.7 L227.2 172.6 L45.0 198.2 L52.7 188.8 L42.7 181.8 L50.4 172.4 L40.4 165.4 L48.1 156.0 L38.0 149.0 L45.8 139.6 L35.7 132.6 L43.5 123.1 L33.4 116.2 L41.2 106.7 L31.1 99.8 L38.9 90.3 Z M82.9 140.9 L121.8 170.2 L173.3 101.9 L154.1 87.5 L117.1 136.6 L97.3 121.7 Z'
