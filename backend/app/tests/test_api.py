import pytest
from fastapi.testclient import TestClient
import json
from app.api.main import app

client = TestClient(app)

def test_init_scraping():
    """Prueba el endpoint de inicialización de scraping."""
    response = client.post("/init")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "message" in data
    assert data["status"] == "success"

def test_search_books():
    """Prueba el endpoint de búsqueda de libros."""
    # Prueba sin filtros
    response = client.get("/books/search")
    assert response.status_code == 200
    books = response.json()
    assert isinstance(books, list)
    
    # Prueba con filtros
    response = client.get("/books/search?title=Python&category=fiction&min_price=10&max_price=20")
    assert response.status_code == 200
    books = response.json()
    assert isinstance(books, list)
    
    # Verificar que los libros cumplen con los filtros
    for book in books:
        assert "Python" in book["title"]
        assert book["category"] == "fiction"
        assert 10 <= book["price"] <= 20

def test_get_headlines():
    """Prueba el endpoint de obtención de headlines."""
    response = client.get("/headlines")
    assert response.status_code == 200
    headlines = response.json()
    assert isinstance(headlines, list)
    
    # Verificar estructura de los headlines
    for headline in headlines:
        assert "title" in headline
        assert "url" in headline
        assert "score" in headline
        assert "author" in headline
        assert "time_posted" in headline
        assert "comments" in headline
        assert "fetched_at" in headline

def test_get_books():
    """Prueba el endpoint de obtención de libros."""
    # Prueba sin filtro de categoría
    response = client.get("/books")
    assert response.status_code == 200
    books = response.json()
    assert isinstance(books, list)
    
    # Prueba con filtro de categoría
    response = client.get("/books?category=fiction")
    assert response.status_code == 200
    books = response.json()
    assert isinstance(books, list)
    
    # Verificar que todos los libros son de la categoría especificada
    for book in books:
        assert book["category"] == "fiction"

def test_error_handling():
    """Prueba el manejo de errores."""
    # Prueba con un precio mínimo inválido
    response = client.get("/books/search?min_price=-1")
    assert response.status_code == 422  # Error de validación
    
    # Prueba con un precio máximo menor que el mínimo
    response = client.get("/books/search?min_price=20&max_price=10")
    assert response.status_code == 422  # Error de validación
    
    # Prueba con un número de páginas inválido para headlines
    response = client.get("/headlines?max_pages=0")
    assert response.status_code == 422  # Error de validación 