import SoundtrackCard from './SoundtrackCard'

export default function AudioRail({ title, tracks }) {
  if (!tracks?.length) {
    return null
  }

  return (
    <section className="audio-rail">
      <div className="section-heading">
        <p className="eyebrow">SIGNAL //</p>
        <h2>{title}</h2>
      </div>

      <div className="audio-rail-grid">
        {tracks.map((track) => (
          <SoundtrackCard key={track.id} track={track} />
        ))}
      </div>
    </section>
  )
}
