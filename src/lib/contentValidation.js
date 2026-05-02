const warnedMessages = new Set();

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const asArray = (value) => (Array.isArray(value) ? value : []);

function warnOnce(message, item) {
  if (warnedMessages.has(message)) return;
  warnedMessages.add(message);
  console.warn(message, item);
}

function itemContext(item) {
  if (!item || typeof item !== 'object') return 'unknown';
  return item.slug || item.id || item.releaseSlug || item.title || 'unknown';
}

function warnField(type, field, item) {
  warnOnce(`[content] ${type} missing required field "${field}" (${itemContext(item)}):`, item);
}

export function validateSeriesList(value) {
  return asArray(value).flatMap((item) => {
    if (!item || typeof item !== 'object') {
      warnOnce('[content] Series item is not an object:', item);
      return [];
    }

    const slug = isNonEmptyString(item.slug) ? item.slug.trim() : '';
    const title = isNonEmptyString(item.title) ? item.title.trim() : '';
    if (!slug) {
      warnField('Series', 'slug', item);
      return [];
    }

    if (!title) warnField('Series', 'title', item);

    return [{ ...item, slug, title: title || 'Untitled Series' }];
  });
}

export function validateReleaseList(value) {
  return asArray(value).flatMap((item) => {
    if (!item || typeof item !== 'object') {
      warnOnce('[content] Release item is not an object:', item);
      return [];
    }

    const id = isNonEmptyString(item.id) ? item.id.trim() : '';
    const slug = isNonEmptyString(item.slug) ? item.slug.trim() : '';
    const routeId = id || slug;
    const seriesSlug = isNonEmptyString(item.seriesSlug) ? item.seriesSlug.trim() : '';
    const title = isNonEmptyString(item.title) ? item.title.trim() : '';

    if (!routeId) {
      warnField('Release', 'id/slug', item);
      return [];
    }
    if (!seriesSlug) {
      warnField('Release', 'seriesSlug', item);
      return [];
    }
    if (!title) warnField('Release', 'title', item);

    return [{ ...item, id: routeId, seriesSlug, title: title || 'Untitled Release' }];
  });
}

export function validatePageList(value) {
  return asArray(value).flatMap((item) => {
    if (!item || typeof item !== 'object') {
      warnOnce('[content] Page item is not an object:', item);
      return [];
    }

    const releaseSlug = isNonEmptyString(item.releaseSlug) ? item.releaseSlug.trim() : '';
    const image = isNonEmptyString(item.image) ? item.image.trim() : '';
    const parsedPageNumber = Number(item.pageNumber);
    const pageNumber = Number.isFinite(parsedPageNumber) ? parsedPageNumber : null;

    if (!releaseSlug) {
      warnField('Page', 'releaseSlug', item);
      return [];
    }
    if (pageNumber === null) warnField('Page', 'pageNumber', item);
    if (!image) warnField('Page', 'image', item);

    return [{ ...item, releaseSlug, image, pageNumber }];
  });
}

function validateSimpleList(type, value, requiredField = 'title') {
  return asArray(value).flatMap((item) => {
    if (!item || typeof item !== 'object') {
      warnOnce(`[content] ${type} item is not an object:`, item);
      return [];
    }

    if (!isNonEmptyString(item[requiredField])) {
      warnField(type, requiredField, item);
      return [];
    }

    return [{ ...item, [requiredField]: item[requiredField].trim() }];
  });
}

export function validateExtraList(value) {
  return validateSimpleList('Extra', value, 'title');
}

export function validateSoundtrackList(value) {
  return validateSimpleList('Soundtrack', value, 'title');
}


export function validateReaderSoundtrackList(value) {
  return asArray(value).flatMap((item) => {
    if (!item || typeof item !== 'object') {
      warnOnce('[content] Reader soundtrack item is not an object:', item);
      return [];
    }

    const id = isNonEmptyString(item.id) ? item.id.trim() : '';
    const seriesSlug = isNonEmptyString(item.seriesSlug) ? item.seriesSlug.trim() : '';
    const title = isNonEmptyString(item.title) ? item.title.trim() : '';

    if (!id) {
      warnField('Reader soundtrack', 'id', item);
      return [];
    }

    if (!seriesSlug) {
      warnField('Reader soundtrack', 'seriesSlug', item);
      return [];
    }

    if (!title) warnField('Reader soundtrack', 'title', item);

    return [{ ...item, id, seriesSlug, title: title || 'Untitled Soundtrack' }];
  });
}
