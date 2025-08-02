/**
 * Casos de prueba para la página principal
 * Prueba la funcionalidad de scraping, búsqueda y visualización de libros
 */
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import axios from "axios"
import HomePage from "../app/page"
import { jest } from "@jest/globals"

// Mock de axios
const mockedAxios = axios as jest.Mocked<typeof axios>

// Datos de prueba
const mockBooks = [
  {
    id: "1",
    title: "Test Book 1",
    price: 19.99,
    category: "Fiction",
    image_url: "https://example.com/book1.jpg",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    title: "Test Book 2",
    price: 25.5,
    category: "Mystery",
    image_url: "https://example.com/book2.jpg",
    created_at: "2025-01-02T00:00:00Z",
  },
]

describe("HomePage", () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks()
    // Mock de respuesta exitosa por defecto
    mockedAxios.get.mockResolvedValue({ data: mockBooks })
    mockedAxios.post.mockResolvedValue({ data: {} })
  })

  /**
   * RF1: Verificar que la página se renderiza correctamente
   */
  test("renders the main page with title and scraping button", async () => {
    render(<HomePage />)

    // Verificar que el título está presente
    expect(screen.getByText("Books Scraper")).toBeInTheDocument()

    // Verificar que el botón de scraping está presente
    expect(screen.getByText("Inicializar Scraping")).toBeInTheDocument()

    // Verificar que se cargan los libros al montar
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8000/books")
    })
  })

  /**
   * RF2: Verificar funcionalidad de inicialización de scraping
   */
  test("initializes scraping when button is clicked", async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    const scrapingButton = screen.getByText("Inicializar Scraping")

    // Hacer clic en el botón de scraping
    await user.click(scrapingButton)

    // Verificar que se hace la llamada POST al endpoint /init
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith("http://localhost:8000/init")
    })
  })

  /**
   * RF2: Verificar que los libros se muestran correctamente
   */
  test("displays books in scrollable format", async () => {
    render(<HomePage />)

    // Esperar a que se carguen los libros
    await waitFor(() => {
      expect(screen.getByText("Test Book 1")).toBeInTheDocument()
      expect(screen.getByText("Test Book 2")).toBeInTheDocument()
    })

    // Verificar que se muestran los precios
    expect(screen.getByText("$19.99")).toBeInTheDocument()
    expect(screen.getByText("$25.50")).toBeInTheDocument()

    // Verificar que se muestran las categorías
    expect(screen.getByText("Fiction")).toBeInTheDocument()
    expect(screen.getByText("Mystery")).toBeInTheDocument()
  })

  /**
   * RF2: Verificar filtrado por categoría
   */
  test("filters books by category", async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    // Esperar a que se cargue la página
    await waitFor(() => {
      expect(screen.getByText("Test Book 1")).toBeInTheDocument()
    })

    // Abrir el selector de categoría
    const categorySelect = screen.getByRole("combobox")
    await user.click(categorySelect)

    // Seleccionar categoría Fiction
    const fictionOption = screen.getByText("Fiction")
    await user.click(fictionOption)

    // Verificar que se hace la llamada con el parámetro de categoría
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8000/books?category=Fiction")
    })
  })

  /**
   * RF2: Verificar funcionalidad de búsqueda avanzada
   */
  test("performs advanced search", async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    // Cambiar a la pestaña de búsqueda
    const searchTab = screen.getByText("Búsqueda Avanzada")
    await user.click(searchTab)

    // Llenar campos de búsqueda
    const titleInput = screen.getByPlaceholderText("Buscar por título...")
    await user.type(titleInput, "Test")

    const minPriceInput = screen.getByPlaceholderText("0.00")
    await user.type(minPriceInput, "10")

    const maxPriceInput = screen.getByPlaceholderText("999.99")
    await user.type(maxPriceInput, "30")

    // Hacer clic en buscar
    const searchButton = screen.getByText("Buscar Libros")
    await user.click(searchButton)

    // Verificar que se hace la llamada de búsqueda con los parámetros correctos
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:8000/books/search?title=Test&min_price=10&max_price=30",
      )
    })
  })

  /**
   * RF3: Verificar manejo de errores
   */
  test("handles API errors gracefully", async () => {
    // Mock de error en la API
    mockedAxios.get.mockRejectedValueOnce(new Error("API Error"))

    render(<HomePage />)

    // Verificar que se maneja el error sin romper la aplicación
    await waitFor(() => {
      expect(screen.getByText("Books Scraper")).toBeInTheDocument()
    })
  })

  /**
   * RF3: Verificar estado de carga
   */
  test("shows loading states correctly", async () => {
    const user = userEvent.setup()

    // Mock de respuesta lenta
    mockedAxios.post.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 100)))

    render(<HomePage />)

    const scrapingButton = screen.getByText("Inicializar Scraping")
    await user.click(scrapingButton)

    // Verificar que se muestra el estado de carga
    expect(screen.getByText("Scraping en proceso...")).toBeInTheDocument()
  })
})
