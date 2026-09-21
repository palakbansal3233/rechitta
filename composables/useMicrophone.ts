export type MicState =
  | 'unsupported'
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'no-device'
  | 'error'

/**
 * Live frequency energy, 0..1 per band. Deliberately a plain mutable object,
 * not a ref: the orb reads it 60 times a second inside its own rAF loop and
 * must not trigger a Vue re-render doing so.
 */
export interface AudioBands {
  bass: number
  mid: number
  treble: number
  level: number
  /** Rises fast, falls slow - used for the "is someone talking" affordance. */
  peak: number
}

export function createBands(): AudioBands {
  return { bass: 0, mid: 0, treble: 0, level: 0, peak: 0 }
}

const FFT_SIZE = 1024

/**
 * Microphone capture and real-time FFT analysis.
 *
 * One AudioContext and one analyser for the whole app. A single rAF loop
 * writes into a shared `bands` object; a low-frequency (~12Hz) reactive
 * mirror is exposed for UI that genuinely needs to re-render, so the
 * expensive path stays render-free.
 */
export function useMicrophone() {
  const state = ref<MicState>('idle')
  const errorMessage = ref<string | null>(null)
  const listening = ref(false)

  /** Reactive, throttled copy for meters and aria-live text. */
  const uiLevel = ref(0)

  const bands = createBands()

  let ctx: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let source: MediaStreamAudioSourceNode | null = null
  let stream: MediaStream | null = null
  let freq: Uint8Array<ArrayBuffer> | null = null
  let raf = 0
  let lastUiPush = 0

  const supported = () =>
    typeof window !== 'undefined' &&
    !!navigator?.mediaDevices?.getUserMedia &&
    !!(window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)

  /** Average of a slice of the spectrum, normalised and gently gamma-curved. */
  function bandEnergy(data: Uint8Array, from: number, to: number) {
    let sum = 0
    for (let i = from; i < to; i++) sum += data[i]!
    const avg = sum / Math.max(1, to - from) / 255
    return Math.min(1, Math.pow(avg, 0.78) * 1.35)
  }

  function tick() {
    raf = requestAnimationFrame(tick)
    if (!analyser || !freq) return
    analyser.getByteFrequencyData(freq)

    const n = freq.length
    // 0-250Hz, 250-2kHz, 2k-8kHz at a 48kHz sample rate over 512 bins.
    const target = {
      bass: bandEnergy(freq, 1, Math.floor(n * 0.06)),
      mid: bandEnergy(freq, Math.floor(n * 0.06), Math.floor(n * 0.28)),
      treble: bandEnergy(freq, Math.floor(n * 0.28), Math.floor(n * 0.66)),
    }
    const level = target.bass * 0.5 + target.mid * 0.35 + target.treble * 0.15

    // Extra smoothing on top of the analyser's own, so the orb never jitters.
    bands.bass += (target.bass - bands.bass) * 0.22
    bands.mid += (target.mid - bands.mid) * 0.25
    bands.treble += (target.treble - bands.treble) * 0.3
    bands.level += (level - bands.level) * 0.2
    bands.peak = Math.max(bands.level, bands.peak * 0.94)

    const now = performance.now()
    if (now - lastUiPush > 80) {
      lastUiPush = now
      uiLevel.value = Math.round(bands.peak * 100) / 100
    }
  }

  function decay() {
    // Ease everything back to rest rather than snapping when input stops.
    raf = requestAnimationFrame(decay)
    bands.bass *= 0.93
    bands.mid *= 0.93
    bands.treble *= 0.93
    bands.level *= 0.93
    bands.peak *= 0.9
    if (bands.level < 0.002) {
      bands.bass = bands.mid = bands.treble = bands.level = bands.peak = 0
      uiLevel.value = 0
      cancelAnimationFrame(raf)
      raf = 0
    }
  }

  /** Read the permission without prompting, where the browser allows it. */
  async function probe() {
    if (!supported()) {
      state.value = 'unsupported'
      return state.value
    }
    try {
      const status = await navigator.permissions?.query({ name: 'microphone' as PermissionName })
      if (status) {
        if (status.state === 'granted') state.value = 'granted'
        else if (status.state === 'denied') state.value = 'denied'
        status.onchange = () => {
          if (status.state === 'denied') state.value = 'denied'
          if (status.state === 'granted' && state.value === 'denied') state.value = 'idle'
        }
      }
    } catch {
      /* Firefox and Safari do not expose the microphone permission; ignore. */
    }
    return state.value
  }

  async function request(): Promise<boolean> {
    if (!supported()) {
      state.value = 'unsupported'
      errorMessage.value = 'This browser cannot capture audio. Try Chrome, Edge or Safari.'
      return false
    }
    if (stream) {
      state.value = 'granted'
      return true
    }

    state.value = 'requesting'
    errorMessage.value = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      state.value = 'granted'
      return true
    } catch (e) {
      const err = e as DOMException
      if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') {
        state.value = 'denied'
        errorMessage.value =
          'Microphone access is blocked. Allow it in your browser settings, or carry on by typing.'
      } else if (err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError') {
        state.value = 'no-device'
        errorMessage.value = 'No microphone found. Plug one in, or carry on by typing.'
      } else {
        state.value = 'error'
        errorMessage.value = 'We could not open your microphone. Try again, or carry on by typing.'
      }
      return false
    }
  }

  async function start(): Promise<boolean> {
    if (!(await request())) return false
    if (!stream) return false

    if (!ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new Ctor()
    }
    if (ctx.state === 'suspended') await ctx.resume()

    if (!analyser) {
      analyser = ctx.createAnalyser()
      analyser.fftSize = FFT_SIZE
      analyser.smoothingTimeConstant = 0.72
      analyser.minDecibels = -85
      analyser.maxDecibels = -18
      freq = new Uint8Array(analyser.frequencyBinCount)
    }
    if (!source) {
      source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)
      // Deliberately not connected to the destination: no feedback loop.
    }

    listening.value = true
    if (raf) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(tick)
    return true
  }

  function stop() {
    listening.value = false
    if (raf) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(decay)
    void ctx?.suspend()
  }

  /** Full teardown, including releasing the OS-level recording indicator. */
  function release() {
    stop()
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    source?.disconnect()
    source = null
    stream?.getTracks().forEach((t) => t.stop())
    stream = null
    void ctx?.close()
    ctx = null
    analyser = null
    freq = null
    state.value = state.value === 'granted' ? 'idle' : state.value
  }

  function onVisibility() {
    if (document.hidden && listening.value) stop()
  }

  onMounted(() => document.addEventListener('visibilitychange', onVisibility))
  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onVisibility)
    release()
  })

  return { state, errorMessage, listening, uiLevel, bands, supported, probe, request, start, stop, release }
}

export type MicrophoneController = ReturnType<typeof useMicrophone>
