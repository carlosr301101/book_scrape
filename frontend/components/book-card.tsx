/**
 * Componente para mostrar información de un libro individual
 * Utilizado en la lista principal y en los resultados de búsqueda
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Book {
  id: string
  title: string
  price: number
  category: string
  image_url: string
  created_at: string
}

interface BookCardProps {
  book: Book
}

export function BookCard({ book }: BookCardProps) {
  return (
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
}
