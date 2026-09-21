import type { Chapter, Property } from '~~/types'
import { normaliseError, type NormalisedError } from './useApi'

/**
 * Project data, shared across routes. Held in Nuxt state so moving between
 * screens does not refetch, and so a deep link into any single screen still
 * has what it needs.
 */
export function useProject() {
  const { $api } = useNuxtApp()
  const property = useState<Property | null>('project-property', () => null)
  const chapters = useState<Chapter[]>('project-chapters', () => [])
  const propertyPending = useState('project-property-pending', () => true)
  const chaptersPending = useState('project-chapters-pending', () => true)
  const propertyError = useState<NormalisedError | null>('project-property-error', () => null)
  const chaptersError = useState<NormalisedError | null>('project-chapters-error', () => null)

  async function loadProperty() {
    propertyPending.value = true
    propertyError.value = null
    try {
      property.value = await $api<Property>('/api/property')
    } catch (e) {
      propertyError.value = normaliseError(e)
      property.value = null
    } finally {
      propertyPending.value = false
    }
  }

  async function loadChapters() {
    chaptersPending.value = true
    chaptersError.value = null
    try {
      chapters.value = await $api<Chapter[]>('/api/chapters')
    } catch (e) {
      chaptersError.value = normaliseError(e)
      chapters.value = []
    } finally {
      chaptersPending.value = false
    }
  }

  /** Called once on mount; later calls are retries from an error state. */
  function load() {
    void loadProperty()
    void loadChapters()
  }

  return {
    property,
    chapters,
    propertyPending,
    chaptersPending,
    propertyError,
    chaptersError,
    load,
    loadProperty,
    loadChapters,
  }
}
