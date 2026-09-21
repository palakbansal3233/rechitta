import type { H3Event } from 'h3'
import type { Scenario } from '~~/types'

const SCENARIOS: Scenario[] = ['ok', 'slow', 'error', 'empty', 'offline']

/**
 * The client sends `x-mock-scenario` on every request (see `useApi`).
 * A query string override is kept so endpoints stay pokeable with curl:
 *   curl 'localhost:3000/api/chapters?scenario=error'
 */
export function readScenario(event: H3Event): Scenario {
  const header = getRequestHeader(event, 'x-mock-scenario')
  const query = getQuery(event).scenario
  const raw = String(query ?? header ?? 'ok')
  return (SCENARIOS as string[]).includes(raw) ? (raw as Scenario) : 'ok'
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Wraps a handler with the behaviour a real network has and a happy-path
 * fixture does not: variable latency, transport failures, and empty results.
 *
 * `base` is the median latency in ms; real jitter is +/-40%.
 */
export async function mockRespond<T>(
  event: H3Event,
  base: number,
  produce: () => T,
  emptyValue?: T,
): Promise<T> {
  const scenario = readScenario(event)

  if (scenario === 'offline') {
    await wait(600)
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      data: { code: 'offline', message: 'Rechitta is offline. Check your connection and try again.' },
    })
  }

  const jitter = 0.6 + Math.random() * 0.8
  const delay = scenario === 'slow' ? base * 4.5 : base * jitter
  await wait(Math.round(delay))

  if (scenario === 'error') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        code: 'server_error',
        message: 'Rechitta could not reach the listings service.',
      },
    })
  }

  if (scenario === 'empty' && emptyValue !== undefined) return emptyValue

  return produce()
}
