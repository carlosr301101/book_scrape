// Configuración de Jest para testing
const nextJest = require("next/jest")

const createJestConfig = nextJest({
  // Proporcionar la ruta a tu aplicación Next.js para cargar next.config.js y archivos .env
  dir: "./",
})

// Agregar cualquier configuración personalizada de Jest a continuación
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  // Patrones de archivos a ignorar
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  // Configuración de cobertura
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  // Mapeo de módulos para resolver imports
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/$1",
  },
}

// createJestConfig es exportado de esta manera para asegurar que next/jest pueda cargar la configuración de Next.js que es asíncrona
module.exports = createJestConfig(customJestConfig)
