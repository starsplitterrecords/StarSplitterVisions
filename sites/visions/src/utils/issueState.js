export const ISSUE_STATE_STORAGE_KEY = 'visions.issueState.v1'

const VALID_STATES = new Set(['read', 'want'])

export function loadIssueStates() {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(ISSUE_STATE_STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    return Object.fromEntries(
      Object.entries(parsed).filter(([catalogId, state]) => catalogId && VALID_STATES.has(state)),
    )
  } catch {
    return {}
  }
}

export function toggleIssueState(catalogId, requestedState) {
  if (!catalogId || !VALID_STATES.has(requestedState)) {
    return loadIssueStates()
  }

  const next = loadIssueStates()

  if (next[catalogId] === requestedState) {
    delete next[catalogId]
  } else {
    next[catalogId] = requestedState
  }

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(ISSUE_STATE_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Reading state is intentionally best-effort browser-local data.
    }
  }

  return next
}
