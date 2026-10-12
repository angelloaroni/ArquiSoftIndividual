# InventoryPro — comparativa React · Vue · Angular · Svelte

Misma aplicación implementada 4 veces. La lógica de dominio (`data.js` / `data.ts`: generación de datos,
filtrado/orden, métricas, validación) es **idéntica** en todos; solo cambia la capa de UI y reactividad.

| Proyecto | Stack | Reactividad |
|---|---|---|
| `inventorypro-react` | React 18 + Vite | `useState` / `useMemo` / `memo` |
| `inventorypro-vue` | Vue 3.5 + Vite (SFC, `<script setup>`) | `ref` / `computed` (Proxy profundo) |
| `inventorypro-angular` | Angular 19 (standalone, signals, control flow) | `signal` / `computed` + Zone.js |
| `inventorypro-svelte` | Svelte 5 + Vite (runes) | `$state` / `$derived` (compilado) |

## Ejecutar
```bash
cd inventorypro-<framework>
npm install
npm run dev        # Angular: npm start
npm run build      # build de producción
```
Tamaño de bundles de los 4 (instala + compila + tabla): `node measure-bundles.mjs`

## Funcionalidades (idénticas)
- **Dashboard**: SKUs, unidades, stock crítico, valorizado, top 5 alertas de reabastecimiento (derivados del estado).
- **Tabla**: búsqueda instantánea (nombre/SKU/categoría), filtro por categoría, orden por columna, paginación (25/50/100/**Todas**).
- **Formulario** crear/editar con validación en tiempo real (SKU único, nombre ≥3, enteros ≥0, precio >0).
- **Acciones masivas**: selección por fila/página, `+10 stock` y eliminar en lote.
- **Barra Benchmark**: reemplazar los datos con 1.000 / 2.000 / 5.000 productos y limpiar registros para repetir el montaje desde cero. Muestra filas en DOM y total; las mediciones se realizan con F12 → Performance.

## Protocolo de benchmark sugerido
1. Usa el build de producción (`npm run build && npm run preview`; Angular: servir `dist/inventorypro/browser`). Ventana de incógnito, sin extensiones.
2. **Inserción masiva**: selecciona "Todas las filas", pulsa "Limpiar registros" y espera a que la tabla esté vacía. En F12 → Performance, inicia una grabación, pulsa Insertar 1.000 / 2.000 / 5.000 y detén la grabación cuando termine la actualización. Repite al menos 5 veces por tamaño y framework; compara la mediana de la duración de esa interacción.
3. **Filtrado**: con 5.000 filas y "Todas las filas", graba en Performance y escribe la misma consulta en cada implementación.
4. En la pista **Interactions**, selecciona el clic o la pulsación para analizar su latencia hasta el siguiente pintado, incluyendo retraso de entrada, procesamiento y presentación. Revisa también *Scripting*, *Rendering*, *Painting* y *Long Tasks*. El INP local resume interacciones de la sesión; no representa necesariamente la última inserción ni la carga inicial. Recarga entre sesiones para evitar mezclar resultados. Usa el mismo navegador, equipo y configuración de CPU en las cuatro aplicaciones.
5. Repite con paginación 50 para comparar el costo del DOM completo vs. paginado.
6. **Bundle**: `node measure-bundles.mjs` (JS/CSS crudo y gzip).
7. **LOC**: `npx cloc inventorypro-*/src --exclude-list-file=<(echo data.js; echo data.ts; echo styles.css)` para contar solo código específico de framework.

Notas: React se monta sin `StrictMode` para no duplicar renders en dev. Los datos usan semilla fija (reproducibles).
