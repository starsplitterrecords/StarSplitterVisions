export default function ArtifactCard({ artifact }) {
  return (
    <article className="artifact-card hud-frame">
      <img
        className="artifact-card-image"
        src={artifact.image}
        alt={artifact.title}
      />

      <div className="artifact-card-content">
        <p className="artifact-card-category">{artifact.category}</p>

        <h3>{artifact.title}</h3>

        <p>{artifact.description}</p>

        <div className="artifact-card-footer">
          <span>{artifact.releaseDate}</span>

          {artifact.externalLink && (
            <a href={artifact.externalLink} target="_blank" rel="noreferrer">
              Open Artifact
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
