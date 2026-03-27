# 🚀 GUÍA DE PRUEBAS - SCMM Simulador Calendarios

## Estado de Desarrollo
- **Versión**: 2.0.0 (TypeScript + Next.js 14)
- **Fecha**: 27 Marzo 2026
- **Completado**: 8/8 Fases ✅

---

## Instalación & Setup

### 1. Instalar Dependencias
```bash
cd simulador-de-calendarios
npm install
```

### 2. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Abrirá automáticamente `http://localhost:3000`

### 3. Compilar para Producción
```bash
npm run build
npm start
```

---

## Flujo de Pruebas Completo

### ✅ PASO 1: Verificar Layout Inicial
**Esperado:**
- Header con título "📅 SCMM Simulador Calendarios"
- 6 pestañas visibles: Ajustes, Cal.A, Cal.B, Cal.C, Rotación, Análisis
- Pestaña activa: "Ajustes"

**Acción:** Abrir http://localhost:3000

---

### ✅ PASO 2: Probar Pestaña "Ajustes"
**En la pestaña Ajustes, verificar:**

#### 2.1 Datos Generales
- [ ] Input "PLANTILLA MTE TOTAL" visible (default: 2100)
- [ ] Capacidad Cal. C calcula automáticamente: 2100 / 52 = 40 plazas
- [ ] Input "Máx. Solapamiento": visible
- [ ] Input "Créditos Auto por MTE": visible

#### 2.2 Sorteo Rotación
- [ ] Botón "Subir Excel DNE" funciona
- [ ] Mostrar fichero DNE (inicialmente "Sin cargar")
- [ ] Listar unidades A1-C4 con botones ↑↓ para reordenar
- [ ] Botón "Restaurar" resetea secuencia

**Acción:** Intenta cargar un Excel con DNE en una columna

#### 2.3 Nivel de Presión
- [ ] 11 inputs de presión (Lab, F.S., Festivos, etc.)
- [ ] Valores muestran en rango 0.5-1.5

#### 2.4 Parámetros Lógicos
- [ ] Input "Años Proyección": default 2
- [ ] Agregar festivos personalizados: mes + día + botón +
- [ ] Mostrar listado de festivos con ×

#### 2.5 PAP - Cupos
- [ ] Input "Días PAP por MTE"
- [ ] Toggle ON/OFF para asignación automática
- [ ] Tabla de 5 temporadas × 3 tipos día

#### 2.6 Auto Profile
- [ ] 5 segmentos estacionales con inputs
- [ ] Botón "Restaurar perfil base"

#### 2.7 Botones de Acción
- [ ] Botón "💾 Guardar Configuración" visible
- [ ] Botón "🔄 Restaurar Defaults" visible

**Prueba Funcional:**
1. Cambiar MTE a 2500
2. Cambiar presionLab a 0.7
3. Agregar un festivo personalizado (ej: 15-8)
4. Hacer click en "Guardar Configuración"
5. ✅ Esperado: Mensaje de éxito (sin errores)

---

### ✅ PASO 3: Probar Pestaña "Cal. A"
**En la pestaña Calendario A, verificar:**

#### 3.1 Carga Automática
- [ ] Se calcula automáticamente al cambiar pestaña
- [ ] Show: "Calculando calendario..." durante proceso
- [ ] Debe completarse en <5 segundos

#### 3.2 Estadísticas Superiores
- [ ] Tarjeta "Total Días": 365
- [ ] Tarjeta "Asignados": número > 0
- [ ] Tarjeta "Utilización": porcentaje 0-100%
- [ ] Tarjeta "Presión Promedio": número > 0

#### 3.3 Leyenda de Colores
- [ ] Panel expandible con 6 tipos de días
- [ ] Cada tipo tiene emoji + color

#### 3.4 Grid de Calendario
- [ ] Organizados por mes
- [ ] Cada mes muestra: Total, Laborales, F/S, Festivos
- [ ] Grid 7 días/semana agrupados en semanas
- [ ] Días coloreados según tipo
- [ ] Clickeable: selecciona día y muestra detalles

#### 3.5 Detalles de Día
- [ ] Al clickear un día, muestra panel con:
  - Tipo de Día
  - Día Semana
  - Presión (0.0-10.0)
  - Cuota

