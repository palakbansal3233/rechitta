import type { InjectionKey } from 'vue'
import type { Answer } from '~~/types'
import { normaliseError, type NormalisedError } from './useApi'

export type AgentMode = 'idle' | 'listening' | 'thinking' | 'answered' | 'failed'

/** Nothing under this length is worth sending to the agent. */
const MIN_QUERY = 2
/** Stop listening automatically after this long without new speech. */
const SILENCE_MS = 2600
/** Hard cap so a forgotten open mic does not run forever. */
const MAX_LISTEN_MS = 30_000

export function createAgentSession() {
  const { $api } = useNuxtApp()
  const mic = useMicrophone()
  const speech = useSpeech()
  const { announce } = useAnnouncer()

  const mode = ref<AgentMode>('idle')
  const answer = ref<Answer | null>(null)
  const error = ref<NormalisedError | null>(null)
  /** The question currently in flight or answered, for the header pill. */
  const lastQuery = ref('')
  /** Typed fallback, used when speech recognition is unavailable. */
  const draft = ref('')
  const micNotice = ref<string | null>(null)

  let silenceTimer: ReturnType<typeof setTimeout> | undefined
  let hardStop: ReturnType<typeof setTimeout> | undefined
  let lastTranscript = ''

  const liveTranscript = computed(() => speech.transcript.value)

  const canUseSpeech = computed(() => speech.supported.value && mic.state.value === 'granted')

  function clearTimers() {
    clearTimeout(silenceTimer)
    clearTimeout(hardStop)
  }

  function armSilenceTimer() {
    clearTimeout(silenceTimer)
    silenceTimer = setTimeout(() => {
      if (mode.value === 'listening') void stopListening()
    }, SILENCE_MS)
  }

  // Any new words restart the silence countdown.
  watch(liveTranscript, (t) => {
    if (mode.value !== 'listening') return
    if (t && t !== lastTranscript) {
      lastTranscript = t
      armSilenceTimer()
    }
  })

  async function startListening() {
    if (mode.value === 'listening') return
    error.value = null
    micNotice.value = null

    const ok = await mic.start()
    if (!ok) {
      micNotice.value = mic.errorMessage.value
      announce(mic.errorMessage.value ?? 'Microphone unavailable.')
      return
    }

    lastTranscript = ''
    speech.reset()
    if (speech.supported.value) speech.start()
    mode.value = 'listening'
    announce('Listening. Ask your question.')

    armSilenceTimer()
    hardStop = setTimeout(() => {
      if (mode.value === 'listening') void stopListening()
    }, MAX_LISTEN_MS)
  }

  function cancelListening() {
    clearTimers()
    speech.stop()
    mic.stop()
    mode.value = answer.value ? 'answered' : 'idle'
    announce('Stopped listening.')
  }

  async function stopListening() {
    clearTimers()
    const heard = speech.transcript.value.trim()
    speech.stop()
    mic.stop()

    if (heard.length >= MIN_QUERY) {
      await submit(heard)
      return
    }

    mode.value = answer.value ? 'answered' : 'idle'
    micNotice.value = speech.supported.value
      ? "I didn't catch that. Try again, or type your question."
      : 'This browser cannot transcribe speech. Type your question and I will answer it.'
    announce(micNotice.value)
  }

  /**
   * Every question is a navigation: the answer lives at its own URL, so it can
   * be linked, refreshed and reached with the browser's back button.
   */
  async function submit(text: string) {
    const query = text.trim()
    if (query.length < MIN_QUERY) return
    draft.value = ''
    await navigateTo({ path: '/ask', query: { q: query } })
  }

  /** Runs the request. `/ask` calls this from the URL, not the caller. */
  async function ask(text: string) {
    const query = text.trim()
    if (query.length < MIN_QUERY) return
    if (lastQuery.value === query && answer.value && mode.value === 'answered') return

    lastQuery.value = query
    draft.value = ''
    error.value = null
    micNotice.value = null
    mode.value = 'thinking'
    announce('Thinking about: ' + query)

    try {
      const result = await $api<Answer>('/api/query', { method: 'POST', body: { text: query } })
      answer.value = result
      mode.value = 'answered'
      announce(result.summary)
    } catch (e) {
      error.value = normaliseError(e)
      mode.value = 'failed'
      announce(error.value.message)
    }
  }

  function retry() {
    if (lastQuery.value) void ask(lastQuery.value)
  }

  /** Clears the answer without navigating; `/project` owns the route change. */
  function clearAnswer() {
    answer.value = null
    error.value = null
    lastQuery.value = ''
    mode.value = 'idle'
  }

  async function dismissAnswer() {
    clearAnswer()
    announce('Back to the project.')
    await navigateTo('/properties')
  }

  onBeforeUnmount(clearTimers)

  return {
    mic,
    speech,
    mode,
    answer,
    error,
    lastQuery,
    draft,
    micNotice,
    liveTranscript,
    canUseSpeech,
    startListening,
    stopListening,
    cancelListening,
    submit,
    ask,
    retry,
    clearAnswer,
    dismissAnswer,
  }
}

export type AgentSession = ReturnType<typeof createAgentSession>

export const AgentKey: InjectionKey<AgentSession> = Symbol('agent-session')

export function useAgent(): AgentSession {
  const session = inject(AgentKey)
  if (!session) throw new Error('useAgent() called outside of an <AgentProvider>')
  return session
}
