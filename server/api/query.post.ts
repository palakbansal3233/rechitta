import { answerFor } from '../utils/data'
import { mockRespond } from '../utils/mock'
import type { Answer } from '~~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ text?: string }>(event)
  const text = (body?.text ?? '').trim()

  if (!text) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Unprocessable Entity',
      data: { code: 'validation_error', message: 'I did not catch a question.', fields: { text: 'Required' } },
    })
  }

  // A real agent thinks for longer on longer questions.
  const think = 700 + Math.min(text.length, 90) * 9

  return mockRespond<Answer>(event, think, () => answerFor(text))
})
