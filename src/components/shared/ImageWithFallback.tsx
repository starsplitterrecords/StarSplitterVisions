import { useState } from 'react'

interface ImageWithFallbackProps {
  src?: string
  alt?: string
  className?: string
  fallbackText?: string
}

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackText = 'ART INBOUND',
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`image-fallback ${className}`.trim()}
        role="img"
        aria-label={alt || fallbackText}
      >
        <span>{fallbackText}</span>
      </div>
    )
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
    />
  )
}
