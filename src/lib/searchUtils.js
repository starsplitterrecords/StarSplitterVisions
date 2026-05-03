export const SEARCH_FILTERS = ['all', 'series', 'releases', 'extras', 'soundtracks'];

export function createSearchText(fields) {
  return fields.filter((value) => typeof value === 'string' && value.trim()).join(' ').toLowerCase();
}
