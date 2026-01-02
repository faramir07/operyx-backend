-- Script para agregar el campo totalValue a la tabla threads y calcular los valores existentes
-- Ejecutar este script después de agregar el campo a la entidad

-- Paso 1: Agregar la columna totalValue si no existe (TypeORM lo hace automáticamente si synchronize: true)
-- ALTER TABLE threads ADD COLUMN IF NOT EXISTS totalValue DECIMAL(15, 2) DEFAULT 0;

-- Paso 2: Calcular y actualizar el valor total para todos los registros existentes
UPDATE threads 
SET "totalValue" = ROUND(CAST("currentStock" AS NUMERIC) * CAST(price AS NUMERIC), 2)
WHERE "totalValue" IS NULL OR "totalValue" = 0;

-- Verificar los resultados
SELECT 
    code,
    "currentStock",
    price,
    "totalValue",
    CAST("currentStock" AS NUMERIC) * CAST(price AS NUMERIC) AS calculated_value
FROM threads
ORDER BY code;

