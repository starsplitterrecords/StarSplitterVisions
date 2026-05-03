const warnedInvalidDates = new Set();

export function parseDate(value, context = 'date') {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const key = `${context}:${value}`;
    if (!warnedInvalidDates.has(key)) {
      warnedInvalidDates.add(key);
      console.warn(`[content] Invalid ${context}:`, value);
    }
    return null;
  }
  return parsed;
}

export function formatDate(value) {
  const parsed = parseDate(value);
  if (!parsed) return null;
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
