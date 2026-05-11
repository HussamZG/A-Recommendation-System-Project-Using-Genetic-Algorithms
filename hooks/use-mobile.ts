// خطاف (Hook) للتحقق من حجم الشاشة: يُرجع true إن كان العرض أقل من 768px (جهاز محمول)
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    mql.addEventListener("change", onChange)

    // تأخير setState لتجنب خطأ التأثير المتزامن
    Promise.resolve().then(() => {
      if (isMobile === undefined) {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      }
    })

    return () => mql.removeEventListener("change", onChange)
  }, [isMobile])

  return !!isMobile
}
