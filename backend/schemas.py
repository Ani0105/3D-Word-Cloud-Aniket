from pydantic import BaseModel, HttpUrl


class AnalyzeRequest(BaseModel):
    url: HttpUrl


class WordWeight(BaseModel):
    word: str
    weight: float


class AnalyzeResponse(BaseModel):
    url: HttpUrl
    title: str | None = None
    word_cloud: list[WordWeight]
