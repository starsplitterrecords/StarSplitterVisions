const seriesModules = import.meta.glob('../content/series/*.json', {
  eager: true,
  import: 'default',
})

function normalizeSeries(series) {
  return {
    narrativeForms: [],
    themes: [],
    releases: [],
    dailyPages: [],
    extras: [],
    audio: [],
    homepage: {},
    ...series,
  }
}

export const seriesPages = Object.values(seriesModules).reduce((catalog, source) => {
  const series = normalizeSeries(source)

  if (!series.slug) {
    return catalog
  }

  catalog[series.slug] = series
  return catalog
}, {})
