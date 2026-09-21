/**
 * Pointer parallax for a hero object: the element leans toward the cursor and
 * eases back, the way product marketing pages animate a floating product shot.
 *
 * Three deliberate constraints:
 *  - It writes CSS custom properties rather than touching `transform`, so the
 *    element can still carry its own float animation without the two fighting.
 *  - Nothing is reactive. Pointer position lands in plain locals and the frame
 *    loop reads them, so moving the mouse never triggers a Vue re-render.
 *  - It only runs on a wide screen with a real pointer, and never when the
 *    reader has asked for reduced motion.
 */
export function usePointerTilt(strength = 1) {
  const target = ref<HTMLElement | null>(null)
  const reduced = useReducedMotion()

  let raf = 0
  let wantX = 0
  let wantY = 0
  let haveX = 0
  let haveY = 0

  function onMove(event: PointerEvent) {
    wantX = (event.clientX / window.innerWidth) * 2 - 1
    wantY = (event.clientY / window.innerHeight) * 2 - 1
  }

  function frame() {
    /* Ease toward the pointer rather than tracking it, so the object feels
       weighted instead of glued to the cursor. */
    haveX += (wantX - haveX) * 0.045
    haveY += (wantY - haveY) * 0.045

    const el = target.value
    if (el) {
      el.style.setProperty('--tilt-x', `${(-haveY * 5 * strength).toFixed(2)}deg`)
      el.style.setProperty('--tilt-y', `${(haveX * 7 * strength).toFixed(2)}deg`)
      el.style.setProperty('--tilt-dx', `${(haveX * 16 * strength).toFixed(1)}px`)
      el.style.setProperty('--tilt-dy', `${(haveY * 11 * strength).toFixed(1)}px`)
    }
    raf = requestAnimationFrame(frame)
  }

  onMounted(() => {
    if (reduced.value) return
    if (!window.matchMedia('(min-width: 64rem) and (pointer: fine)').matches) return
    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(frame)
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('pointermove', onMove)
  })

  return target
}
