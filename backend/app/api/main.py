from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
import logging
import json

from app.models.book import Book, BookSearchParams
from app.models.headline import Headline
from app.core.redis import RedisService
from app.services.scrape_books import BookScraper


# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Book Scraper API",
    description="API con integración de Hacker News y scraping de libros",
    version="0.1.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar los orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependencias
def get_redis_service():
    return RedisService()

def get_book_scraper_service():
    return BookScraper()


@app.post("/init", response_model=dict)
async def init_scraping(
    redis_service: RedisService = Depends(get_redis_service),
    book_scraper: BookScraper = Depends(get_book_scraper_service)
):
    """
    Inicia el scraping inicial de libros y los almacena en Redis.
    Este endpoint se utiliza durante la inicialización del contenedor.
    """
    try:
        logger.info("Iniciando scraping de libros...")
        books = book_scraper.scrape_books(max_books_per_category=20, max_price=20.0)
        logger.info(f"Terminado scraping de libros...{books}")
        # Almacenar libros en Redis
        for idx, book in enumerate(books):
            book_with_id = book
            book_with_id['id'] = str(idx)
            redis_service.set_book(str(idx), book_with_id)
        
        logger.info(f"Scraping completado. {len(books)} libros almacenados en Redis.")
        
        return {"status": "success", "message": f"{len(books)} libros scrapeados y almacenados"}
    except Exception as e:
        logger.error(f"Error durante el scraping inicial: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error durante el scraping: {str(e)}")

@app.get("/books/search", response_model=List[Book])
async def search_books(
    title: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    redis_service: RedisService = Depends(get_redis_service)
):
    """
    Busca libros por título o categoría con filtros opcionales.
    """
    try:
        books = redis_service.search_books(
            title=title,
            category=category,
            min_price=min_price,
            max_price=max_price
        )
        return books
    except Exception as e:
        logger.error(f"Error al buscar libros: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al buscar libros: {str(e)}")

@app.get("/books", response_model=List[Book])
async def get_books(
    category: Optional[str] = None,
    redis_service: RedisService = Depends(get_redis_service)
):
    """
    Obtiene libros de Redis, con filtrado opcional por categoría.
    """
       
    try:
        if category:
            books = redis_service.get_books_by_category(category)
            return books
        else:
            # Obtener todos los libros
            books = []
            for key in redis_service.redis_client.scan_iter("book:*"):
                book_data = redis_service.redis_client.get(key)
                if book_data:
                    book_data = json.loads(book_data)
                    # Validación flexible con manejo de campos faltantes
                    try:
                        validated_book = Book(**book_data)
                        books.append(validated_book)
                    except Exception as e:
                        logger.warning(f"Libro con formato inválido: {book_data}. Error: {str(e)}")
                        continue
        return books
    except Exception as e:
        logger.error(f"Error al obtener libros: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener libros: {str(e)}")
   
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 