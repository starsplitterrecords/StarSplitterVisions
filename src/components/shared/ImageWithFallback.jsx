import { useState } from 'react'

export default function ImageWithFallback(props) {
  const {
    src,
    alt,
    className = '',
    fallbackText = 'ART INBOUND',
  } = props

  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={`image-fallback ${className}`.trim()} role="img" aria-label={alt || fallbackText}>
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
