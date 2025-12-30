# Módulos de la Aplicación Operyx

Este documento describe las funcionalidades y módulos del sistema Operyx para gestión de producción de fábrica de medias.

## 📋 Módulos Disponibles

### ✅ Completados

#### Gestión de Proveedores (Suppliers)

- **Descripción:** Gestión completa de proveedores de materiales para la producción.

- **Funcionalidades:**
  - Registro de proveedores con información de contacto completa
  - Código único opcional para identificación
  - Información de contacto (nombre, email, teléfono, dirección)
  - Notas adicionales sobre el proveedor
  - Control de estado activo/inactivo
  - Búsqueda y filtrado de proveedores por diferentes criterios
  - Paginación de resultados
  - Relación opcional con inventario de hilos (un proveedor puede tener múltiples hilos asociados)

- **Endpoints disponibles:**
  - `POST /suppliers` - Crear un nuevo proveedor
  - `GET /suppliers` - Listar proveedores con filtros y paginación
  - `GET /suppliers/:id` - Obtener un proveedor por ID
  - `PUT /suppliers/:id` - Actualizar un proveedor
  - `DELETE /suppliers/:id` - Eliminar un proveedor

- **Relaciones:**
  - Se relaciona con Inventario de Materia Prima (hilos asociados) - Opcional

---

#### Inventario de Materia Prima (Threads)

- **Descripción:** Gestión completa del inventario de hilos y materiales utilizados en la producción de medias.

- **Funcionalidades:**
  - Registro de hilos con información completa (código, tipo, marca, calibre, color, peso en kilos)
  - Control de stock actual de cada material
  - Configuración de stock mínimo por material
  - Registro de movimientos de stock (entradas y salidas)
  - Rectificación de inventario físico (ajuste por conteo con cálculo de diferencia y merma)
  - Consulta de precios unitarios
  - Búsqueda y filtrado de materiales por diferentes criterios
  - Paginación de resultados
  - Identificación de stock bajo (filtrado en frontend comparando currentStock con minStock)
  - Asignación opcional de proveedor a cada hilo
  - Filtrado de hilos por proveedor

- **Endpoints disponibles:**
  - `POST /threads` - Crear un nuevo hilo
  - `GET /threads` - Listar hilos con filtros y paginación
  - `GET /threads/:id` - Obtener un hilo por ID
  - `PUT /threads/:id` - Actualizar un hilo
  - `DELETE /threads/:id` - Eliminar un hilo
  - `POST /threads/:id/movements` - Registrar movimiento de stock (entrada/salida)
  - `PUT /threads/:id/adjust-stock` - Rectificar inventario físico (ajuste por conteo, calcula diferencia y merma)

- **Relaciones:**
  - Se relaciona con Gestión de Proveedores (proveedor asociado) - Opcional
  - Se relaciona con Fichas Técnicas (materiales utilizados: elástico, lycra, base) - Opcional
  - Se relaciona con Órdenes de Producción (materiales utilizados) - Futuro

---

#### Fichas Técnicas de Medias (Product Specs)

- **Descripción:** Gestión de especificaciones técnicas de los diferentes modelos de medias a producir.

- **Funcionalidades:**
  - Creación de fichas técnicas con código único identificador
  - Registro de nombre de archivo asociado a la ficha técnica
  - Definición de talla estándar (2-4, 4-6, 6-8, 8-10, 10-12)
  - Asignación de materiales utilizados (hilo elástico, hilo lycra, hilo base principal)
  - Configuración de densidades para 7 partes de la media (valores 10-50)
  - Registro de tiempo estimado de elaboración (en segundos)
  - Registro de peso del par de medias terminado (en kg)
  - Notas adicionales sobre características especiales
  - Actualización de especificaciones
  - Consulta de fichas técnicas con información completa de materiales
  - Búsqueda y filtrado por código, nombre de archivo, talla, materiales
  - Paginación de resultados

- **Endpoints disponibles:**
  - `POST /product-specs` - Crear una nueva ficha técnica
  - `GET /product-specs` - Listar fichas técnicas con filtros y paginación
  - `GET /product-specs/:id` - Obtener una ficha técnica por ID (incluye información de materiales)
  - `PUT /product-specs/:id` - Actualizar una ficha técnica
  - `DELETE /product-specs/:id` - Eliminar una ficha técnica

- **Relaciones:**
  - Se relaciona con Inventario de Materia Prima (hilos utilizados: elástico, lycra, base) - Opcional
  - Se relaciona con Órdenes de Producción (especificaciones a seguir) - Futuro

---

#### Gestión de Maquinaria (Machines)

- **Descripción:** Registro y gestión de las máquinas de producción con sus características y estados.

- **Funcionalidades:**
  - Registro de máquinas con código único identificador
  - Características técnicas: número de agujas (valor fijo), cantidad de colores que puede trabajar (máximo 15)
  - Tallas que puede producir (1 a 3 tallas por máquina, relacionadas con el enum Size)
  - Estado de la máquina: operativa, ejecutando, mantenimiento, inactiva
  - Horas de trabajo acumuladas (inicia en 0, se actualiza con órdenes ejecutadas)
  - Notas adicionales sobre la máquina
  - Consulta de máquinas por diferentes criterios (código, nombre, estado, agujas, colores, tallas)
  - Paginación de resultados
  - Búsqueda general por código o nombre
  - Estado por defecto para nuevas máquinas: operativa

