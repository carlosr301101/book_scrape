import logging
import json
import hashlib
import requests
from bs4 import BeautifulSoup
from redis import Redis
import time
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class BookScraper:
    def __init__(self, redis_host: str = None, redis_port: int = None):
        self.base_url = "https://books.toscrape.com"
        
        # Obtener configuración de Redis desde variables de entorno o usar valores por defecto
        redis_host = redis_host or os.getenv('REDIS_HOST', 'localhost')
        redis_port = redis_port or int(os.getenv('REDIS_PORT', '6379'))
        
        self.redis_client = Redis(host=redis_host, port=redis_port, decode_responses=True)
        self.max_retries = 3
        self.retry_delay = 2

    def _make_request(self, url: str) -> Optional[BeautifulSoup]:
        for attempt in range(self.max_retries):
            try:
                response = requests.get(url)
                response.raise_for_status()
                return BeautifulSoup(response.text, 'html.parser')
            except requests.RequestException as e:
                logger.error(f"Error en intento {attempt + 1}: {str(e)}")
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay)
                else:
                    logger.error(f"No se pudo obtener la página {url} después de {self.max_retries} intentos")
                    return None

    def _generate_book_id(self, title: str) -> str:
        return hashlib.md5(title.encode()).hexdigest()

    def _parse_book_data(self, book_element,category) -> Dict:
        try:
            # Extraer título
            title_element = book_element.find('h3').find('a')
            title = title_element.get('title', '')
            
            # Extraer precio
            price_element = book_element.find('p', class_='price_color')
            price_str = price_element.text if price_element else '0'
            price = float(price_str[2:])
            
            # Extraer categoría
           # category_element = book_element.find('p', class_='category')
            category =category
            
            # Extraer URL de imagen
            image_element = book_element.find('img')
            image_url = ''
            if image_element and 'src' in image_element.attrs:
                image_url = self.base_url + '/' + image_element['src'].replace('../', '')
            
            return {
                "title": title,
                "price": price,
                "category": category,
                "image_url": image_url
            }
        except (AttributeError, KeyError, ValueError) as e:
            logger.error(f"Error al parsear libro: {str(e)}")
            return None

    def get_categories(self) -> List[Dict]:
        """Obtiene todas las categorías disponibles en la página."""
        categories = []
        soup = self._make_request(self.base_url)
        
        if not soup:
            logger.error("No se pudo obtener la página principal")
            return categories

        # Encontrar el sidebar con las categorías
        sidebar = soup.find('div', class_='side_categories')
        if not sidebar:
            logger.error("No se encontró el sidebar de categorías")
            return categories

        # Encontrar todos los enlaces de categoría
        category_links = sidebar.find_all('a')
        for link in category_links:
            category_url = link.get('href')
            if category_url:
                # Limpiar la URL y obtener el nombre de la categoría
                category_url = category_url.replace('../', '')
                category_name = link.text.strip()
                categories.append({
                    'name': category_name,
                    'url': f"{self.base_url}/{category_url}"
                })
                logger.info(f"Categoría encontrada: {category_name}")

        return categories

    def scrape_category(self, category_url: str, max_books: int = 50, max_price: float = 20.0,actual_category:str=None) -> List[Dict]:
        """Scrapea los libros de una categoría específica."""
        books_scraped = []
        page = 1
        
        while len(books_scraped) < max_books:
            # Construir URL de la página
            if page == 1:
                url = category_url
            else:
                # Modificar la URL para la paginación
                url = category_url.replace('index.html', f'page-{page}.html')
            
            logger.info(f"Scraping página {page} de categoría: {url}")
            soup = self._make_request(url)
            
            if not soup:
                logger.error(f"No se pudo obtener la página {page}")
                break

            # Encontrar todos los elementos de libro en la página
            book_elements = soup.find_all('article', class_='product_pod')
            if not book_elements:
                logger.info(f"No se encontraron libros en la página {page}")
                break

            logger.info(f"Encontrados {len(book_elements)} libros en la página {page}")

            for book_element in book_elements:
                if len(books_scraped) >= max_books:
                    break

                book_data = self._parse_book_data(book_element,actual_category)
                if book_data and book_data['price'] <= max_price:
                    book_id = self._generate_book_id(book_data['title'])
                    self.redis_client.set(
                        f"book:{book_id}",
                        json.dumps(book_data)
                    )
                    books_scraped.append(book_data)
                    logger.info(f"Libro guardado: {book_data['title']} - £{book_data['price']}")

            # Verificar si hay una página siguiente
            next_page = soup.find('li', class_='next')
            if not next_page:
                logger.info("No hay más páginas disponibles en esta categoría")
                break
                
            page += 1

        return books_scraped

    def scrape_books(self, max_books_per_category: int = 20, max_price: float = 20.0) -> List[Dict]:
        """Scrapea libros de todas las categorías disponibles."""
        all_books = []
        
        # Obtener todas las categorías
        categories = self.get_categories()
        categories=categories[1:]
        logger.info(f"Total de categorías encontradas: {len(categories)}")
        
        # Scrapear cada categoría
        for category in categories:
            logger.info(f"Scraping categoría: {category['name']}")
            category_books = self.scrape_category(
                category['url'],
                max_books=max_books_per_category,
                max_price=max_price,
                actual_category=category['name']
            )
            all_books.extend(category_books)
            logger.info(f"Total de libros en categoría {category['name']}: {len(category_books)}")
            time.sleep(1)
            if len(category_books) >= max_books_per_category:
                continue
        logger.info(f"Total de libros scrapeados en todas las categorías: {len(all_books)}")
        logger.info(f"Libros scrapeados: {all_books}")
        return all_books

if __name__ == "__main__":
    scraper = BookScraper()
    scraper.scrape_books() 