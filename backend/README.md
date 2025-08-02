# Book Scraper API Backend

Backend del sistema integrado de asistente virtual para scraping de libros y noticias de Hacker News.

## Tecnologías

- FastAPI
- Redis
- Selenium
- Poetry
- Python 3.9+

## Estructura del Proyecto

```
backend/
├── app/
│   ├── api/
│   │   └── main.py
│   ├── core/
│   │   └── redis.py
│   ├── models/
│   │   ├── book.py
│   │   └── headline.py
│   └── services/
│       ├── scrape_books.py
│       └── scrape_hn.py
├── tests/
│   └── test_api.py
├── pyproject.toml
└── README.md
```

## Configuración del Entorno

### Prerequisitos

- Python 3.9+
- Poetry
- Docker y Docker Compose

### Instalación

1. Instalar dependencias:
```bash
poetry install
```

2. Variables de entorno:
```bash
REDIS_HOST=recruiter-dev-redis
REDIS_PORT=6379
REMOTE_DRIVER_URL=http://recruiter-dev-selenium:4444
```

## Ejecución

### Con Docker

```bash
docker-compose up -d backend
```

### Desarrollo Local

```bash
poetry run uvicorn app.api.main:app --reload --host 0.0.0.0 --port 7013
```

## Endpoints API

### Libros
- `GET /books`: Lista todos los libros
- `GET /books/search`: Búsqueda de libros con filtros
- `POST /init`: Inicia el scraping inicial de libros

### Hacker News
- `GET /headlines`: Obtiene titulares actuales
- `GET /headlines/trending`: Obtiene titulares más populares

## Tests

```bash
poetry run pytest
```

## Documentación API

- Swagger UI: http://localhost:18000/docs
- ReDoc: http://localhost:18000/redoc

## Dependencias Principales

- FastAPI: Framework web
- Redis: Caché y almacenamiento
- Selenium: Web scraping
- Pydantic: Validación de datos
- Poetry: Gestión de dependencias

## Desarrollo

### Comandos Útiles

```bash
# Formateo de código
poetry run black .

# Verificación de tipos
poetry run mypy .

# Ordenar imports
poetry run isort .

# Linting
poetry run flake8
```

### Convenciones de Código

- Black para formateo
- isort para imports
- mypy para tipado estático
- Longitud máxima de línea: 100 caracteres

## Contribuir

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles