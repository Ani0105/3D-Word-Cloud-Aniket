from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from analyzer import extract_keywords
from schemas import AnalyzeRequest, AnalyzeResponse
from scraper import fetch_article_text


app = FastAPI(title="3D Word Cloud API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_article(payload: AnalyzeRequest) -> AnalyzeResponse:
    try:
        title, text = fetch_article_text(str(payload.url))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to fetch article: {exc}") from exc

    try:
        word_cloud = extract_keywords(text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to analyze article text: {exc}") from exc

    if not word_cloud:
        raise HTTPException(status_code=422, detail="No meaningful keywords were extracted.")

    return AnalyzeResponse(url=payload.url, title=title, word_cloud=word_cloud)
