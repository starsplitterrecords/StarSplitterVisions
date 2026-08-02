export interface ExternalPlatformLink {
  label: string
  url: string
}

export interface SeriesArtifact {
  id: string
  title: string
  category: string
  image: string
  description: string
  releaseDate: string
  externalLink?: string
  downloadAsset?: string
  inlineContent?: string
}

export interface SoundtrackEntry {
  id: string
  title: string
  artist: string
  coverImage: string
  description: string
  runtime: string
  releaseDate: string
  platformLinks: ExternalPlatformLink[]
  embedUrl?: string
}