- **Endpoints disponibles:**
  - `POST /machines` - Crear una nueva máquina
  - `GET /machines` - Listar máquinas con filtros y paginación
  - `GET /machines/:id` - Obtener una máquina por ID
  - `PATCH /machines/:id` - Actualizar una máquina
  - `DELETE /machines/:id` - Eliminar una máquina

- **Relaciones:**
  - Se relaciona con Fichas Técnicas (tallas que puede producir) - Indirecta
  - Se relaciona con Órdenes de Producción (asignación de órdenes, cola de órdenes, historial) - Futuro

---

### 🚧 En Desarrollo

       _Ningún módulo en desarrollo actualmente_

### 📋 Pendientes

---

#### Órdenes de Producción (Production Orders)

- **Descripción:** Gestión de órdenes de producción con seguimiento de estado y asignación de recursos.

- **Funcionalidades:**
  - Creación de órdenes de producción
  - Asignación de modelo y cantidad a producir
  - Asignación a líneas de producción (futuro)
  - Estados de orden (pendiente, en producción, completada, cancelada)
  - Fechas de inicio y fin estimadas
  - Fechas reales de inicio y fin
  - Priorización de órdenes
  - Cancelación de órdenes
  - Consulta de órdenes por estado, fecha, modelo
  - Cálculo automático de materiales necesarios según ficha técnica

- **Relaciones:**
  - Se relaciona con Fichas Técnicas (especificaciones a seguir)
  - Se relaciona con Inventario de Materia Prima (consumo de materiales)
  - Se relaciona con Control de Producción (seguimiento en tiempo real)
  - Se relaciona con Gestión de Pérdidas (registro de pérdidas por orden)

---

#### Control de Producción (Production Control)

- **Descripción:** Seguimiento en tiempo real de la producción activa y registro de avances.

- **Funcionalidades:**
  - Registro de producción diaria por orden
  - Seguimiento de unidades producidas vs unidades programadas
  - Cálculo de eficiencia de producción
  - Registro de tiempos de producción reales
  - Asignación de operarios a líneas de producción (futuro)
  - Consulta de producción por orden, fecha, línea
  - Actualización de estado de producción

- **Relaciones:**
  - Se relaciona con Órdenes de Producción (producción por orden)
  - Se relaciona con Gestión de Pérdidas (pérdidas durante producción)
  - Se relaciona con Reportes (datos para reportes)

---

#### Gestión de Pérdidas (Losses Management)

- **Descripción:** Registro y cálculo de pérdidas y mermas durante el proceso de producción.

- **Funcionalidades:**
  - Registro de pérdidas por orden de producción
  - Tipos de pérdidas (cortes, defectos, desperdicio, etc.)
  - Cálculo automático de porcentaje de pérdida
  - Registro de cantidad de material perdido
  - Causas de pérdidas
  - Historial de pérdidas por orden
  - Consulta de pérdidas por tipo, orden, fecha
  - Alertas cuando las pérdidas superan un umbral configurado

- **Relaciones:**
  - Se relaciona con Órdenes de Producción (pérdidas por orden)
  - Se relaciona con Control de Producción (pérdidas durante producción)
  - Se relaciona con Inventario de Materia Prima (material perdido)
  - Se relaciona con Reportes (análisis de pérdidas)

---

#### Reportes (Reports)

- **Descripción:** Generación de reportes y análisis de diferentes aspectos de la producción.

- **Funcionalidades:**
  - Reporte de producción diaria, semanal, mensual
  - Reporte de eficiencia por línea de producción (futuro)
  - Reporte de pérdidas y mermas
  - Reporte de inventario de materiales
  - Reporte de órdenes completadas vs pendientes
  - Reporte de consumo de materiales
  - Reporte de tiempos de producción
  - Análisis de tendencias de producción
  - Exportación de reportes (futuro: PDF, Excel)

- **Relaciones:**
  - Se relaciona con todos los módulos anteriores (consolida información)

---

## 🔗 Comunicación entre Módulos

Los módulos están diseñados para funcionar de manera independiente pero comunicarse entre sí cuando sea necesario:

- **Proveedores** ↔ **Inventario**: Asignación opcional de proveedor a materiales (hilos)
- **Inventario** ↔ **Fichas Técnicas**: Referencia a hilos utilizados en fichas técnicas (elástico, lycra, base)
- **Fichas Técnicas** ↔ **Maquinaria**: Tallas que puede producir cada máquina (indirecta)
- **Fichas Técnicas** ↔ **Órdenes de Producción**: Aplicación de especificaciones al iniciar producción (futuro)
- **Maquinaria** ↔ **Órdenes de Producción**: Asignación de órdenes a máquinas, cola de órdenes, historial (futuro)
- **Inventario** ↔ **Órdenes de Producción**: Consulta de disponibilidad de materiales al crear una orden (futuro)
- **Órdenes de Producción** ↔ **Control de Producción**: Seguimiento de avance de órdenes (futuro)
- **Control de Producción** ↔ **Gestión de Pérdidas**: Registro de pérdidas durante producción (futuro)
- **Todos los Módulos** → **Reportes**: Consolidación de datos para análisis (futuro)

Esta arquitectura modular permite:

- Desarrollo independiente de cada funcionalidad
- Escalabilidad fácil (agregar nuevos módulos sin afectar existentes)
- Mantenimiento simplificado
- Pruebas aisladas por módulo
