import aboutContent from '../content/pages/about.json'

function AboutPage() {
  const quoteIndex = Math.max(0, Math.min(
    Number(aboutContent.quoteAfterParagraph) || 0,
    aboutContent.paragraphs?.length || 0,
  ))
  const beforeQuote = (aboutContent.paragraphs || []).slice(0, quoteIndex)
  const afterQuote = (aboutContent.paragraphs || []).slice(quoteIndex)

  return (
    <main className="about-page">
      <section className="about-hero hud-frame">
        <p className="eyebrow">{aboutContent.eyebrow}</p>
        <h1>{aboutContent.title}</h1>
        <p className="about-hero-copy">{aboutContent.intro}</p>
      </section>

      <section className="about-grid">
        <article className="about-foreword hud-frame">
          {beforeQuote.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

          {aboutContent.centerQuote && (
            <blockquote>
              <span>“</span>
              <p>{aboutContent.centerQuote}</p>
            </blockquote>
          )}

          {afterQuote.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </article>

        <aside className="about-sidebars">
          {aboutContent.topPullquote && (
            <article className="about-pullquote hud-frame">
              <p>“{aboutContent.topPullquote}”</p>
            </article>
          )}

          <article className="about-principles hud-frame">
            <h2>{aboutContent.principlesTitle}</h2>
            <ul>
              {(aboutContent.principles || []).map((principle) => (
                <li key={principle}>{principle}</li>
              ))}
            </ul>
          </article>

          {aboutContent.bottomPullquote && (
            <article className="about-pullquote hud-frame">
              <p>“{aboutContent.bottomPullquote}”</p>
            </article>
          )}
        </aside>
      </section>
    </main>
  )
}

export default AboutPage
