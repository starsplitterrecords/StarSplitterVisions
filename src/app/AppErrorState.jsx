export default function AppErrorState() {
  return (
    <main className="page">
      <section className="card">
        <h1>Content could not be loaded.</h1>
        <p>Check public/content JSON files and run npm run validate:content.</p>
      </section>
    </main>
  );
}
