import type { ReactNode } from 'react'

/** 로고: 재료가 담긴 뚝배기에 계란이 퐁당 (앱 아이콘과 같은 그림, brand/icon5/make.mjs) */
export function Mark({ className = '' }: { className?: string }) {
  return <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className={`rounded-md ${className}`} />
}

export function Header({ hi, title, brand = true }: { hi?: ReactNode; title: ReactNode; brand?: boolean }) {
  return (
    <header className="pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-2.5">
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

