# Web Scrapping

Sistema integrado de asistente virtual con scraping de libros y noticias de Hacker News.

## Características

- **Scraping de Libros**: Extrae información de libros de una tienda en línea, incluyendo título, precio, categoría e imagen.
- **Integración con Hacker News**: Obtiene las noticias principales de Hacker News en tiempo real.
- **API RESTful**: Endpoints para buscar libros, obtener noticias y gestionar datos.
- **Persistencia con Redis**: Almacenamiento de datos de libros en Redis.


## Componentes del Sistema

### Backend (FastAPI)

- New line
- API RESTful con endpoints para libros
- Integración con Redis para persistencia

### Frontend (React/Next.js)

- Visualización de respuestas en tiempo real
- Diseño responsive con Tailwind CSS

### Infraestructura

- Redis para cache y persistencia
- Contenedores Docker para todos los servicios

## Requisitos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo frontend)
- Python 3.9+ (para desarrollo backend)

## Instalación

1. Iniciar los servicios con Docker Compose:

```bash
docker-compose up -d
```

## Servicios y Puertos

- Frontend: http://localhost:5010
- Backend: http://localhost:18000
- Redis: http://localhost:6379


## API Endpoints

### Backend (FastAPI)

- `GET /books`: Obtiene lista de libros
- `GET /books/search`: Búsqueda de libros con filtros





## Configuración

### Variables de Entorno

- Backend:

  - `REDIS_HOST`: Host de Redis
  - `REDIS_PORT`: Puerto de Redis
  - `REMOTE_DRIVER_URL`: URL de Selenium


## Pruebas

```bash
# Pruebas backend
docker-compose run backend poetry run pytest



## Documentación
- Backend API: http://localhost:18000/docs


## Contribuir

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## Licencia

Proyecto bajo Licencia MIT - ver [LICENSE](LICENSE) para detalles.
