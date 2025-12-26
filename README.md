# Operyx Backend

Backend API desarrollado con NestJS para la aplicación Operyx.

## 🚀 Tecnologías

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **Passport** - Estrategias de autenticación
- **Bcrypt** - Encriptación de contraseñas
- **Class Validator** - Validación de DTOs

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

## 🔧 Instalación

1. Clonar el repositorio
```bash
git clone <repository-url>
cd Operyx-backend
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus configuraciones:
- Configuración de la base de datos
- Secretos JWT
- URLs del frontend y backend

4. Ejecutar migraciones (si aplica)
```bash
npm run migration:run
```

## 🏃 Ejecutar la aplicación

### Desarrollo
```bash
npm run start:dev
```

### Producción
```bash
npm run build
npm run start:prod
```

## 📁 Estructura del Proyecto

```
src/
├── common/           # Código compartido
│   ├── decorators/  # Decoradores personalizados
│   ├── filters/     # Exception filters
│   ├── guards/      # Auth guards
│   └── interceptors/# Response interceptors
├── config/          # Configuraciones
├── modules/         # Módulos de la aplicación
└── main.ts          # Punto de entrada
```

## 🔐 Autenticación

El proyecto utiliza JWT para autenticación. Las rutas protegidas requieren un token válido en el header `Authorization`.

Para marcar una ruta como pública, usa el decorador `@Public()`:

```typescript
import { Public } from './common/decorators';

@Public()
@Get('public-route')
getPublicData() {
  return { message: 'This is public' };
}
```

## 📝 Scripts Disponibles

- `npm run start` - Iniciar en modo producción
- `npm run start:dev` - Iniciar en modo desarrollo (watch)
- `npm run start:debug` - Iniciar en modo debug
- `npm run build` - Compilar el proyecto
- `npm run format` - Formatear código con Prettier
- `npm run lint` - Ejecutar ESLint
- `npm run test` - Ejecutar tests unitarios
- `npm run test:e2e` - Ejecutar tests end-to-end
- `npm run test:cov` - Ejecutar tests con cobertura

## 🌐 API Response Format

Todas las respuestas de la API siguen un formato estándar:

**Éxito:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/endpoint",
    "method": "GET",
    "message": "Error message"
  }
}
```

## 📚 Documentación

La documentación de la API estará disponible en `/api/docs` cuando se configure Swagger.

## 🤝 Contribuir

1. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
2. Commitear tus cambios (`git commit -m 'Add some AmazingFeature'`)
3. Push a la rama (`git push origin feature/AmazingFeature`)
4. Abrir un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.
