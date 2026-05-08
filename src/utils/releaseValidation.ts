import type { ReleaseConfig } from '../types/series'

export function validateReleaseConfig(
  releaseConfig: ReleaseConfig
): string[] {
  const warnings: string[] = []

  if (!releaseConfig.seriesSlug) {
    warnings.push('Missing seriesSlug')
  }

  if (!releaseConfig.releaseSlug) {
    warnings.push('Missing releaseSlug')
  }

  if (!releaseConfig.pageCount || releaseConfig.pageCount < 1) {
    warnings.push('Invalid pageCount')
  }

  if (!releaseConfig.startDate) {
    warnings.push('Missing startDate')
  }

  if (!releaseConfig.imagePathBase) {
    warnings.push('Missing imagePathBase')
  }

  return warnings
}
