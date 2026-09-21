/**
 * A single polite live region for the whole app. Components call `announce()`
 * instead of each rolling their own aria-live element, which stops screen
 * readers from reading two things at once.
 */
export function useAnnouncer() {
  const message = useState<string>('sr-announcement', () => '')
  let timer: ReturnType<typeof setTimeout> | undefined

  function announce(text: string) {
    message.value = ''
    clearTimeout(timer)
    // Re-setting after a tick forces AT to re-read an identical message.
    timer = setTimeout(() => {
      message.value = text
    }, 60)
  }

  return { message, announce }
}
