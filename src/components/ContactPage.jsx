import contactContent from '../content/pages/contact.json'

function ContactPage() {
  return (
    <main className="info-page">
      <section className="info-hero hud-frame">
        <p className="eyebrow">{contactContent.eyebrow}</p>
        <h1>{contactContent.title}</h1>
        <p>{contactContent.intro}</p>
      </section>

      <section className="info-grid">
        {(contactContent.cards || []).map((card) => (
          <article className="info-card hud-frame" key={card.title}>
            <h2>{card.title}</h2>
            <p>{card.body}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default ContactPage
