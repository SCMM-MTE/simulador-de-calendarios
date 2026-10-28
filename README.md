# Mi calendario · SCMM

Nueva versión personal del simulador MTE, preparada el 28/10/2026.
La entrada pública estática es `index.html`, que utiliza los módulos de `personal/`.
No requiere compilación ni bibliotecas descargadas desde CDN.

## Probar

```sh
python -m http.server 4187 --bind 127.0.0.1
```

Abre http://127.0.0.1:4187/ y pulsa **Ver ejemplo ficticio**. No se carga ninguna
plantilla de maquinistas automáticamente. Los datos del ejemplo son inventados.

```sh
npm run test:personal
```

## Implementado

- Entrada por DNE y sorteo de cinco cifras; número aleatorio sin sesgo.
- Llenado de bloques y rotación conforme al acta CSD de 13/05/2026.
- Ficha personal: escalafón, orden del sorteo, grupo de descanso fijo, asignación
  de regularización, preferencia anual, vacaciones y PFA.
- Vacaciones/PFA preasignados, modificables dentro del escenario y restaurables.
- Calendario por mes o año; elección reversible de descansos/trabajos, diferenciando
  planificación del año y compensación del anterior.
- Análisis de trabajo previsto, objetivo, saldo generado y compensaciones anteriores.
- Navegación 2027–2100; proyección consecutiva solo con datos anuales suficientes.
- Exportación y recuperación de escenarios por DNE y versión de datos.
- Diseño adaptable a móvil, temas claro/oscuro/sistema y controles accesibles.
- Importación privada JSON/CSV en memoria; no se guardan plantillas en localStorage
  ni se envían a un servidor. El único ajuste persistente es el tema visual.

## Pendiente antes de utilizar datos reales

El nuevo escalafón, las vacaciones/PFA y el grupo de descanso de cada DNE serán
aportados por el usuario. Los calendarios oficiales de 2027 ya facilitados aún
necesitan vincularse a este formato; no se sustituyen por los del Convenio ni por
una proyección de 2026. Cada nuevo año requiere su calendario y su plan/objetivo.

El mecanismo definitivo de acceso está pendiente de concretar: cuentas de Consulta
Convenio o herramienta privada local. **Introducir un DNE no es autenticarlo.**
Esta versión no sirve perfiles privados desde una API ni publica una plantilla real.
El grupo es inmutable dentro de la simulación; el archivo local no sustituye una
fuente oficial protegida en servidor. El aspecto final se ajustará a las capturas
del portal PAP cuando se aporten.

Los resultados son escenarios, no adjudicaciones, disponibilidad de cupos ni
solicitudes presentadas a Metro. No se incluyen automáticamente incidencias
laborales, prorrateos, exclusiones, IT prolongada ni decisiones de Nombramiento.

[Formato de datos y reglas](personal/README.md) ·
[Auditoría de la versión anterior](docs/audits/2026-10-28-auditoria-integral.md) ·
[Documentación histórica de Next.js](docs/legacy-next.md)

La migración Next.js conservada en `src/` no es la aplicación estática actual;
sus errores de compilación documentados en la auditoría siguen pendientes.
