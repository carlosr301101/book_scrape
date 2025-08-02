from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BookBase(BaseModel):
    title: str = Field(..., description="Título del libro")
    price: float = Field(..., description="Precio del libro", ge=0)
    category: str = Field(..., description="Categoría del libro")
    image_url: Optional[str] = Field(None, description="URL de la imagen del libro")
    id: Optional[str] = Field(None, description="ID único del libro")  # Hacer opcional
    created_at: Optional[datetime] = Field(None, description="Fecha de creación del registro")

class BookCreate(BookBase):
    pass

class Book(BookBase):
    id: str = Field(..., description="ID único del libro")
    created_at: datetime = Field(default_factory=datetime.now, description="Fecha de creación del registro")

    class Config:
        from_attributes = True

class BookSearchParams(BaseModel):
    title: Optional[str] = Field(None, description="Filtrar por título")
    category: Optional[str] = Field(None, description="Filtrar por categoría")
    min_price: Optional[float] = Field(None, description="Precio mínimo", ge=0)
    max_price: Optional[float] = Field(None, description="Precio máximo", ge=0) 