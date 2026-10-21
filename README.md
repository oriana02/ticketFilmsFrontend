# TicketFilms — Frontend

Aplicación web para descubrir películas y eventos, elegir función, reservar asientos y comprar boletos con código QR. Es el frontend de la plataforma TicketFilms (proyecto de DSY1107, Desarrollo Cloud Native I).

## Tecnologías

- React 19 + Vite
- React Router 7
- Axios (cliente HTTP con token automático)
- Amazon Cognito + Google (OIDC, Authorization Code con PKCE) mediante `oidc-client-ts` y `react-oidc-context`
- `qrcode.react` para el QR del boleto
- Oxlint para el análisis de código

## Cómo funciona

El frontend no habla con los microservicios directamente: todas las llamadas pasan por el API Gateway (`/api/...`).

| Ruta del frontend | Qué hace | Requiere sesión |
|---|---|---|
| `/` | Inicio con cartelera, próximos estrenos y eventos | No |
| `/peliculas`, `/eventos` | Listados con filtros (región, ciudad, sede, género) | No |
| `/titulo/:type/:id` | Detalle de película o evento | No |
| `/titulo/:type/:id/horarios` | Elegir función y cantidad de asientos (General / Premium) | No |
| `/titulo/:type/:id/asientos` | Mapa de asientos y reserva temporal de 5 minutos | Sí |
| `/titulo/:type/:id/resumen` | Resumen y confirmación de compra | Sí |
| `/confirmacion/:code` | Boleto con QR | Sí |
| `/cuenta` | Historial de boletos | Sí |

Servicios del backend que consume:

- `ms-cartelera`: eventos, funciones, regiones, ciudades y sedes (rutas públicas).
- `ms-asientos`: salas, mapa de asientos y reservas.
- `ms-boletos`: compra e historial de boletos.

## Requisitos

- Node.js 20.19 o superior (o 22.12+)
- npm
- Backend y API Gateway en ejecución (por defecto en `http://localhost:8080`)

## Instalación y ejecución

```bash
npm install
cp .env.example .env     # completa los valores (ver abajo)
npm run dev              # http://localhost:5173
```

## Variables de entorno

Se definen en un archivo `.env` (no se sube al repositorio). Usa `.env.example` como plantilla.

| Variable | Descripción |
|---|---|
| `VITE_COGNITO_AUTHORITY` | URL del emisor del User Pool de Cognito |
| `VITE_COGNITO_CLIENT_ID` | Client ID de la app en Cognito (sin client secret) |
| `VITE_COGNITO_DOMAIN` | Dominio de Cognito, usado para cerrar sesión |
| `VITE_REDIRECT_URI` | URL de retorno tras el login (`.../callback`) |
| `VITE_POST_LOGOUT_REDIRECT_URI` | URL a la que se vuelve tras cerrar sesión |
| `VITE_COGNITO_LOGOUT_URI` | URL de retorno del cierre de sesión en Cognito |
| `VITE_API_BASE_URL` | URL del API Gateway (en local: `http://localhost:8080`) |

Las URLs de retorno deben estar registradas en el app client de Cognito.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Sirve la versión de producción en local |
| `npm run lint` | Revisa el código con Oxlint |

## Estructura

```
src/
├── auth/          configuración de OIDC / Cognito
├── components/    auth, booking, common, home y layout
├── context/       BookingContext (estado del flujo de compra)
├── hooks/         useTitulos, useSalas, useFiltrosCascada
├── lib/           apiClient (Axios + token Bearer)
├── pages/         una página por ruta
├── services/      llamadas al backend y adaptadores de datos
├── styles/        CSS por componente y tokens de diseño
└── utils/         formato de dinero, precios y errores
```

## Despliegue

El frontend se despliega en Vercel. `vercel.json` reenvía `/api/*` al API Gateway y redirige el resto de las rutas a `index.html` para que funcione React Router. Las variables de entorno se configuran en el panel de Vercel.
