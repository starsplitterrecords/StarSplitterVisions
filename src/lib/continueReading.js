const CONTINUE_READING_KEY = 'starSplitter.continueReading';

function isClient() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeRecord(value) {
  if (!value || typeof value !== 'object') return null;
  const releaseSlug = typeof value.releaseSlug === 'string' ? value.releaseSlug.trim() : '';
  if (!releaseSlug) return null;

  const pageIndex = Number(value.pageIndex);
  const pageNumber = Number(value.pageNumber);
  if (!Number.isInteger(pageIndex) || pageIndex < 0) return null;
  if (!Number.isInteger(pageNumber) || pageNumber < 1) return null;

  return {
    releaseSlug,
    pageIndex,
    pageNumber,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
  };
}

export function getContinueReading() {
  if (!isClient()) return null;

  try {
    const raw = window.localStorage.getItem(CONTINUE_READING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalizeRecord(parsed);
  } catch {
    return null;
  }
}

export function setContinueReading(value) {
  if (!isClient()) return;
  const normalized = normalizeRecord(value);
  if (!normalized) return;

  try {
    window.localStorage.setItem(CONTINUE_READING_KEY, JSON.stringify(normalized));
  } catch {
    // Ignore storage write failures.
  }
}

export function clearContinueReading() {
  if (!isClient()) return;

  try {
    window.localStorage.removeItem(CONTINUE_READING_KEY);
  } catch {
    // Ignore storage clear failures.
  }
}

export { CONTINUE_READING_KEY };
