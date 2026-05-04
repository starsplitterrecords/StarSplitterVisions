export default function NotFoundRoute({ message = 'Page not found.' }) {
  return (
    <main className="page page-reader page-reader-empty">
      <h1>{message}</h1>
      <p>
        <a href="/">Return home</a>
      </p>
    </main>
  );
}
