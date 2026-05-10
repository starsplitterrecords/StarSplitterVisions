export default function SoundtrackCard({ track }) {
  return (
    <article className="soundtrack-card hud-frame">
      <img
        className="soundtrack-card-image"
        src={track.coverImage}
        alt={track.title}
      />

      <div className="soundtrack-card-content">
        <p className="soundtrack-card-runtime">{track.runtime}</p>

        <h3>{track.title}</h3>

        <p className="soundtrack-card-artist">{track.artist}</p>

        <p>{track.description}</p>

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
      </div>
    </article>
  )
}
