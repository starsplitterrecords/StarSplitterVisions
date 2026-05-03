export function normalizeExtraType(value) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return 'other';
  return raw.toLowerCase().replace(/\s+/g, '-');
}

export function sortExtras(items) {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aTime = Date.parse(a.item.date || '');
      const bTime = Date.parse(b.item.date || '');
      const aHasDate = Number.isFinite(aTime);
      const bHasDate = Number.isFinite(bTime);
      if (aHasDate && bHasDate) return bTime - aTime;
      if (aHasDate) return -1;
      if (bHasDate) return 1;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}

export function getExtraHref(extra) {
  if (extra?.slug) return `/extras/${extra.slug}`;
  if (extra?.id) return `/extras/${extra.id}`;
  return null;
}
