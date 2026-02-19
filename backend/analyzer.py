import re

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer


def _sentence_chunks(text: str) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]

    if len(sentences) >= 4:
        return sentences

    words = text.split()
    chunk_size = 80
    chunks = []
    for start in range(0, len(words), chunk_size):
        chunk = " ".join(words[start : start + chunk_size]).strip()
        if len(chunk) > 20:
            chunks.append(chunk)
    return chunks


def extract_keywords(text: str, top_k: int = 60) -> list[dict[str, float]]:
    chunks = _sentence_chunks(text)
    if len(chunks) < 2:
        chunks = [text]

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=300,
        lowercase=True,
    )
    matrix = vectorizer.fit_transform(chunks)

    mean_scores = np.asarray(matrix.mean(axis=0)).ravel()
    terms = vectorizer.get_feature_names_out()

    ranked_indices = mean_scores.argsort()[::-1]
    ranked = []
    for idx in ranked_indices:
        score = float(mean_scores[idx])
        if score <= 0:
            continue
        ranked.append((terms[idx], score))
        if len(ranked) >= top_k:
            break

    if not ranked:
        return []

    max_score = ranked[0][1]
    min_score = ranked[-1][1]
    denominator = max(max_score - min_score, 1e-8)

    normalized = []
    for word, score in ranked:
        weight = 0.2 + 0.8 * ((score - min_score) / denominator)
        normalized.append({"word": word, "weight": round(float(weight), 4)})

    return normalized
