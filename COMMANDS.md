# 🚀 SCMM Simulador - Comandos Rápidos

## Instalación Inicial (Primera vez)

```bash
# 1. Navega al proyecto
cd simulador-de-calendarios

# 2. Instala dependencias
npm install

# 3. Inicia servidor de desarrollo
npm run dev
```

**Resultado:** Se abre automáticamente http://localhost:3000

---

## Comandos Diarios

### Desarrollo
```bash
npm run dev          # Inicia servidor (hot reload)
```

### Build
```bash
npm run build        # Compila para producción
npm start           # Ejecuta build de producción
npm run lint        # Valida código ESLint
```

---

## Estructura de Proyecto

```
src/
├── app/
│   ├── layout.tsx              # Layout raíz
│   ├── page.tsx                # Home con tabs
│   └── api/
│       ├── config/             # Endpoints de configuración
│       └── calendar/           # Endpoints de cálculo
├── components/
│   ├── common/                 # Button, Card, Modal, Panel
│   └── features/               # Ajustes, SimuladorCalendario, etc
├── lib/
│   ├── types/                  # TypeScript interfaces
│   ├── constants/              # Datos estáticos
│   ├── utils/                  # Funciones de lógica
│   └── api-client.ts           # Cliente HTTP
└── store/                      # Zustand stores
```

---

## Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `src/store/configStore.ts` | Estado de configuración |
| `src/store/simulatorStore.ts` | Estado de simulaciones |
| `src/store/rotationStore.ts` | Estado de rotaciones |
| `src/lib/utils/calendar.ts` | Lógica de calendarios |
| `src/lib/utils/rotation.ts` | Lógica de rotaciones |
| `src/app/api/calendar/calculate/route.ts` | API cálculo |

---

## Debugging

### Ver logs en servidor
```bash
npm run dev              # Muestra logs en terminal
```

### Ver errores TypeScript
```bash
npx tsc --noEmit       # Valida tipos sin compilar
```

### Limpiar caché
```bash
rm -rf .next           # Elimina build caché
npm run dev            # Reconstruye
```

---

## Dependencias Principales

```json
{
  "next": "14.1.4",
  "react": "18.3.1",
  "typescript": "5.3.3",
  "zustand": "4.4.2",
  "recharts": "2.12.4",
  "xlsx": "0.18.5",
  "tailwindcss": "3.4.1"
}
```

---

## URLs Útiles

- **Local Dev:** http://localhost:3000
- **API Config:** http://localhost:3000/api/config
- **API Calculate:** http://localhost:3000/api/calendar/calculate
- **API Import:** http://localhost:3000/api/config/import
- **API Export:** http://localhost:3000/api/config/export

---

## Troubleshooting Quick Fixes

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Error: "Port 3000 already in use"
```bash
npm run dev -- -p 3001    # Usa puerto 3001
```

### Error: "JSX element implicitly has type 'any'"
```bash
# Asegúrate de que layout.tsx tiene:
import React from 'react';
```

---

## Performance Tips

1. **Caché de Cálculos:** Los calendarios se cachean en `useSimulatorStore`
2. **Lazy Loading:** Las pestañas se renderizan solo cuando activas
3. **CSV Export:** Los archivos se generan en el navegador (sin servidor)
4. **Storage:** Configuración se guarda automáticamente en localStorage

---

## Próximas Features

- [ ] PDF export con jsPDF
- [ ] Imagen snapshot con html2canvas
- [ ] Base de datos con Prisma
- [ ] Autenticación con NextAuth
- [ ] Sync en tiempo real con Socket.io

---

**¡Listo para empezar!** 🚀
