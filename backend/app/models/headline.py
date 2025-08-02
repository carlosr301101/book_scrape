from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Headline(BaseModel):
    title: str = Field(..., description="Título de la noticia")
    url: str = Field(..., description="URL de la noticia")
    score: int = Field(..., description="Puntuación de la noticia", ge=0)
    author: str = Field(..., description="Autor de la noticia")
    time_posted: str = Field(..., description="Fecha y hora de publicación")
    comments: int = Field(..., description="Número de comentarios", ge=0)
    fetched_at: datetime = Field(default_factory=datetime.now, description="Fecha y hora de obtención")

    class Config:
        from_attributes = True 