# 3D-Word-Cloud-Aniket

Interactive full-stack demo that accepts a news article URL, extracts key terms with NLP, and visualizes them as an animated 3D word cloud.

## Stack

- Frontend: React + TypeScript + Vite + React Three Fiber (`three`, `@react-three/fiber`, `@react-three/drei`)
- Backend: FastAPI + BeautifulSoup + scikit-learn TF-IDF keyword extraction
- Runtime tooling: one root macOS script to install dependencies and run both servers

## Project Structure

```text
.
├── backend
│   ├── analyzer.py
│   ├── main.py
│   ├── requirements.txt
│   ├── schemas.py
│   └── scraper.py
├── frontend
│   ├── src
│   │   ├── components
│   │   │   └── WordCloudScene.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── styles.css
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
└── setup_and_run.sh
```

## API

- `POST /analyze`
  - Request:
    ```json
    { "url": "https://example.com/article" }
    ```
  - Response:
    ```json
    {
      "url": "https://example.com/article",
      "title": "Article Title",
      "word_cloud": [
        { "word": "climate", "weight": 1.0 },
        { "word": "policy", "weight": 0.84 }
      ]
    }
    ```

## Run (macOS)

```bash
chmod +x setup_and_run.sh
./setup_and_run.sh
```

This script will:
- create a Python virtual environment (`.venv`) if missing
- install backend dependencies
- install frontend dependencies
- start FastAPI on `http://localhost:8000`
- start Vite frontend on `http://localhost:5173`

## Run (Windows, one script)

From PowerShell in repo root:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup_and_run.ps1
```

This single script installs all dependencies and starts both servers.

## Notes

- Crawling is intentionally lightweight and focuses on extracting meaningful paragraph text.
- Keyword extraction is implemented with TF-IDF over sentence chunks to surface salient terms.
- Some publisher sites block non-browser crawlers; if a URL fails, try another public article.
