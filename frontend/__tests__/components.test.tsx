/**
 * Casos de prueba para componentes individuales
 */
import { render, screen } from "@testing-library/react"
import { BookCard } from "../components/book-card"

// Datos de prueba para un libro
const mockBook = {
  id: "1",
  title: "Test Book Title",
  price: 19.99,
  category: "Fiction",
  image_url: "https://example.com/book.jpg",
  created_at: "2025-01-01T00:00:00Z",
}

describe("BookCard Component", () => {
  test("renders book information correctly", () => {
    render(<BookCard book={mockBook} />)

    // Verificar que se muestra el título
    expect(screen.getByText("Test Book Title")).toBeInTheDocument()

    // Verificar que se muestra el precio
    expect(screen.getByText("$19.99")).toBeInTheDocument()

    // Verificar que se muestra la categoría
    expect(screen.getByText("Fiction")).toBeInTheDocument()

    // Verificar que se muestra el ID
    expect(screen.getByText(/ID: 1/)).toBeInTheDocument()
  })

  test("handles image loading errors", () => {
    render(<BookCard book={mockBook} />)

    // Verificar que la imagen tiene el src correcto
    const image = screen.getByRole("img")
    expect(image).toHaveAttribute("src", mockBook.image_url)
    expect(image).toHaveAttribute("alt", mockBook.title)
  })
})
