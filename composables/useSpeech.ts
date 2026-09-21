/**
 * Thin wrapper over the Web Speech API.
 *
 * Support is genuinely patchy (Chrome and Safari yes, Firefox no), so this
 * reports `supported` honestly and the UI always keeps a typed path open.
 * Transcription is a bonus: the orb's audio reactivity does not depend on it.
 */

interface SpeechAlt {
  transcript: string
  confidence: number
}
interface SpeechResult {
  isFinal: boolean
  0: SpeechAlt
  length: number
}
interface SpeechEvent extends Event {
  resultIndex: number
  results: { length: number; [i: number]: SpeechResult }
}
interface SpeechErrorEvent extends Event {
  error: string
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: SpeechEvent) => void) | null
  onerror: ((e: SpeechErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}
type SpeechCtor = new () => SpeechRecognitionLike

function getCtor(): SpeechCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechCtor
    webkitSpeechRecognition?: SpeechCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function useSpeech() {
  const supported = ref(false)
  const active = ref(false)
  const interim = ref('')
  const final = ref('')
  const error = ref<string | null>(null)

  let rec: SpeechRecognitionLike | null = null
  let stoppedByUs = false

  onMounted(() => {
    supported.value = !!getCtor()
  })

  const transcript = computed(() => (final.value + ' ' + interim.value).trim())

  function start() {
    const Ctor = getCtor()
    if (!Ctor) {
      supported.value = false
      return
    }
    stop()
    error.value = null
    interim.value = ''
    final.value = ''

    rec = new Ctor()
    rec.lang = navigator.language?.startsWith('en') ? navigator.language : 'en-GB'
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onstart = () => {
      active.value = true
    }
    rec.onresult = (e) => {
      let live = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]!
        if (r.isFinal) final.value = (final.value + ' ' + r[0].transcript).trim()
        else live += r[0].transcript
      }
      interim.value = live
    }
    rec.onerror = (e) => {
      // `aborted` and `no-speech` are normal parts of the flow, not failures.
      if (e.error === 'aborted' || (e.error === 'no-speech' && stoppedByUs)) return
      error.value =
        e.error === 'not-allowed'
          ? 'Speech recognition was blocked by the browser.'
          : e.error === 'no-speech'
            ? "I didn't hear anything."
            : e.error === 'network'
              ? 'Speech recognition needs a connection.'
              : 'Speech recognition stopped unexpectedly.'
    }
    rec.onend = () => {
      active.value = false
    }

    stoppedByUs = false
    try {
      rec.start()
    } catch {
      /* start() throws if called twice in a row; harmless. */
    }
  }

  function stop() {
    stoppedByUs = true
    try {
      rec?.stop()
    } catch {
      /* not started */
    }
    rec = null
    active.value = false
  }

  function reset() {
    interim.value = ''
    final.value = ''
    error.value = null
  }

  onBeforeUnmount(stop)

  return { supported, active, interim, final, transcript, error, start, stop, reset }
}
