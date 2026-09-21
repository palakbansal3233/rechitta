import { suggestions } from '../utils/data'
import { mockRespond } from '../utils/mock'

export default defineEventHandler((event) =>
  mockRespond<string[]>(event, 160, () => suggestions, []),
)