#### 3.6 Exportación
- [ ] Botón "📊 Descargar CSV" genera archivo
- [ ] Archivo nomina: `calendario-A-{timestamp}.csv`
- [ ] Contiene: Fecha, Día, Tipo, Presión, Cuota

**Prueba Funcional:**
1. Click en un día (ej: 15-01-2026)
2. ✅ Esperado: Muestra detalles día con presión
3. Click en "Descargar CSV"
4. ✅ Esperado: Se descarga `calendario-A-*.csv`

---

### ✅ PASO 4: Probar Pestaña "Cal. B" y "Cal. C"
- Repetir PASO 3 para Calendario B
- Repetir PASO 3 para Calendario C
- ✅ Esperado: Misma funcionalidad, diferente tipo

---

### ✅ PASO 5: Probar Pestaña "Rotación"
**En la pestaña Rotación, verificar:**

#### 5.1 Visualización Actual
- [ ] Gran tarjeta mostrando unidad actual (A1-C4)
- [ ] Emoji del grupo (🔴 A, 🔵 B, 🟢 C)
- [ ] Periodo: "Periodo X de 13"
- [ ] Semana: "Semana X"

#### 5.2 Controles de Reproducción
- [ ] Botón "▶️ Reproducir" / "⏸️ Pausa"
- [ ] Botón "🔄 Reiniciar"
- [ ] Botón "⏮️ Atrás" (deshabilitado en paso 0)
- [ ] Botón "⏭️ Adelante" (deshabilitado en paso 51)

#### 5.3 Control de Velocidad
- [ ] 3 botones: 0.5x, 1x, 2x
- [ ] Botón activo está resaltado
- [ ] Cambiar velocidad afecta animación

#### 5.4 Progreso
- [ ] Barra de progreso visual (0-100%)
- [ ] Texto "Semana X / 52"

#### 5.5 Estadísticas
- [ ] Equidad Rotacional: 0-100%
- [ ] Mensaje según valor (Excelente, Buena, Requiere rebalanceo)
- [ ] Listado de 12 unidades con daysOn y daysOff

#### 5.6 Grid de Secuencia
- [ ] 13 cajas representando 13 periodos
- [ ] Colores por grupo (rojo A, azul B, verde C)
- [ ] Click en caja salta a ese punto

#### 5.7 Timeline Visual
- [ ] 4 filas de 13 semanas cada una (52 total)
- [ ] Números de semana (1-52)
- [ ] Colores por grupo
- [ ] Click selecciona semana

#### 5.8 Exportación
- [ ] Botón "📥 Exportar CSV"
- [ ] Genera: `rotacion-{timestamp}.csv`

**Prueba Funcional:**
1. Click "▶️ Reproducir"
2. ✅ Esperado: Unidad avanza cada 2s
3. Click en caja periodo (ej: período 5)
4. ✅ Esperado: Salta a unidad de ese periodo
5. Change velocidad a 2x
6. ✅ Esperado: Animación más rápida

---

### ✅ PASO 6: Probar Pestaña "Análisis"
**En la pestaña Análisis, verificar:**

#### 6.1 Tarjetas de Resumen
- [ ] 3 tarjetas: Cal. A, Cal. B, Cal. C
- [ ] Cada una muestra: Total días, asignados, utilización %

#### 6.2 Gráfico de Barras
- [ ] BarChart de Recharts
- [ ] Eje X: Cal. A, Cal. B, Cal. C
- [ ] Eje Y: Conteo de días
- [ ] Barras: laboral (azul), sabado (naranja), domingo (rojo), festivo (púrpura)

#### 6.3 Pie Charts (3x)
- [ ] Un donut chart por calendario (A, B, C)
- [ ] Colores: laboral, sabado, domingo, festivo, vacacion, descanso
- [ ] Sector visible por tipo día
- [ ] Leyenda con conteos

#### 6.4 Tabla Comparativa
- [ ] 5 filas: Total de Días, Asignados, Utilización, Presión Promedio, etc.
- [ ] 3 columnas: Cal. A, Cal. B, Cal. C
- [ ] Todos los valores se calculan correctamente

#### 6.5 Distribución por Grupo
- [ ] Tabla de 3 columnas (A, B, C)
- [ ] Muestra contamos por grupo (si aplica)

#### 6.6 Exportación
- [ ] Botón "📥 Exportar Análisis CSV"
- [ ] Genera: `analisis-comparativo-{timestamp}.csv`

