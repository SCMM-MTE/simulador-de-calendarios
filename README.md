# SCMM - Simulador de Calendarios v2.0

Portal de Simuladores de Calendario y Rotación para SCMM-MTE, migrado a **TypeScript + Next.js 14** con **App Router** y **Tailwind CSS**.

## 🚀 Características

### Calendario A - Descanso Dinámico Individual
- Simulación de descansos individuales por día
- Agotamiento dinámico basado en MTE anterior
- Ajustes de agenda mensuales con multiplicadores de prioridad
- Variaciones estacionales (auto-profile con 5 tramos)
- Grupos: A, B, C y subgrupos 1-4
- Bloques de rotación de 13 días

### Calendario B - Secuencias de Descanso Fijo
- Garantiza secuencias matemáticas de descanso
- Patrón: L-M (Lunes-Martes), X (Miércoles), J-V (Jueves-Viernes)
- Distribución equitativa matemática

### Calendario C - Planificación Avanzada
- Planificación basada en restricciones combinadas
- Fusiona características de calendarios A y B

### Simulador de Rotación
- Secuencia de rotación base: [1, 13, 2, 12, 3, 11, 4, 10, 5, 9, 6, 8, 7]
- 12 unidades de rotación: A1-A4, B1-B4, C1-C4
- Visualización interactiva con animación paso a paso
- Exportación a Excel e imágenes HD

### Simulador de Análisis
- Comparación de múltiples escenarios
- Visualización con gráficos donut
- Filtrado por grupo
- Análisis de períodos

### Ajustes
- Configuración completa del simulador
- Importar/Exportar configuraciones (.json/.txt)
- Gestión de MTE global
- Gestión de festivos y vacaciones
- Configuración de PAP y cupos

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript 5.3
- **UI**: React 18 + Tailwind CSS 3.4
- **Estado**: Zustand 4.4
- **Exportación**: XLSX, HTML2Canvas, JSPDF
- **Gráficos**: Recharts 2.12

## 📦 Instalación

### Requisitos
- Node.js 18+ 
- npm 9+ o yarn 4+

### Setup

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📁 Estructura de Carpetas

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout con metadata
│   ├── page.tsx                 # Página principal
│   ├── api/                     # API routes
│   │   ├── config/
│   │   │   ├── route.ts         # Config GET/POST
│   │   │   ├── import/route.ts
│   │   │   └── export/route.ts
│   │   └── calendar/
│   │       └── calculate/route.ts
│   │
├── components/                   # Componentes React
│   ├── SimuladorCalendario.tsx  # Componente principal calendario
│   ├── SimuladorRotacion.tsx    # Visualizador de rotación
│   ├── SimuladorAnalisis.tsx    # Dashboard de análisis
│   ├── Ajustes.tsx              # Panel de configuración
│   └── common/                  # Componentes compartidos
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       └── Panel.tsx
│
├── lib/
│   ├── types/                   # Definiciones de tipos TypeScript
│   │   ├── config.ts
│   │   ├── calendar.ts
│   │   ├── rotation.ts
│   │   └── simulator.ts
│   │
│   ├── constants/               # Constantes de la app
│   │   ├── seasons.ts
│   │   ├── rotations.ts
│   │   └── defaults.ts
│   │
│   ├── utils/                   # Funciones de lógica de negocio
│   │   ├── calendar.ts          # Cálculos de calendario
│   │   ├── rotation.ts          # Lógica de rotación
│   │   ├── easter.ts            # Algoritmo Computus (Easter)
│   │   ├── export.ts            # Exportación Excel/PDF
│   │   ├── validation.ts        # Validación de config
│   │   └── helpers.ts           # Utilidades generales
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useConfig.ts
│   │   ├── useCalendarEngine.ts
│   │   ├── useRotation.ts
│   │   └── useSimulator.ts
│   │
│   └── api-client.ts            # Cliente de API tipado
│
├── store/                       # Zustand stores
│   ├── configStore.ts          # Estado de configuración
│   ├── simulatorStore.ts       # Estado del simulador
│   └── rotationStore.ts        # Estado de rotación
│
├── styles/                      # Estilos globales
│   └── globals.css             # Tailwind + estilos personalizados
│
└── types/
    └── index.d.ts              # Definiciones de tipos globales
```

## 🔄 API Endpoints

### Configuración
- `GET /api/config` - Obtener configuración actual
- `POST /api/config` - Guardar configuración
- `POST /api/config/import` - Importar configuración
- `POST /api/config/export` - Exportar configuración

### Calendario
- `POST /api/calendar/calculate` - Calcular calendario

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Watch mode
npm run test:watch

# Cobertura
npm run test:coverage
```

## 📊 Verificación Post-Migración

### ✅ Funcionalidad
- [ ] Calendario A/B/C renderizan y calculan
- [ ] Simulador de Rotación funciona + playback + export
- [ ] Análisis muestra gráficos
- [ ] Ajustes: save/load/import/export
- [ ] Easter dates (Jueves/Viernes Santo) correctas
- [ ] Exportar a Excel/JSON/TXT/Image/PDF

### ✅ Técnico
- [ ] TypeScript strict mode ✓
- [ ] Sin errores en consola
- [ ] Config persiste en BD
- [ ] localStorage fallback funciona
- [ ] Responsive en mobile
- [ ] No memory leaks

### ✅ Performance
- [ ] Calendario 13 periodos + 52 semanas: <1s
- [ ] Export Excel: <3s
- [ ] Sin memory leaks

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Conectar repositorio a Vercel y deploy automático
vercel
```

### Docker
```bash
docker build -t simulador-calendarios .
docker run -p 3000:3000 simulador-calendarios
```

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo local
npm run build        # Build para producción
npm start            # Ejecutar servidor producción
npm run lint         # Linting con ESLint
npm run type-check   # Verificar tipos TypeScript
npm run test         # Ejecutar tests
npm run test:watch   # Tests en watch mode
```

## 🐛 Troubleshooting

### Puerto 3000 ya en uso
```bash
npm run dev -- -p 3001
```

### Errores de TypeScript
```bash
npm run type-check   # Ver todos los errores
```

### Limpiar cache
```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📚 Documentación

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand Docs](https://zustand-demo.vercel.app/)

## 📄 Licencia

Uso internal - SCMM-MTE

## ✨ Versión

- **Versión actual**: 2.0.0
- **Versión anterior**: 1.0.0 (HTML + React CDN)
- **Fecha de migración**: Marzo 2026
