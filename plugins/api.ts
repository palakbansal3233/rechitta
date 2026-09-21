/**
 * `$api`: the app's `$fetch`, carrying the mock scenario.
 *
 * `?scenario=error|empty|slow|offline` on any page URL is picked up once (see
 * app.vue) and then sent as `x-mock-scenario` on every request for the rest of
 * the session. That makes each loading, empty and error state one link away,
 * without devtools and without editing endpoint URLs by hand.
 */
export default defineNuxtPlugin(() => {
  const scenario = useState<string | null>('mock-scenario', () => null)

  const api = $fetch.create({
    onRequest({ options }) {
      if (!scenario.value) return
      const headers = new Headers(options.headers as HeadersInit | undefined)
      headers.set('x-mock-scenario', scenario.value)
      options.headers = headers
    },
  })

  return { provide: { api } }
})
