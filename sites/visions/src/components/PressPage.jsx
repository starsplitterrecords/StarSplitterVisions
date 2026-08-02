import pressContent from '../content/pages/press.json'

function PressPage() {
  return (
    <main className="info-page">
      <section className="info-hero hud-frame">
        <p className="eyebrow">{pressContent.eyebrow}</p>
        <h1>{pressContent.title}</h1>
        <p>{pressContent.intro}</p>
      </section>

      <section className="info-grid">
        {(pressContent.cards || []).map((card) => (
          <article className="info-card hud-frame" key={card.title}>
            <h2>{card.title}</h2>
            <p>{card.body}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default PressPage
