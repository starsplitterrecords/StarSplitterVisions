import ArtifactCard from './ArtifactCard'

export default function ExtrasRail({ title, artifacts }) {
  if (!artifacts?.length) {
    return null
  }

  return (
    <section className="extras-rail">
      <div className="section-heading">
        <p className="eyebrow">ARCHIVE //</p>
        <h2>{title}</h2>
      </div>

      <div className="extras-rail-grid">
        {artifacts.map((artifact) => (
          <ArtifactCard key={artifact.id} artifact={artifact} />
        ))}
      </div>
    </section>
  )
}
