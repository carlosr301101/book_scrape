import logging
import time
from typing import List, Dict, Optional
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from datetime import datetime

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class HackerNewsScraper:
    def __init__(self):
        self.base_url = "https://news.ycombinator.com"
        self.max_retries = 3
        self.retry_delay = 2
        self.driver = None
        self.setup_driver()

    def setup_driver(self):
        try:
            chrome_options = Options()
            chrome_options.add_argument('--headless=new')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--disable-software-rasterizer')
            chrome_options.add_argument('--use-gl=swiftshader')
            chrome_options.add_argument('--window-size=1920,1080')
            
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.set_page_load_timeout(30)
            self.wait = WebDriverWait(self.driver, 15)
        except Exception as e:
            logger.error(f"Error al configurar el driver: {str(e)}")
            raise

    def _make_request(self, url: str) -> bool:
        for attempt in range(self.max_retries):
            try:
                self.driver.get(url)
                # Esperar a que al menos un elemento de historia esté presente
                self.wait.until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "tr.athing"))
                )
                return True
            except Exception as e:
                logger.error(f"Error en intento {attempt + 1}: {str(e)}")
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay)
        return False

    def _parse_story(self, story_element) -> Optional[Dict]:
        try:
            # Obtener título y URL
            title_element = story_element.find_element(By.CSS_SELECTOR, "span.titleline > a")
            title = title_element.text
            url = title_element.get_attribute("href")
            
            # Obtener información de la fila siguiente (subtext)
            subtext_element = story_element.find_element(By.XPATH, "./following-sibling::tr")
            
            # Obtener puntuación
            score = 0
            try:
                score_element = subtext_element.find_element(By.CLASS_NAME, "score")
                score = int(score_element.text.split()[0])
            except NoSuchElementException:
                pass
            
            # Obtener autor
            author = "Unknown"
            try:
                author_element = subtext_element.find_element(By.CLASS_NAME, "hnuser")
                author = author_element.text
            except NoSuchElementException:
                pass
            
            # Obtener tiempo de publicación
            time_posted = "Unknown"
            try:
                time_element = subtext_element.find_element(By.CLASS_NAME, "age")
                time_posted = time_element.get_attribute("title")
            except NoSuchElementException:
                pass
            
            # Obtener número de comentarios
            comments = 0
            try:
                links = subtext_element.find_elements(By.TAG_NAME, "a")
                for link in links:
                    if "comment" in link.text.lower():
                        comments_text = link.text.split()[0]
                        comments = int(comments_text) if comments_text.isdigit() else 0
                        break
            except (NoSuchElementException, ValueError):
                pass
            
            return {
                "title": title,
                "url": url,
                "score": score,
                "author": author,
                "time_posted": time_posted,
                "comments": comments,
                "fetched_at": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error al parsear historia: {str(e)}")
            return None

    def get_top_stories(self, max_pages: int = 5) -> List[Dict]:
        stories = []
        
        for page in range(1, max_pages + 1):
            url = f"{self.base_url}/news?p={page}" if page > 1 else self.base_url
            
            logger.info(f"Scrapeando página {page}: {url}")
            
            if not self._make_request(url):
                logger.error(f"No se pudo cargar la página {page}")
                continue

            try:
                # Obtener todas las historias (filas con clase 'athing')
                story_elements = self.driver.find_elements(By.CSS_SELECTOR, "tr.athing")
                
                for story_element in story_elements:
                    story_data = self._parse_story(story_element)
                    if story_data:
                        stories.append(story_data)
                        logger.info(f"Historia encontrada: {story_data['title']} (Score: {story_data['score']})")

            except WebDriverException as e:
                logger.error(f"Error en la página {page}: {str(e)}")
                continue

        logger.info(f"Total de historias encontradas: {len(stories)}")
        return stories

    def close(self):
        if self.driver:
            self.driver.quit()

if __name__ == "__main__":
    scraper = None
    try:
        scraper = HackerNewsScraper()
        stories = scraper.get_top_stories(max_pages=2)
        for story in stories[:5]:  # Mostrar solo las primeras 5 para ejemplo
            print(f"Título: {story['title']}")
            print(f"URL: {story['url']}")
            print(f"Puntuación: {story['score']}")
            print(f"Autor: {story['author']}")
            print(f"Publicado: {story['time_posted']}")
            print(f"Comentarios: {story['comments']}")
            print(f"Obtenido: {story['fetched_at']}")
            print("-" * 50)
    except Exception as e:
        logger.error(f"Error en la ejecución: {str(e)}")
    finally:
        if scraper:
            scraper.close()