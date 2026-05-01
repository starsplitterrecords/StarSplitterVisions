const ADMIN_SECTIONS = [
  {
    title: 'Series',
    description:
      'Manage series identity, descriptions, artwork, colors, and publishing metadata.',
    status: 'Shell only',
    action: 'Edit series — coming soon',
  },
  {
    title: 'Releases',
    description:
      'Manage release records, issue numbers, descriptions, dates, cover art, hero art, and reader entry points.',
    status: 'Coming soon',
    action: 'Add release — coming soon',
  },
  {
    title: 'Pages',
    description:
      'Manage daily page entries, image paths, page numbers, release assignment, and publishing status.',
    status: 'Saving disabled',
    action: 'Manage pages — coming soon',
  },
  {
    title: 'Extras',
    description:
      'Manage bonus materials, links, production notes, covers, editorial notes, and related collateral.',
    status: 'Not connected',
    action: 'Organize extras — coming soon',
  },
  {
    title: 'Soundtracks',
    description:
      'Manage soundtrack entries, track listings, playlist links, mood notes, and audio companion material.',
    status: 'Not connected',
    action: 'Manage soundtracks — coming soon',
  },
];

function AdminSectionCard({ title, description, status, action }) {
  return (
    <section className="admin-card" aria-labelledby={`admin-${title.toLowerCase()}-title`}>
      <div className="admin-card-header">
        <h2 id={`admin-${title.toLowerCase()}-title`}>{title}</h2>
        <span className="admin-status">{status}</span>
      </div>
      <p>{description}</p>
      <button type="button" className="admin-action" disabled>
        {action}
      </button>
    </section>
  );
}

export default function AdminShell() {
  return (
    <main className="page page-admin">
      <header className="admin-header">
        <p className="eyebrow">Admin</p>
        <h1>Static Publishing Helper</h1>
        <p>
          A local helper workspace for preparing Star Splitter Visions content updates.
          This page does not save or publish changes yet.
        </p>
      </header>

      <section className="admin-banner" role="status" aria-live="polite">
        <p className="admin-banner-label">Shell only</p>
        <p>
          This is a static/local helper only. Authentication is not implemented,
          saving is not implemented, no backend is connected, and it does not write
          files or publish content.
        </p>
      </section>

      <section className="admin-sections" aria-label="Admin content areas">
        {ADMIN_SECTIONS.map((section) => (
          <AdminSectionCard key={section.title} {...section} />
        ))}
      </section>

      <section className="admin-note">
        <h2>Future workflow</h2>
        <p>
          Future versions will add JSON helper tools for manual publishing, but this
          page currently provides structure only.
        </p>
      </section>

      <p>
        <a href="/">Back to site</a>
      </p>
    </main>
  );
}
