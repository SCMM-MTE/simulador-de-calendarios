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
- Periodos 2027 del PDF: 16 combinaciones ordinarias, casos individuales de
  matrimonio y descanso R.M. separado. Invierno de 28 días: 7 vacaciones + 21 PFA.
- Consulta de periodos sin escalafón, sin adjudicar puestos ni descansos ficticios.
- Calendario por mes o año; elección reversible de descansos/trabajos, diferenciando
  planificación del año y compensación del anterior.
- Análisis de trabajo previsto, objetivo, saldo generado y compensaciones anteriores.
- Navegación 2027–2100; proyección consecutiva solo con datos anuales suficientes.
- Cómputo: saldo inicial de 2026, crédito/débito, siete días del año y neteo.
- Reglas contrastadas con las diapositivas: saldo anterior de lunes a domingo;
  siete del año de lunes a viernes aunque sean festivos, siempre sujeto a cupo.
- Proyección interanual sin duplicar compensaciones ni volver a generar adelantos.
- Estimación manual por jornadas cuando falta el calendario personal.
- Desglose por fecha de trabajo/descanso/vacaciones/PFA/R.M.
- Exportación y recuperación de escenarios por DNE y versión de datos.
- Diseño adaptable a móvil, temas claro/oscuro/sistema y controles accesibles.
- Importación privada JSON/CSV en memoria; no se guardan plantillas en localStorage
  ni se envían a un servidor. El único ajuste persistente es el tema visual.

## Datos de 2027 y límites de la prueba

La extracción original contiene 2.084 DNE; la base activa contiene **2.083** tras
la exclusión indicada. La portada carga las asociaciones por DNE de grupo,
escalafón, vacaciones, PFA y R.M., sin nombres ni DNI. De los grupos, 2.046 están
preasignados por el cuadro y 37 permiten elección manual. Los ocho calendarios
diurnos/nocturnos se vinculan al libro de 2027. SDF conserva su asignación pero
queda pendiente de un calendario específico; no se inventan festivos para él.
Cada nuevo año requiere su calendario y su plan/objetivo.

**Introducir un DNE no es autenticarlo.** Esta prueba online incorpora las
asociaciones solicitadas, accesibles desde la web; no ofrece acceso privado ni
un panel autenticado. Los originales y los archivos de preparación se mantienen
fuera del repositorio. El grupo documental se conserva fijo; cuando falta se
puede declarar uno para el escenario. Las importaciones adicionales se leen en
el navegador. El diseño final se ajustará a las capturas del portal PAP.

Los resultados son escenarios, no adjudicaciones, disponibilidad de cupos ni
solicitudes presentadas a Metro. No se incluyen automáticamente incidencias
laborales, prorrateos, exclusiones, IT prolongada ni decisiones de Nombramiento.

[Formato de datos y reglas](personal/README.md) ·
[Auditoría de la versión anterior](docs/audits/2026-10-28-auditoria-integral.md) ·
[Documentación histórica de Next.js](docs/legacy-next.md)

La migración Next.js conservada en `src/` no es la aplicación estática actual;
sus errores de compilación documentados en la auditoría siguen pendientes.

## Prueba online

La preview se despliega separada de producción en Cloudflare Pages. El paquete
se prepara con `python tools/build_personal_preview.py /ruta/externa/vacia`: solo
código público y ejemplo ficticio. No subas allí el archivo de perfiles reales.

[Reglas y límites del nuevo cómputo](docs/2026-10-28-prueba-online-computo.md).

La portada de la prueba incorpora la preasignación de grupo, vacaciones y PFA por
DNE para 2027, con selección manual cuando falta la referencia. Véase
[la integración de grupos y periodos](docs/2026-10-28-preasignacion-grupos-periodos.md).
