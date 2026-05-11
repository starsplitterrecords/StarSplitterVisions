function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero hud-frame">
        <p className="eyebrow">ABOUT // STAR SPLITTER VISIONS</p>
        <h1>Stories about people living inside strange systems.</h1>
        <p className="about-hero-copy">
          Star Splitter Visions is an independent home for speculative comics, graphic novels, and illustrated fiction
          about social pressure, institutional life, and the private moral worlds people build inside extraordinary circumstances.
        </p>
      </section>

      <section className="about-grid">
        <article className="about-foreword hud-frame">
          <p>
            There is a tendency in speculative fiction to imagine the future as a problem of technology. Bigger weapons.
            Faster travel. Smarter machines. Stranger worlds.
          </p>

          <p>
            But most people do not experience history through inventions. They experience it through institutions:
            workplaces, cities, families, bureaucracies, social expectations, economic pressure, friendships, hierarchies,
            and the quiet negotiations required to remain human inside systems too large to fully see.
          </p>

          <p>
            That is the territory Star Splitter Visions explores. These stories are interested in what happens when the
            impossible becomes normal, when extraordinary circumstances are absorbed into ordinary life, and when people
            keep working, caring, adapting, joking, failing, and searching for meaning inside structures they did not design.
          </p>

          <blockquote>
            <span>“</span>
            <p>The future is not only built by invention. It is lived through institutions.</p>
          </blockquote>

          <p>
            Across the work, the speculative elements matter, but they are rarely the whole subject. The deeper focus is
            human adaptation: how people preserve identity under pressure, how communities form around shared burdens,
            how organizations protect themselves, and how dignity survives inside structures that often flatten or commodify it.
          </p>

          <p>
            Some stories are funny. Some are quiet. Some are cosmic. Some are strange on purpose. What connects them is a
            belief that civilization is not maintained by heroes alone, but by people trying to remain recognizable to
            themselves and to one another.
          </p>
        </article>

        <aside className="about-sidebars">
          <article className="about-pullquote hud-frame">
            <p>“Not escapism, exactly. Recognition, displaced into another world.”</p>
          </article>

          <article className="about-principles hud-frame">
            <h2>What connects the work</h2>
            <ul>
              <li>Social systems under speculative pressure</li>
              <li>Institutions as part of character and plot</li>
              <li>Public spectacle versus private reality</li>
              <li>Competence, dignity, humor, and exhaustion</li>
              <li>Ordinary responsibility under impossible conditions</li>
            </ul>
          </article>

          <article className="about-pullquote hud-frame">
            <p>“The impossible is only the beginning. The story is what people do with it.”</p>
          </article>
        </aside>
      </section>
    </main>
  )
}

export default AboutPage
