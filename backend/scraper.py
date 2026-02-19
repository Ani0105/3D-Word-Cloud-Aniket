import re

import requests
from bs4 import BeautifulSoup


USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/128.0.0.0 Safari/537.36"
)


def _clean_text(raw: str) -> str:
    cleaned = re.sub(r"\s+", " ", raw).strip()
    return cleaned


def fetch_article_text(url: str, timeout_seconds: int = 15) -> tuple[str | None, str]:
    response = requests.get(
        url,
        timeout=timeout_seconds,
        headers={"User-Agent": USER_AGENT},
    )
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    for tag_name in ["script", "style", "noscript", "svg", "header", "footer", "nav"]:
        for tag in soup.find_all(tag_name):
            tag.decompose()

    title = soup.title.get_text(strip=True) if soup.title else None

    candidate_blocks = []
    article_tag = soup.find("article")
    if article_tag:
        candidate_blocks.extend(article_tag.find_all("p"))

    if not candidate_blocks:
        main_tag = soup.find("main")
        if main_tag:
            candidate_blocks.extend(main_tag.find_all("p"))

    if not candidate_blocks:
        candidate_blocks.extend(soup.find_all("p"))

    paragraphs = [_clean_text(p.get_text(" ", strip=True)) for p in candidate_blocks]
    paragraphs = [p for p in paragraphs if len(p) > 50]

    if not paragraphs:
        body_text = _clean_text(soup.get_text(" ", strip=True))
        if len(body_text) < 100:
            raise ValueError("Could not extract enough article text from the provided URL.")
        return title, body_text

    return title, "\n".join(paragraphs)
