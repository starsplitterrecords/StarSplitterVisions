import { useState } from 'react'

export default function ImageWithFallback({
  src,
  alt,
  fallbackText = 'IMAGE INBOUND',
  className = '',
  ...props
}) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div className={`image-fallback ${className}`.trim()} role="img" aria-label={alt || fallbackText}>
        <span>{fallbackText}</span>
      </div>
    )
  }

  return (
    <img
      {...props}
      className={className || undefined}
      src={src}
      alt={alt || ''}
      loading={props.loading || 'lazy'}
      onError={() => setHasError(true)}
    />
  )
}
