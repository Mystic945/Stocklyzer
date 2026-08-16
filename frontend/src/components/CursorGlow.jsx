import { useEffect, useRef } from 'react'

/**
 * A fixed, full-viewport overlay that renders a soft radial "spotlight"
 * following the cursor. Sits above the ambient background but below page
 * content (content itself has no background, so the glow reads through).
 */
export default function CursorGlow() {
  const ref = useRef(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const raf = useRef(null)

  useEffect(() => {
    const handleMove = (e) => {
      target.current.x = e.clientX
      target.current.y = e.clientY
    }
    const handleTouch = (e) => {
      if (e.touches?.[0]) {
        target.current.x = e.touches[0].clientX
        target.current.y = e.touches[0].clientY
      }
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('touchmove', handleTouch, { passive: true })

    const animate = () => {
      // Ease toward the target so the glow trails slightly rather than snapping —
      // reads as fluid/watery rather than mechanical.
      current.current.x += (target.current.x - current.current.x) * 0.12
      current.current.y += (target.current.y - current.current.y) * 0.12
      if (ref.current) {
        ref.current.style.setProperty('--glow-x', `${current.current.x}px`)
        ref.current.style.setProperty('--glow-y', `${current.current.y}px`)
      }
      raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('touchmove', handleTouch)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return <div ref={ref} className="cursor-glow" aria-hidden="true" />
}
