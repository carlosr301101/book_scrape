/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para optimización de imágenes externas
  images: {
    domains: ['books.toscrape.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'books.toscrape.com',
        port: '',
        pathname: '/media/**',
      },
    ],
    unoptimized: true,
  },
  // Habilitar el output standalone para Docker
  output: 'standalone',
  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
