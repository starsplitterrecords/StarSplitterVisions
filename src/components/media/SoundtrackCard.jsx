import ImageWithFallback from '../shared/ImageWithFallback'

export default function SoundtrackCard({ track }) {
  return (
    <article className="soundtrack-card hud-frame">
      <ImageWithFallback
        className="soundtrack-card-image"
        src={track.coverImage}
        alt={track.title}
        fallbackText="AUDIO ART INBOUND"
      />

      <div className="soundtrack-card-content">
        <p className="soundtrack-card-runtime">{track.runtime}</p>

        <h3>{track.title}</h3>

        <p className="soundtrack-card-artist">{track.artist}</p>

        <p>{track.description}</p>

        {track.platformLinks?.length > 0 && (
          <div className="soundtrack-card-links">
            {track.platformLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
