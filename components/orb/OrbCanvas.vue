<script setup lang="ts">
import type { AudioBands } from '~/composables/useMicrophone'
import { FRAGMENT_SHADER, VERTEX_SHADER } from './orb-shader'

/**
 * The orb.
 *
 * A single full-quad WebGL draw call: the Figma orb PNG is sampled in
 * "sphere space" and displaced, refracted and rim-lit by live microphone
 * FFT bands. One draw call, no 3D library, no per-frame allocation, and no
 * Vue reactivity in the hot path - `bands` is a plain mutable object the
 * render loop reads directly.
 *
 * Degrades in three steps: WebGL + audio → WebGL idle animation → static
 * image (no WebGL, or prefers-reduced-motion).
 */
const props = withDefaults(
  defineProps<{
    bands?: AudioBands | null
    /** Drives the idle / thinking pulse independently of the microphone. */
    mode?: 'idle' | 'listening' | 'thinking'
    /** Extra multiplier on all audio response, for smaller instances. */
    gain?: number
    decorative?: boolean
    /** Screen 2 and the welcome hero use different orb artwork. */
    texture?: string
  }>(),
  { bands: null, mode: 'idle', gain: 1, decorative: true, texture: '/media/orb-1024.webp' },
)

const host = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const failed = ref(false)
const reduced = useReducedMotion()

const MAX_DPR = 1.75
const MAX_EDGE = 1100

let gl: WebGLRenderingContext | null = null
let program: WebGLProgram | null = null
let raf = 0
let start = 0
let visible = true
let intersecting = true
let think = 0
let reveal = 0
let ro: ResizeObserver | null = null
let io: IntersectionObserver | null = null

const u: Record<string, WebGLUniformLocation | null> = {}

function compile(ctx: WebGLRenderingContext, type: number, src: string) {
  const sh = ctx.createShader(type)!
  ctx.shaderSource(sh, src)
  ctx.compileShader(sh)
  if (!ctx.getShaderParameter(sh, ctx.COMPILE_STATUS)) {
    if (import.meta.dev) console.error('[orb] shader', ctx.getShaderInfoLog(sh))
    ctx.deleteShader(sh)
    return null
  }
  return sh
}

function setup(): boolean {
  const el = canvas.value
  if (!el) return false

  const ctx = (el.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    desynchronized: true,
    powerPreference: 'low-power',
  }) ?? el.getContext('experimental-webgl')) as WebGLRenderingContext | null

  if (!ctx) return false
  gl = ctx

  const vs = compile(ctx, ctx.VERTEX_SHADER, VERTEX_SHADER)
  const fs = compile(ctx, ctx.FRAGMENT_SHADER, FRAGMENT_SHADER)
  if (!vs || !fs) return false

  program = ctx.createProgram()!
  ctx.attachShader(program, vs)
  ctx.attachShader(program, fs)
  ctx.linkProgram(program)
  if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
    if (import.meta.dev) console.error('[orb] link', ctx.getProgramInfoLog(program))
    return false
  }
  ctx.useProgram(program)

  const buf = ctx.createBuffer()
  ctx.bindBuffer(ctx.ARRAY_BUFFER, buf)
  ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW)
  const loc = ctx.getAttribLocation(program, 'aPos')
  ctx.enableVertexAttribArray(loc)
  ctx.vertexAttribPointer(loc, 2, ctx.FLOAT, false, 0, 0)

  for (const name of ['uRes', 'uTime', 'uBass', 'uMid', 'uTreble', 'uLevel', 'uThink', 'uReveal', 'uTex']) {
    u[name] = ctx.getUniformLocation(program, name)
  }

  // A 1x1 neutral texel keeps the first frames valid while the PNG loads.
  const tex = ctx.createTexture()
  ctx.bindTexture(ctx.TEXTURE_2D, tex)
  ctx.texImage2D(
    ctx.TEXTURE_2D, 0, ctx.RGBA, 1, 1, 0, ctx.RGBA, ctx.UNSIGNED_BYTE,
    new Uint8Array([40, 30, 60, 255]),
  )
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE)
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE)
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR)
  ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR)
  ctx.uniform1i(u.uTex!, 0)

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.decoding = 'async'
  img.src = props.texture
  img.onload = () => {
    if (!gl) return
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
  }
  img.onerror = () => {
    /* keep the flat texel; the orb still renders as a coloured sphere */
  }

  return true
}

function resize() {
  const el = canvas.value
  const box = host.value
  if (!el || !box || !gl) return
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
  const cssW = box.clientWidth || 1
  const cssH = box.clientHeight || 1
  const w = Math.max(1, Math.min(MAX_EDGE, Math.round(cssW * dpr)))
  const h = Math.max(1, Math.min(MAX_EDGE, Math.round(cssH * dpr)))
  if (el.width === w && el.height === h) return
  el.width = w
  el.height = h
  gl.viewport(0, 0, w, h)
}

function frame(now: number) {
  raf = requestAnimationFrame(frame)
  if (!gl || !program) return
  if (!visible || !intersecting) return

  if (!start) start = now
  const t = reduced.value ? 12.5 : (now - start) / 1000

  const target = props.mode === 'thinking' ? 1 : 0
  think += (target - think) * 0.06
  reveal += (1 - reveal) * 0.05

  const b = props.bands
  const g = reduced.value ? 0.18 : props.gain
  const bass = (b?.bass ?? 0) * g
  const mid = (b?.mid ?? 0) * g
  const treble = (b?.treble ?? 0) * g
  const level = (b?.level ?? 0) * g

  gl.uniform2f(u.uRes!, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.uniform1f(u.uTime!, t)
  gl.uniform1f(u.uBass!, bass)
  gl.uniform1f(u.uMid!, mid)
  gl.uniform1f(u.uTreble!, treble)
  gl.uniform1f(u.uLevel!, level)
  gl.uniform1f(u.uThink!, think)
  gl.uniform1f(u.uReveal!, reveal)

  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

function onVisibility() {
  visible = !document.hidden
}

onMounted(() => {
  // Reduced motion still renders through WebGL; `frame()` simply freezes the
  // clock and damps the audio response rather than dropping to a static image.
  failed.value = !setup()
  if (failed.value) return

  resize()
  ro = new ResizeObserver(resize)
  if (host.value) ro.observe(host.value)

  io = new IntersectionObserver(
    ([entry]) => {
      intersecting = !!entry?.isIntersecting
    },
    { rootMargin: '120px' },
  )
  if (host.value) io.observe(host.value)

  document.addEventListener('visibilitychange', onVisibility)
  raf = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  document.removeEventListener('visibilitychange', onVisibility)
  ro?.disconnect()
  io?.disconnect()
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
  gl = null
  program = null
})
</script>

<template>
  <div
    ref="host"
    class="relative isolate aspect-square w-full"
    :aria-hidden="decorative ? 'true' : undefined"
  >
    <canvas
      v-show="!failed"
      ref="canvas"
      class="block h-full w-full motion-safe:animate-[orb-in_1200ms_var(--ease-out-expo)_both]"
    />

    <!-- No WebGL: the source artwork, still alive via CSS. -->
    <img
      v-if="failed"
      :src="texture"
      alt=""
      width="1024"
      height="1024"
      class="h-full w-full scale-[0.86] object-contain mix-blend-screen motion-safe:animate-[orb-breathe_7s_ease-in-out_infinite]"
    >
  </div>
</template>

<style scoped>
@keyframes orb-in {
  from {
    opacity: 0;
    transform: scale(0.88);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes orb-breathe {
  0%,
  100% {
    transform: scale(0.86);
  }
  50% {
    transform: scale(0.91);
  }
}
</style>
