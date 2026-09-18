# Endpoints del Backend Utilizados en el Frontend

## Resumen
Se reemplazó el uso de datos quemados por servicios HTTP. Cada servicio tiene fallback automático a datos locales si el endpoint no funciona.

## Servicios y Endpoints

### 1. `src/services/snacksService.js`
- **Endpoint:** `GET /cliente/confiteria`
- **Fallback:** `src/data/snacks.js`
- **Funciones:**
  - `getSnacks()`
  - `getSnackById(snackId)`

### 2. `src/services/multiplexService.js`
- **Endpoint:** `GET /administrador/listar-sedes`
- **Fallback:** `src/data/cinemas.js`
- **Funciones:**
  - `getMultiplexes()`
  - `getMultiplexById(multiplexId)`

### 3. `src/services/loyaltyService.js`
- **Endpoint:** `GET /cliente/mis-puntos`
- **Fallback:** `src/data/loyalty.js`
- **Funciones:**
  - `getUserPoints(userId)`
  - `getLoyaltyConfig()`

### 4. `src/services/movieService.js`
- **Endpoint:** `GET /funciones`
- **Fallback:** `src/data/movies.js`
- **Funciones:**
  - `getMovies()`
  - `getMovieById(movieId)`

## Componentes Actualizados

- `src/pages/Landing.jsx`
- `src/pages/Snacks.jsx`
- `src/pages/Loyalty.jsx`
- `src/components/common/WelcomeLocationModal.jsx`
- `src/components/common/CinemaSelectionModal.jsx`
- `src/contexts/LoyaltyContext.jsx`
- `src/hooks/useSnacks.js`
- `src/components/landing/MovieGrid.jsx`
- `src/components/landing/FeaturedCarousel.jsx`
- `src/components/landing/CinemaGrid.jsx`

## Fallback Automático

Si el endpoint falla, el servicio usa automáticamente los datos de `src/data/`. Cuando el backend esté listo, el frontend usará los datos reales sin cambios.

## Endpoints Faltantes en el Backend

### Endpoints Placeholders (Existen pero devuelven strings, necesitan implementación real)
- `GET /cliente/confiteria` - Debe devolver array de snacks
- `GET /administrador/listar-sedes` - Debe devolver array de sedes
- `GET /cliente/mis-puntos` - Debe devolver objeto con puntos y configuración

### Endpoints que No Existen (Servicios implementados sin controller)
- `GET /peliculas` - Para obtener todas las películas
- `GET /peliculas/{id}` - Para obtener una película específica
- `GET /sedes` - Para obtener todas las sedes
- `GET /sedes/{id}` - Para obtener una sede específica
- `GET /inventario` - Para obtener todo el inventario
- `GET /inventario/sede/{sedeId}` - Para obtener inventario por sede
- `GET /puntos/usuario/{usuarioId}` - Para obtener puntos de usuario
- `GET /puntos/saldo/{usuarioId}` - Para obtener saldo de puntos
