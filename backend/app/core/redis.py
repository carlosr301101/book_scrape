import json
from typing import List, Optional, Dict, Any
from redis import Redis
import os
from dotenv import load_dotenv

load_dotenv()

class RedisService:
    def __init__(self):
        redis_host = os.getenv('REDIS_HOST', 'recruiter-dev-redis')
        redis_port = int(os.getenv('REDIS_PORT', '6379'))
        self.redis_client = Redis(
            host=redis_host,
            port=redis_port,
            decode_responses=True,
            socket_connect_timeout=3
        )

    def set_book(self, book_id: str, book_data: Dict[str, Any]) -> bool:
        """Almacena un libro en Redis."""
        try:
            return self.redis_client.set(f"book:{book_id}", json.dumps(book_data))
        except Exception as e:
            print(f"Error al almacenar libro: {str(e)}")
            return False

    def get_book(self, book_id: str) -> Optional[Dict[str, Any]]:
        """Obtiene un libro de Redis por su ID."""
        try:
            data = self.redis_client.get(f"book:{book_id}")
            return json.loads(data) if data else None
        except Exception as e:
            print(f"Error al obtener libro: {str(e)}")
            return None

    def get_books_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Obtiene todos los libros de una categoría específica."""
        try:
            books = []  # Cambiado de {} a []
            for key in self.redis_client.scan_iter("book:*"):
                book_data = self.redis_client.get(key)
                if book_data:
                    book = json.loads(book_data)
                    if book.get('category', '').lower() == category.lower():
                        books.append(book)
            return books
        except Exception as e:
            print(f"Error al obtener libros por categoría: {str(e)}")
            return []

    def search_books(self, title: Optional[str] = None, category: Optional[str] = None,
                    min_price: Optional[float] = None, max_price: Optional[float] = None) -> List[Dict[str, Any]]:
        """Busca libros según los criterios especificados."""
        try:
            books = []
            for key in self.redis_client.scan_iter("book:*"):
                book_data = self.redis_client.get(key)
                if book_data:
                    book = json.loads(book_data)
                    # Extraer ID de la clave Redis (book:123 -> 123)
                    book['id'] = key.split(':')[1]
                    
                    # Aplicar filtros
                    if title and title.lower() not in book.get('title', '').lower():
                        continue
                    if category and category.lower() != book.get('category', '').lower():
                        continue
                    if min_price is not None and book.get('price', 0) < min_price:
                        continue
                    if max_price is not None and book.get('price', 0) > max_price:
                        continue
                    
                    books.append(book)
            return books
        except Exception as e:
            print(f"Error al buscar libros: {str(e)}")
            return []

    def delete_book(self, book_id: str) -> bool:
        """Elimina un libro de Redis."""
        try:
            return bool(self.redis_client.delete(f"book:{book_id}"))
        except Exception as e:
            print(f"Error al eliminar libro: {str(e)}")
            return False 