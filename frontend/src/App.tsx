import { useMemo, useState } from "react";
import axios from "axios";
import { WordCloudScene } from "./components/WordCloudScene";

type WordWeight = {
  word: string;
  weight: number;
};

type AnalyzeResponse = {
  url: string;
  title: string | null;
  word_cloud: WordWeight[];
};

const SAMPLE_URLS = [
  {
    label: "BBC Tech",
    url: "https://www.bbc.com/news/technology",
  },
  {
    label: "AP Climate",
    url: "https://apnews.com/hub/climate-and-environment",
  },
  {
    label: "NPR World",
    url: "https://www.npr.org/sections/world/",
  },
];

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function App() {
  const [url, setUrl] = useState<string>(SAMPLE_URLS[0].url);
  const [title, setTitle] = useState<string>("");
  const [words, setWords] = useState<WordWeight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const hasWords = useMemo(() => words.length > 0, [words]);

  const analyze = async () => {
    if (!url.trim()) {
      setError("Please enter a valid article URL.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post<AnalyzeResponse>(`${API_BASE_URL}/analyze`, {
        url: url.trim(),
      });

      setTitle(response.data.title ?? "Untitled article");
      setWords(response.data.word_cloud);
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.detail ?? "Failed to analyze this URL.");
      } else {
        setError("Unexpected error while processing article.");
      }
      setWords([]);
      setTitle("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="aurora aurora-a" />
      <div className="aurora aurora-b" />

      <header className="header">
        <h1>3D News Topic Nebula</h1>
        <p>Paste a news article URL and turn its core ideas into an interactive 3D word cloud.</p>
      </header>

      <section className="controls">
        <label htmlFor="article-url">Article URL</label>
        <div className="input-row">
          <input
            id="article-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/news/article"
          />
          <button onClick={analyze} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner" />
                Analyzing...
              </>
            ) : (
              "Analyze"
            )}
          </button>
        </div>
        <div className="samples">
          {SAMPLE_URLS.map((sample) => (
            <button
              key={sample.url}
              className="sample-chip"
              onClick={() => setUrl(sample.url)}
              disabled={isLoading}
            >
              {sample.label}
            </button>
          ))}
        </div>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="scene-panel">
        <div className="scene-meta">
          <h2>{title || "Waiting for analysis..."}</h2>
          <p>{hasWords ? `${words.length} keywords extracted` : "No keywords yet."}</p>
        </div>
        <WordCloudScene words={words} />
      </section>
    </div>
  );
}