**Prueba Funcional:**
1. Verificar que los 3 gráficos se renderizan
2. Click en leyenda del pie chart
3. ✅ Esperado: Puede interactuar (si Recharts lo permite)
4. Click exportar
5. ✅ Esperado: Se descarga CSV con datos

---

## 🔄 Prueba de Integración Completa

### Ciclo Completo: Configurar → Calcular → Comparar

**Escenario de Prueba:**
```
1. Ve a AJUSTES
   └─ Cambia MTE de 2100 a 2400
   └─ Cambia presionLab de 1.0 a 0.8
   └─ Cambia presionAltaLab de 1.0 a 1.3
   └─ Click "Guardar Configuración"

2. Ve a CAL. A
   └─ Espera cálculo (debe recalcular con nuevos valores)
   └─ Verifica "Total Días" = 365
   └─ Verifica "Utilización" cambió

3. Ve a CAL. B & C
   └─ Verifica que también recalcularon

4. Ve a ANÁLISIS
   └─ Verifica tabla comparativa refleja cambios
   └─ Todos los A/B/C tienen datos consistentes

5. Regresa a AJUSTES
   └─ Verifica que los cambios fueron guardados (MTE=2400, presionLab=0.8)
```

**✅ Éxito si:**
- Cambios se guardan y persisten
- Cálculos se actualizan en todos los calendarios
- Gráficos muestran datos correctos
- Exportaciones funcionan en todas las vistas

---

## 🐛 Pruebas de Edge Cases

### A. Cambios Extremos
- [ ] MTE = 100 → Capacidad Cal.C = 1
- [ ] MTE = 5000 → Capacidad Cal.C = 96
- [ ] Presión = 0.1 → Mínimo
- [ ] Presión = 10.0 → Máximo

### B. Festivos en Límites
- [ ] Agregar 31-12 (último día año)
- [ ] Agregar 1-1 (primer día año)
- [ ] Agregar 29-2 (año bisiesto)

### C. Rotación
- [ ] Reordenar todas las 12 unidades
- [ ] Click en semana 52
- [ ] Cambiar velocidad 0.5x (lenta)
- [ ] Cambiar velocidad 2x (rápida)

### D. Exportación
- [ ] Exportar desde Ajustes
- [ ] Exportar desde Calendario A/B/C
- [ ] Exportar desde Rotación
- [ ] Exportar desde Análisis
- [ ] ✅ Esperado: Todos generan archivos válidos

---

## 📊 Validaciones Esperadas

| Validación | Esperado | Resultado |
|-----------|----------|-----------|
| MTE > 0 | Requerido | ✓ |
| Presión 0-10 | Rango | ✓ |
| Total días 365 | Constante | ✓ |
| CSV válido | Formato | ✓ |
| Storage persistencia | Datos + reload | ✓ |
| Cálculo < 5s | Performance | ✓ |

---

## 🚨 Problemas Conocidos & Soluciones

### Problema: "Cannot find module 'react'"
**Solución:** `npm install` (instala todas las dependencias)

### Problema: Calendario no calcula
**Solución:** Verificar que MTE > 0 y fechas válidas en Ajustes

### Problema: Excel DNE no se carga
**Solución:** Verificar que archivo tiene una sola columna con DNEs numéricos

### Problema: Gráficos vacíos en Análisis
**Solución:** Cargar primero algún calendar (hace click en Cal.A/B/C)

---

## ✅ Checklist Final

Si todo lo anterior funciona:
- [ ] Layout responsive (desktop + mobile)
- [ ] 6 pestañas navegables
- [ ] Ajustes guarda/carga
- [ ] 3 calendarios se calculan
- [ ] Rotación anima
- [ ] Análisis compara
- [ ] Exportaciones funcionan

**🎉 ¡APLICACIÓN LISTA PARA PRODUCCIÓN!**

---

## 📝 Notas para Futuras Mejoras

1. **Autenticación**: Agregar auth0 para multi-usuario
2. **Base de Datos**: Conectar Prisma con PostgreSQL
3. **PDF Export**: Implementar jsPDF para reportes
4. **Undo/Redo**: Agregar histórico de cambios
5. **Colaboración**: Socket.io para sincronización real-time
6. **Mobile**: Optimizar para APP (React Native)

---

**Fecha Compilación:** 27 Marzo 2026
**Versión:** 2.0.0
**Autor:** SCMM-MTE Migration Project
