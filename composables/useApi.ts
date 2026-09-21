import type { ApiError } from '~~/types'

export interface NormalisedError {
  code: ApiError['code'] | 'unknown'
  message: string
  fields?: Record<string, string>
  status?: number
}

/** Turns anything `$fetch` can throw into something a component can render. */
export function normaliseError(e: unknown): NormalisedError {
  const err = e as { statusCode?: number; data?: { data?: ApiError }; message?: string }
  const payload = err?.data?.data
  if (payload) {
    return { code: payload.code, message: payload.message, fields: payload.fields, status: err.statusCode }
  }
  if (err?.statusCode === 0 || (import.meta.client && !navigator.onLine)) {
    return { code: 'offline', message: 'You appear to be offline. Reconnect and try again.' }
  }
  return {
    code: 'unknown',
    message: 'Something went wrong on our side. Try again in a moment.',
    status: err?.statusCode,
  }
}
