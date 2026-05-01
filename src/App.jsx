import { useEffect, useState } from 'react';

export default function App() {
  const [series, setSeries] = useState([]);

  useEffect(() => {
    fetch('/content/series.json')
      .then((response) => response.json())
      .then((data) => setSeries(data.series))
      .catch(() => setSeries([]));
  }, []);

  return (
    <main className="page">
      <h1>Star Splitter Visions</h1>
      <p>Original series lineup</p>
      <ul>
        {series.map((title) => (
          <li key={title}>{title}</li>
        ))}
      </ul>
    </main>
  );
}
