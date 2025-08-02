# Books Scraper Frontend

Frontend desarrollado en Next.js para el sistema de scraping de libros. Utiliza shadcn/ui para los componentes de interfaz y axios para las llamadas a la API.

## Características

- ✅ **RF1**: Dockerfile y configuración completa con Next.js, shadcn UI, axios, Tailwind CSS y TypeScript
- ✅ **RF2**: 
  - Botón para inicializar scraping (POST /init)
  - Visualización de libros en formato scrolleable
  - Filtrado por categorías
  - Búsqueda avanzada con múltiples parámetros
  - Uso de image_url para mostrar portadas
- ✅ **RF3**: Tests completos y integración con Docker Compose

## Tecnologías Utilizadas

- **Next.js 14**: Framework de React para aplicaciones web
- **TypeScript**: Tipado estático para JavaScript
- **Tailwind CSS**: Framework de CSS utilitario
- **shadcn/ui**: Biblioteca de componentes de UI
- **Axios**: Cliente HTTP para llamadas a la API
- **Jest**: Framework de testing
- **Testing Library**: Utilidades para testing de React

## Instalación y Desarrollo

### Desarrollo Local

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
\`\`\`

### Con Docker

\`\`\`bash
# Construir la imagen
docker build -t books-scraper-frontend .

# Ejecutar el contenedor
docker run -p 3000:3000 books-scraper-frontend
\`\`\`

### Con Docker Compose

\`\`\`bash
# Ejecutar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f frontend

# Detener servicios
docker-compose down
\`\`\`

## Testing

\`\`\`bash
# Ejecutar tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
\`\`\`

## Estructura del Proyecto

\`\`\`
├── app/                    # Páginas de Next.js (App Router)
│   ├── page.tsx           # Página principal
│   ├── layout.tsx         # Layout principal
│   └── globals.css        # Estilos globales
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de shadcn/ui
│   └── book-card.tsx     # Componente de tarjeta de libro
├── __tests__/            # Casos de prueba
│   ├── page.test.tsx     # Tests de la página principal
│   └── components.test.tsx # Tests de componentes
├── Dockerfile            # Configuración de Docker
├── docker-compose.yml    # Orquestación de servicios
├── next.config.mjs       # Configuración de Next.js
├── tailwind.config.ts    # Configuración de Tailwind
├── jest.config.js        # Configuración de Jest
└── package.json          # Dependencias y scripts
\`\`\`

## API Endpoints

El frontend consume los siguientes endpoints:

- `POST /init`: Inicializar scraping
- `GET /books`: Obtener todos los libros
- `GET /books?category={category}`: Filtrar por categoría
- `GET /books/search`: Búsqueda avanzada con parámetros

## Variables de Entorno

- `NEXT_PUBLIC_API_URL`: URL base de la API backend (default: http://localhost:8000)

## Funcionalidades

### Inicialización de Scraping
- Botón prominente para inicializar el proceso de scraping
- Indicador de estado durante el proceso
- Notificaciones de éxito/error

### Visualización de Libros
- Grid responsivo de tarjetas de libros
- Scroll infinito para navegación fluida
- Imágenes de portadas con fallback
- Información completa: título, precio, categoría, ID, fecha

### Filtrado y Búsqueda
- Filtro por categorías predefinidas
- Búsqueda avanzada por:
  - Título (texto libre)
  - Categoría (selector)
  - Rango de precios (min/max)
- Resultados en tiempo real

### Responsive Design
- Adaptable a dispositivos móviles y desktop
- Grid que se ajusta según el tamaño de pantalla
- Navegación optimizada para touch

## Logging y Manejo de Errores

- Console.error para errores de API
- Toast notifications para feedback al usuario
- Estados de carga apropiados
- Fallbacks para imágenes rotas

## Integración con Docker

El proyecto incluye:
- Dockerfile optimizado para producción
- Docker Compose con servicios completos
- Health checks para monitoreo
- Volúmenes persistentes para datos
- Red interna para comunicación entre servicios

## Contribución

1. Fork el proyecto
2. Crear una rama para la feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
