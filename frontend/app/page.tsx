"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Search, RefreshCw, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

// Interfaz para definir la estructura de un libro
interface Book {
  id: string
  title: string
  price: number
  category: string
  image_url: string
  created_at: string
}

// Interfaz para los parámetros de búsqueda
interface SearchParams {
  title?: string
  category?: string
  min_price?: number
  max_price?: number
}

export default function HomePage() {
  // Estados para manejar los datos y la UI
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [scraping, setScraping] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchParams, setSearchParams] = useState<SearchParams>({})
  const [searchResults, setSearchResults] = useState<Book[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const { toast } = useToast()

  // URL base de la API - se puede configurar como variable de entorno
  const API_BASE_URL ="http://127.0.0.1:18000"

  // Función para inicializar el scraping de libros
  const initializeScraping = async () => {
    setScraping(true)
    try {
      // Llamada POST al endpoint /init para inicializar el scraping
      await axios.post(`${API_BASE_URL}/init`)
      toast({
        title: "Scraping iniciado",
        description: "El proceso de scraping ha comenzado exitosamente",
      })
      // Recargar los libros después del scraping
      await fetchBooks()
    } catch (error) {
      console.error("Error al inicializar scraping:", error)
      toast({
        title: "Error",
        description: "No se pudo inicializar el scraping",
        variant: "destructive",
      })
    } finally {
      setScraping(false)
    }
  }

  // Función para obtener todos los libros o filtrar por categoría
  const fetchBooks = async (category?: string) => {
    setLoading(true)
    try {
      // Construir la URL con el parámetro de categoría si existe
      const url = category ? `${API_BASE_URL}/books?category=${category}` : `${API_BASE_URL}/books`

      const response = await axios.get(url)
      setBooks(response.data)
    } catch (error) {
      console.error("Error al obtener libros:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los libros",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para realizar búsquedas avanzadas
  const searchBooks = async () => {
    setSearchLoading(true)
    try {
      // Construir los parámetros de búsqueda
      const params = new URLSearchParams()
      if (searchParams.title) params.append("title", searchParams.title)
      if (searchParams.category) params.append("category", searchParams.category)
      if (searchParams.min_price) params.append("min_price", searchParams.min_price.toString())
      if (searchParams.max_price) params.append("max_price", searchParams.max_price.toString())

      const response = await axios.get(`${API_BASE_URL}/books/search?${params.toString()}`)
      setSearchResults(response.data)
    } catch (error) {
      console.error("Error en búsqueda:", error)
      toast({
        title: "Error",
        description: "No se pudo realizar la búsqueda",
        variant: "destructive",
      })
    } finally {
      setSearchLoading(false)
    }
  }

  // Cargar libros al montar el componente
  useEffect(() => {
    fetchBooks()
  }, [])

  // Manejar cambio de categoría
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    if (category === "all") {
      fetchBooks()
    } else {
      fetchBooks(category)
    }
  }

  // Componente para renderizar una tarjeta de libro
  const BookCard = ({ book }: { book: Book }) => (
    <Card className="w-full max-w-sm mx-auto hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="aspect-[3/4] relative overflow-hidden rounded-md bg-gray-100">
          <img
            src={book.image_url || "/placeholder.svg"}
            alt={book.title}
            className="object-cover w-full h-full"
            onError={(e) => {
              // Fallback en caso de error al cargar la imagen
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=300&width=200&text=No+Image"
            }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-sm font-medium line-clamp-2 mb-2">{book.title}</CardTitle>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {book.category}
          </Badge>
          <span className="text-lg font-bold text-green-600">${book.price.toFixed(2)}</span>
        </div>
        <CardDescription className="text-xs text-gray-500">
          ID: {book.id} • {new Date(book.created_at).toLocaleDateString()}
        </CardDescription>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header con título y botón de scraping */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Books Scraper
          </h1>
          <p className="text-gray-600 mt-1">Sistema de scraping y búsqueda de libros</p>
        </div>

        {/* Botón para inicializar scraping */}
        <Button onClick={initializeScraping} disabled={scraping} size="lg" className="w-full sm:w-auto">
          {scraping ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping en proceso...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Inicializar Scraping
            </>
          )}
        </Button>
      </div>

      {/* Tabs para navegación entre vista general y búsqueda */}
      <Tabs defaultValue="books" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="books">Todos los Libros</TabsTrigger>
          <TabsTrigger value="search">Búsqueda Avanzada</TabsTrigger>
        </TabsList>

        {/* Tab de todos los libros */}
        <TabsContent value="books" className="space-y-6">
          {/* Filtro por categoría */}
          {/* Grid de libros con scroll */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Libros Disponibles ({books.length})</h2>
              <Button variant="outline" onClick={() => fetchBooks(selectedCategory || undefined)} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <ScrollArea className="h-[600px] w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-1">
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
                {books.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No se encontraron libros</p>
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
        </TabsContent>

        {/* Tab de búsqueda avanzada */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Búsqueda Avanzada</CardTitle>
              <CardDescription>Busca libros por título, categoría, y rango de precios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campo de búsqueda por título */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    placeholder="Buscar por título..."
                    value={searchParams.title || ""}
                    onChange={(e) => setSearchParams((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                {/* Selector de categoría */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={searchParams.category || "all"}
                    onValueChange={(value) => setSearchParams((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="Fiction">Fiction</SelectItem>
                      <SelectItem value="Nonfiction">Nonfiction</SelectItem>
                      <SelectItem value="Mystery">Mystery</SelectItem>
                      <SelectItem value="Romance">Romance</SelectItem>
                      <SelectItem value="Science Fiction">Science Fiction</SelectItem>
                      <SelectItem value="Fantasy">Fantasy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Campo de precio mínimo */}
                <div className="space-y-2">
                  <Label htmlFor="min_price">Precio Mínimo</Label>
                  <Input
                    id="min_price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={searchParams.min_price || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        min_price: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>

                {/* Campo de precio máximo */}
                <div className="space-y-2">
                  <Label htmlFor="max_price">Precio Máximo</Label>
                  <Input
                    id="max_price"
                    type="number"
                    step="0.01"
                    placeholder="999.99"
                    value={searchParams.max_price || ""}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        max_price: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Botón de búsqueda */}
              <Button onClick={searchBooks} disabled={searchLoading} className="w-full">
                {searchLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar Libros
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultados de búsqueda */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Resultados de Búsqueda ({searchResults.length})</h2>

            {searchLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <ScrollArea className="h-[600px] w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-1">
                  {searchResults.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
                {searchResults.length === 0 && !searchLoading && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      No se encontraron resultados. Intenta con otros criterios de búsqueda.
                    </p>
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
