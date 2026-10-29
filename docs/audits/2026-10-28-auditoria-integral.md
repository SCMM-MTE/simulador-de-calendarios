# Auditoría integral del Simulador de Calendarios

Fecha: 28/10/2026 · SCMM-MTE/simulador-de-calendarios.

**Resultado:** la versión HTML publicada funciona, pero tiene errores reproducidos
en fechas, cupos y validación de datos. La migración Next.js está incompleta y no
compila. Antes del rediseño hay que fijar una única referencia de datos y un motor
comprobable; cambiar solo la presentación conservaría esos errores.

No se han corregido cálculos, cambiado datos ni publicado una aplicación nueva.
Los únicos entregables añadidos son este informe y su resumen de evidencias.

## 1. Qué se ha auditado realmente

| Referencia | Estado comprobado |
| --- | --- |
| GitHub `main` | `ed1261a5c181b3a83f32b1393a54d4bb708f6865` |
| Trabajo local conservado | `bbbc50033c4d7af3ee0950d369f95d34f5da40ae`, rama `codex/logo-scmm-20261019` |
| Diferencia local | Un commit de identidad/logo, cinco archivos; no integrado en `main` |
| Web operativa | <https://scmm-mte.github.io/simulador-de-calendarios/>: HTTP 200, HTML idéntico byte a byte al `index.html` de `main` |
| Vercel principal | <https://simulador-de-calendarios.vercel.app/>: HTTP 404 |
| Proyectos Vercel | Cuatro proyectos con ese repositorio, todos con último destino de producción en ERROR para `ed1261a` |
| Implementación HTML | Un fichero de unas 4.069 líneas; React/CDN/Babel/Tailwind en el navegador |
| Implementación Next.js | `src/`, TypeScript, Zustand y rutas API; sus cálculos son distintos de los del HTML |

Se conservó una copia privada de recuperación de los commits local y remoto.
No se presupuso que el cambio de logo ya estuviera publicado.

### Método y límites

- Inventario de archivos, configuración, dependencias, documentación y origen de datos.
- Lectura de ambos motores, estados, importaciones, exportaciones y rutas API.
- `type-check`, lint, build aislado y búsqueda de tests del proyecto.
- Pruebas directas de las funciones y rutas Next.js, transpiladas en un entorno
  privado para poder aislar su comportamiento pese a los errores de tipos.
  Eso **no** acredita una compilación ni un despliegue funcional de Next.js.
- Pruebas del motor HTML, conservación de cupos, asignaciones, calendario civil,
  cambio de año, horario de verano y límites de entrada.
- Navegación y flujos en Chromium, zona Europe/Madrid, con anchos 320, 375, 768 y
  1.440 px; axe-core 4.10.3 para WCAG A/AA y revisión visual de capturas.
- Las pruebas de interfaz usaron una copia exacta del HTML público y las cinco
  bibliotecas CDN descargadas por HTTPS. Solo el Excel de DNE se sustituyó por
  una plantilla sintética de 1.948 identificadores para no incorporar datos reales
  a capturas ni trazas. Las fuentes tipográficas externas no se descargaron.
- No se inspeccionaron contenidos de Cookies, Login Data, History ni otros
  almacenes del perfil de navegador. Su presencia pública sí se comprobó.
- No se certifica aquí la adecuación legal completa de cada supuesto. Los
  calendarios oficiales de 2027 ya aportados por el usuario no están vinculados
  a este motor; no deben sustituirse por calendarios ilustrativos del Convenio.

## 2. Prioridades

P0: exposición que hay que resolver primero. P1: resultado incorrecto o bloqueo
funcional. P2: fiabilidad, uso y mantenimiento. P3: limpieza o mejora menor.
Las prioridades distinguen la web activa de los defectos de la migración todavía
no desplegada correctamente.

| ID | Prioridad | Área | Hallazgo y evidencia | Acción recomendada |
| --- | --- | --- | --- | --- |
| S01 | P0 | Publicación/datos | Repositorio público con 276 archivos de `.edge-headless/`, incluidos Cookies, Login Data, Web Data, History y Preferences | Revisar la exposición con el responsable; excluir perfiles, comprobar credenciales afectadas y planificar retirada del historial. Borrar solo en un commit no elimina el historial. No se han abierto esos almacenes ni confirmado que contengan secretos utilizables |
| S02 | P0 | DNE | `mtes.xlsx` se descarga sin autenticación desde Pages y está en el repositorio público: 1.948 identificadores | Definir acceso autorizado y separar datos personales del código y de los recursos públicos |
| D01 | P1 | PFA/fechas | Un PFA de 28 días puede contar 27 en Madrid al desplazarlo usando milisegundos | Usar fechas civiles y suma de días; cubrir cambios de hora con pruebas |
| D02 | P1 | PAP | El 31/12 se trata como cualquier día de invierno: devuelve 87 en 2027 y 66 si cae en domingo | Incorporar la excepción de 55/37 confirmada por el usuario, con fuente y vigencia |
| D03 | P1 | Análisis A | El análisis supone siete libranzas en los primeros días laborables del año, aunque enero tiene cupo A cero | Reutilizar las restricciones del motor o etiquetar y separar una comparación puramente teórica |
| D04 | P1 | Excel HTML | La importación admite encabezados, duplicados e identificadores no numéricos como personas | Validar tipo, formato, unicidad, filas excluidas y tamaño antes de cambiar plantilla y sorteo |
| D05 | P1 | Excel Next.js | El importador acepta solo celdas de texto: rechaza los 1.948 DNE numéricos del propio Excel incluido | Admitir números enteros y texto normalizado, conservando la representación de los identificadores |
| T01 | P1 | Migración | 99 errores TypeScript y build bloqueado | Reparar contratos y tipos; conservar el control de compilación |
| T02 | P1 | API/UI Next.js | Cliente devuelve el resultado directo; componente espera `success/data`; UI lee `entries` y API devuelve `days` | Un contrato único, validado y probado de extremo a extremo |
| T03 | P1 | Motor Next.js | A, B y C producen exactamente los mismos días y asignaciones; todas las cuotas de día son cero | Implementar motores diferenciados y las restricciones reales antes de ofrecer esos tres calendarios |
| T04 | P1 | Rotación Next.js | UI llama acciones inexistentes y usa firmas incompatibles de las funciones de descanso | Unificar store, funciones y componentes; prueba completa de reproducción y métricas |
| T05 | P1 | Guardado Next.js | POST responde 201, pero el GET posterior sigue devolviendo 2.100 después de guardar 2.222 | Persistencia real o modo local explícito; no mostrar un guardado remoto que no existe |
| D06 | P1 | Cuotas Next.js | `getDayQuota` suma laboral + fin de semana + festivo: febrero devuelve 30 en cualquiera de esos días | Seleccionar la categoría correcta; utilizarla realmente en la API |
| D07 | P1 | Rotación/horario Next.js | En el día 13 tras 22/03/2027 devuelve A1 en vez de B1 por el cambio de hora | Diferencias entre fechas civiles, no división de milisegundos |
| D08 | P1 | Métricas Next.js | `getRotationStats(...,365)` atribuye 39 días a cada una de 12 unidades: suma 468 | Medir lo asignado realmente dentro del intervalo |
| D09 | P1 | MTE Next.js | Para 1.948 MTE, el reparto por tres grupos suma 1.947 | Distribución entera que conserve el total |
| T06 | P1 | Validación API | Acepta `globalMTE: 'hola'`, presión NaN y un tipo de calendario inventado; permite 4.019 días sin aplicar el límite anunciado | Esquema estricto, finitud, enteros, enumeraciones y límites de rango y carga |
| T07 | P2 | TXT Next.js | Exportación TXT HTTP 200; importar ese contenido devuelve 400 | Un formato de intercambio que permita ida y vuelta |
| D10 | P2 | Parámetros Next.js | Cambiar presiones base a 9 no altera los cálculos normales; un cero de verano se sustituye por 1,5 | Aplicar configuración y distinguir cero de ausencia de valor |
| D11 | P2 | Festivos | Conjuntos fijos distintos entre versiones y sin calendario oficial versionado | Cargar festivos estatales, autonómicos y locales por año y procedencia |
| D12 | P2 | Datos de escenarios | Vacaciones, PFA, RM, objetivos y cupos están incrustados y carecen de referencia documental/año | Registro de fuente, vigencia, ámbito y estado de validación de cada dato |
| D13 | P2 | Tamaño de bloque | El parámetro manual cambia el desglose mostrado, pero no se pasa al generador de asignaciones por sorteo | Definir si es informativo o una restricción efectiva; alinear ambos comportamientos |
| T08 | P2 | Importación Next.js | El límite es 500 DNE, inferior a los 1.948 del fichero del proyecto | Ajustar límites al dominio y validar el volumen real previsto |
| T09 | P2 | Caché Next.js | Los resultados de escenarios no están ligados a una huella de configuración; análisis puede combinar cálculos de configuraciones distintas | Invalidación o versionado de resultados y peticiones |
| U01 | P2 | Móvil | Calendario A ocupa 388 px de ancho en dispositivos de 320/375 px | Eliminar anchuras mínimas que desbordan y revisar los controles juntos |
| U02 | P2 | Accesibilidad | Selectores y entradas sin nombre, botones de icono sin etiqueta y áreas desplazables no enfocables | Etiquetas asociadas, semántica y navegación con teclado |
| U03 | P2 | Densidad | Rotación genera el listado completo y miles de controles muy pequeños; Ajustes tiene controles menores de 24 px | Paginación/virtualización, resumen progresivo y objetivos táctiles adecuados |
| U04 | P2 | Navegación | El calendario queda detrás de un panel largo en móvil; no hay dirección propia para cada vista ni conservación completa del escenario | Jerarquía móvil, rutas/estado restaurable y filtros plegables |
| E01 | P2 | Excel | El `.xls` descargado es HTML, no un libro Excel nativo | Exportar XLSX real y mantener una hoja de datos reutilizable |
| S03 | P2 | Dependencias | 64 avisos únicos en el árbol instalado: 5 críticos, 23 altos, 28 moderados y 8 bajos | Actualizar y volver a evaluar aplicabilidad por versión, ruta y plataforma |
| T10 | P2 | Despliegue | Cuatro proyectos Vercel fallidos y documentación que los presenta como recomendación operativa | Un único destino documentado, build reproducible y despliegue de prueba |
| T11 | P2 | Control de calidad | Jest no encuentra tests; no hay lockfile; documentación y código divergen | Tests de negocio y contrato, lockfile y CI con controles reales |
| U05 | P3 | Identidad/texto | Logo nuevo solo local; faltan modos de apariencia y hay textos `Â·` en algunas etiquetas | Integrar el logo conservado, resolver codificación y aplicar identidad SCMM coherente |
| D14 | P3 | Aproximaciones | Pesos PFA suman 0,99996; no se identifica esa aproximación en los conteos MTE | Normalizar o documentar el redondeo sin convertir cohortes fraccionarias en personas exactas |

## 3. Reproducciones que afectan a resultados

### D01. PFA y cambio de hora

Referencia: `index.html:649` y la implementación duplicada de
`getAdjustedPfaRange` dentro de `SimuladorEngine`.

El final del PFA se calcula como inicio ajustado + duración en milisegundos.
Mover el inicio sobre el cambio de horario modifica la cantidad de medianoches
comprendidas en ese intervalo.

- Caso: año 2028, PFA 26 de marzo–22 de abril, grupos G1 y G4.
- Duración civil esperada: 28 días.
- Duración que contiene el intervalo calculado: 27 días.
- Barrido 2024–2040: 16 combinaciones de escenario afectadas, equivalentes a
  ocho casos distintos de año/PFA/grupo, porque el mismo PFA está en dos filas.
- El mismo barrido en UTC no encuentra el defecto. Probar solo en UTC lo oculta.
- Hay otro error equivalente en la rotación Next.js, probado con 22/03/2027 →
  04/04/2027: sigue en A1 cuando ya debe pasar a la siguiente unidad de la secuencia.

### D02. Excepción PAP del 31 de diciembre

Referencia: `index.html`, `CUPOS_PAP` y `getCupoPAP`.

La selección solo depende de temporada y día de la semana. No hay excepción para
el 31 de diciembre. Con los valores publicados:

| Caso de prueba | Devuelve el simulador | Criterio documental confirmado por el usuario |
| --- | ---: | ---: |
| 31/12/2027, viernes | 87 | 55 |
| 31/12/2028, domingo | 66 | 37 |

La referencia de negocio es la aclaración del usuario del 25/10/2026, registrada
en `consulta-convenio/docs/integrations/2026-10-25-revision-legado-vigencias-y-cupos.md`
y `2026-10-25-apertura-tablas-actualizadas-y-PAP.md`: actualmente no se revisan
esos cupos. No convierte todos los demás cupos en cifras inmutables ni acredita
por sí sola su mantenimiento indefinido durante los quince años de proyección.

### D03. El análisis no reproduce una elección factible del calendario A

Referencias: `index.html:781`, `index.html:3431` y bloqueo de cupos de enero.

El análisis usa `buildCCRFixedDaysSet(...,7)` para escoger los primeros siete días
laborables posibles. En un escenario de 2027 elige 1, 4, 5, 6, 7, 8 y 11 de enero.
Todos tienen cupo A cero en la configuración de referencia. El análisis puede
abrir el escenario en el calendario, pero no traslada una selección de siete
libranzas: el calendario se abre con la selección vacía.

Esto no se corrige cambiando gráficos: hay que decidir si el análisis compara
una hipótesis teórica o elecciones sujetas a los mismos cupos y presión. La
interfaz debe explicar esa diferencia mientras exista.

### D04/D05. Importación de Excel

El fichero del proyecto contiene una sola columna, 1.948 celdas numéricas y
1.948 DNE distintos. No se encontraron duplicados ni filas no numéricas en ese
fichero. Eso valida su estructura, no la vigencia o integridad de la plantilla.

- HTML: un Excel sintético con encabezado, duplicado y texto arbitrario acepta
  las cuatro filas y puede alterar el número de personas y su orden de sorteo.
- Next.js: aplica `typeof row[0] === 'string'` y acepta cero filas del Excel
  numérico real del propio proyecto.
- Aun corrigiendo eso, su límite de 500 DNE impide usar la plantilla completa.

### T02/T03/T05. API de la migración

Referencias: `src/lib/api-client.ts`,
`src/components/features/SimuladorCalendario.tsx`,
`src/app/api/calendar/calculate/route.ts`, `src/app/api/config/route.ts`.

Pruebas locales con una configuración válida y 01/01/2027–31/12/2027:

- A, B y C: los mismos 365 días, las mismas 101 asignaciones y cero cuotas de
  día distintas de cero. El parámetro de tipo solo cambia la etiqueta.
- El cliente ya extrae `result.data.data`; el componente vuelve a buscar
  `success/data` y no almacena ese resultado.
- El contrato publicado usa `days`, pero calendario y análisis leen `entries`.
  También falta `averagePressure`; análisis referencia `comparisonTableRows`
  sin declararlo.
- Guardar 2.222 MTE responde HTTP 201; consultar después sigue devolviendo 2.100.
  La ruta contiene explícitamente el comentario de persistencia futura.
- El navegador usa por defecto `http://localhost:3000` como destino API, que no
  es una configuración de producción válida para los usuarios remotos.

### Otros casos de cálculo y validación

- Febrero Next.js: cuota 30 tanto en laborable como sábado y domingo, por sumar
  las tres categorías 22+6+2. La API ni siquiera aplica esa función a cada día.
- Presión normal: cambiar `presionLab`, `presionSD` y `presionFes` a 9 deja los
  resultados iguales en las fechas probadas. Usa constantes en vez de esos campos.
- Next.js fija el año inicial al año actual del dispositivo y no ofrece el
  selector anual equivalente al HTML; no garantiza iniciar en 2027.
- Un cero configurado se interpreta como ausencia por el operador `||`.
- Rotación: 12 × 39 = 468 días informados para un periodo de 365.
- Equidad con todos los valores de descanso cero devuelve NaN.
- API acepta un tipo `inventado`, presión NaN y una configuración mínima con
  MTE no numérico. El intervalo 2027–2038 devuelve HTTP 200 y 4.019 días.
- TXT generado por la propia API: exportación 200, reimportación 400.
- Objetivos anuales del HTML suman 365 y no llevan versión por año; cualquier
  uso en bisiestos y en anualidades futuras exige un criterio explícito.
- Un festivo que cae en fin de semana toma el cupo S/D en el HTML, aunque otras
  partes lo agregan como festivo. La prioridad de esas categorías debe fijarse
  con el criterio de negocio; no se afirma aquí cuál corresponde legalmente.

## 4. Qué sí funciona y se debe conservar

| Comprobación | Resultado |
| --- | --- |
| Inicio y navegación HTML | Las cinco vistas revisadas abren sin errores JavaScript |
| Motor de cupos A | 78 escenarios de año/bloque/subbloque conservan total = consumido + restante, sin negativos, y cuadran los agregados mensuales |
| Asignación de rotación | Para 1, 12, 13, 155, 156, 157, 1.948 y 2.100 personas genera exactamente esa cantidad de huecos sin duplicar huecos |
| Distribución predeterminada por bloques | Para 1.948 personas: bloques de 149/150; para 2.100: 161/162. Conserva el total y diferencia máxima de uno |
| Plantilla original | 1.948 DNE numéricos distintos; una hoja y una columna |
| Ajustes HTML | Exporta JSON válido en `.txt`, con 110 claves; importación, guardado local y recarga conservaron el valor sintético de prueba |
| PNG de rotación | Archivo con firma PNG válida, 421.684 bytes en el caso ensayado |
| Excel de rotación | Se descarga y contiene la secuencia; su limitación es el formato HTML con extensión `.xls` |
| Análisis → calendario | La navegación al escenario y activación de vacaciones funcionaron |
| Arranque CDN actual | React 18.3.1 y Babel 8.0.9 cargaron la aplicación; no se observó un fallo de arranque por esas versiones en la prueba |

Estas comprobaciones no equivalen a certificar todos los resultados normativos,
la equidad de cualquier orden configurable ni la ausencia de fallos en todos
los escenarios posibles.

## 5. Datos: inventario y nivel de confianza

| Dato | Origen actual | Evaluación |
| --- | --- | --- |
| DNE/plantilla | `mtes.xlsx`, descarga automática al entrar y ficheros manuales | Estructura correcta del original; exposición pública e importadores inconsistentes. Sin fecha de vigencia ni procedencia verificable en el libro |
| Descansos base | Ancla 04/01/2021 y secuencia de cuatro semanas en el HTML | Algoritmo definido; falta enlazar su validez anual con la referencia oficial |
| Vacaciones/PFA | Siete filas `VACATION_DATA`, con opciones y pesos incrustados | No hay versión documental anual; no sustituye a los calendarios oficiales de 2027 aportados |
| RM | Tabla `RM_DATE_BY_SCENARIO` y desplazamiento al día previo no descansado | Regla reproducible; procedencia y cambios anuales no registrados |
| Cupos A y PAP | Constantes y configuración local | Valores distintos de los defaults Next.js; excepción de 31/12 ausente |
| Presiones | Porcentajes y multiplicadores manuales | Parámetros de simulación; no se identifican como estimaciones ni se calibran con resultados observados |
| Pesos de cohortes | Suma de pesos verano 1; PFA 0,99996 | Para 2.100 personas la suma continua equivale a 2.099,916; debe explicarse el redondeo |
| Objetivos de trabajo/vacaciones/descanso | 201/37/127 o 202/36/127 | Constantes de 365 días, sin catálogo por año y fuente |
| Número ONCE/sorteo | Entrada 00000–99999 y fórmula determinista con longitud de lista | Debe conservarse junto con huella y orden exacto de la plantilla para reproducir el reparto |

Los datos normativos, los ajustes operativos del usuario y los parámetros
estadísticos deben tener procedencias diferenciadas. La presión y los pesos de
simulación no deben presentarse como prueba de disponibilidad o derecho real.

## 6. Funcionalidades: alcance real

| Función | HTML publicado | Next.js |
| --- | --- | --- |
| Calendario A interactivo | Disponible; con los defectos de fechas y datos descritos | Bloqueado por compilación y contratos |
| Calendarios B/C | Hay código interno, sin acceso normal desde la portada actual | Pestañas anunciadas; API sin diferenciación real |
| Vacaciones/PFA/RM | Escenarios y ajuste de fechas presentes | La API devuelve vacaciones vacías y no conecta un calendario oficial |
| Presión/cupos A | Motor dinámico y configuración presentes | Implementación simplificada e inputs ignorados |
| Selección PAP | Visible en A al activar su vista; una sola bolsa configurada | Configuración parcial; no motor equivalente completo |
| Rotación/sorteo | Orden configurable, búsqueda DNE y proyección | Firmas y acciones incompatibles; métricas incorrectas |
| Análisis | Crédito/débito del A y apertura de escenarios | Contratos distintos y variable de tabla inexistente |
| Configuración | Guardado local explícito; TXT/JSON de ida y vuelta comprobado | Estado local, API de guardado ficticio e incompatibilidad TXT |
| Excel/imagen | Secuencia `.xls`-HTML y PNG comprobados | Importador Excel defectuoso; PDF/PNG anunciados sin flujo equivalente completo |
| Respaldo reproducible | Configuración exportable | No hay instantánea única de datos, reglas, escenario y motor |
| Uso compartido | Configuración en el navegador | No hay persistencia de servidor implementada ni separación de configuraciones por usuario en esa API |

## 7. Diseño, accesibilidad y móvil

La estructura visual existente permite reutilizar los módulos y la distinción de
colores, pero prioriza paneles densos y controles pequeños. En móvil, el usuario
ve primero un panel largo de configuración y debe desplazarse para llegar al
calendario. El cambio de vista no conserva íntegramente la selección de días.

Resultados automáticos de las vistas con estilos cargados:

| Vista | Hallazgos axe-core | Observación de uso |
| --- | --- | --- |
| Inicio | Sin infracciones detectadas en el alcance automatizado | No acredita por sí solo accesibilidad completa |
| Calendario A | 6 selectores sin nombre; 2 zonas desplazables no enfocables | Ancho de documento 388 px a 320/375 px |
| Rotación | 1 botón sin nombre, 1 input sin etiqueta, 8 selectores sin nombre y 1 caso de contraste | En el caso de 1.948 DNE, 2.008 controles visibles menores de 24 px en al menos una dimensión; hace falta reducir densidad y virtualizar/paginar |
| Análisis | 1 botón sin nombre y 2 selectores sin nombre | El detalle muy ancho requiere desplazamiento; conservar un resumen legible |
| Ajustes | 1 botón sin nombre, 89 entradas sin etiqueta, 4 selectores sin nombre y 5 casos de contraste | 42 controles menores de 24 px a 375 px; 55 a 320 px |

Los conteos corresponden a cada vista, no a personas ni a errores funcionales
independientes. La gravedad que axe llama «critical» es de accesibilidad, no una
clasificación de vulnerabilidad de seguridad. La medición de tamaño menor de
24 px es una revisión geométrica orientativa; no es una certificación WCAG 2.2.

Para el rediseño: calendario como área principal; filtros en panel plegable en
móvil; resumen breve; contraste y tamaños legibles; focos visibles; etiquetas
asociadas; modales con rol, foco contenido y retorno al control de apertura;
ordenación y navegación con teclado. Mantener la identidad SCMM aprobada y los
colores semánticos. La versión publicada aún no incorpora el commit local del
logo. No hay selector Sistema/Claro/Oscuro completo en las vistas auditadas.

## 8. Programación, dependencias y explotación

- `npm run type-check`: **99 errores**. Incluye variables/importaciones sin uso;
  no son 99 defectos funcionales independientes.
- `npm run build`: falla en el importador Excel de Ajustes; no se obtiene un
  build de producción válido. No conviene ocultarlo desactivando comprobaciones.
- `npm run lint`: sin avisos. El lint no detecta los contratos de dominio rotos.
  Next generó cambios auxiliares de configuración durante esa prueba; se
  restauró el original y el build se ejecutó después en copia privada.
- `npm test -- --runInBand`: no encuentra tests y sale con código 1.
- No hay lockfile versionado, pruebas automáticas de negocio ni una CI de
  aceptación que garantice el motor y el flujo de despliegue.
- Hay tres HTML de implementación/depuración y código duplicado. No deben
  seguir evolucionando como motores independientes con reglas divergentes.
- El HTML depende de Babel y Tailwind en tiempo de ejecución. Las cinco
  bibliotecas descargadas sumaron 3.776.662 bytes sin comprimir, aparte de los
  681.196 bytes del HTML publicado. No es una medición de transferencia gzip.
- React usa versión mayor en CDN; Babel, SheetJS y Tailwind tampoco están
  fijados a una versión inmutable en sus URLs. Es un riesgo de reproducibilidad,
  aunque el arranque actual sí funcionó.
- Árbol instalado observado: Next 14.2.35, React 18.3.1, Zustand 4.5.7,
  TypeScript 5.9.3, SheetJS 0.18.5, jsPDF 2.5.2. Difiere de las versiones
  presentadas en algunas secciones de la documentación.
- La consulta al registro de avisos npm detectó 64 avisos únicos en siete
  paquetes. Los cinco críticos afectan a Next/jsPDF bajo condiciones concretas.
  **No son cinco explotaciones demostradas en la web pública:** Next no está
  desplegado correctamente y el HTML no carga jsPDF. SheetJS 0.18.5 sí se usa
  para leer ficheros en el navegador y tiene avisos altos de prototype pollution
  y ReDoS: GHSA-4r6h-8v6p-xvw6 y GHSA-5pgg-2g8v-p4x9.
- La documentación menciona hooks, Docker, ejemplo de entorno y cobertura que
  no están entregados o conectados como se describe. Usa expansiones incorrectas
  de «PAP» en tipos/documentación; hay que alinear la terminología de MTE.
- El manejo de errores es inconsistente: silencios al importar la plantilla,
  errores que solo aparecen en consola, y estados «guardado» sin persistencia.

## 9. Plan recomendado para el siguiente trabajo

### Primero: protección y trazabilidad

1. Decidir el acceso al Excel DNE y retirar perfiles de navegador del material
   publicable. Revisar posibles secretos sin divulgarlos. Planificar por separado
   la limpieza de historial y cualquier rotación que resulte necesaria.
2. Conservar la versión HTML operativa y el commit local del logo; identificar
   un solo repositorio/rama de integración y un único despliegue de pruebas.
3. Registrar fuentes oficiales de 2027, su versión y alcance; reutilizar los
   calendarios ya aportados. Separar cupos confirmados de parámetros estimados.

### Después: un único motor verificable

4. Corregir fechas civiles, excepción PAP del 31/12 e importadores antes de tocar
   métricas y gráficos. Resolver la discrepancia entre análisis y cupos de A.
5. Definir contratos únicos para escenario, resultado, fecha, cuota, regla y
   configuración. Evitar que A/B/C sean solo etiquetas del mismo cálculo.
6. Hacer compilar la arquitectura elegida, vincular resultados a su configuración
   y resolver guardado, importación/exportación y errores observables.
7. Fijar dependencias, probar actualizaciones y establecer CI y reversión.

### Rediseño y funciones adicionales

8. Rediseñar sobre esos contratos: calendario central, panel lateral adaptable,
   filtros plegables, detalle progresivo, resumen y exportaciones claras.
9. Incorporar después las funciones extra que concrete el usuario, con criterios
   de aceptación que protejan cálculos y datos. Las funciones futuras no se han
   implementado como parte de esta auditoría.

### Pruebas de aceptación mínimas

- 2027 oficial y años bisiestos, cruces de mes/año y ambos cambios de hora.
- PFA con duración civil exacta después de desplazarse y RM según regla válida.
- PAP 31/12 con los cupos confirmados y categorías correctamente identificadas.
- Totales MTE enteros y conservados, sin duplicados ni DNE arbitrarios.
- Análisis y calendario con las mismas restricciones o hipótesis explícitamente
  distintas; trazabilidad del escenario que se abre desde el análisis.
- A/B/C con resultados diferenciados y criterios documentados.
- Configuración inválida rechazada; guardar → recargar e importar → exportar sin
  perder información; sin éxito ficticio de servidor.
- Archivo XLSX real, PNG válido y PDF si se incorpora, identificando fuente,
  año, parámetros, escenario y versión del motor.
- 320/375/768/1.440 px, teclado y accesibilidad de formularios/modales.
- Datos protegidos y ausencia de perfiles, credenciales y artefactos privados
  en repositorio, despliegue y descargas públicas.

## 10. Entregables y trabajo no realizado

Resumen reproducible y sin identificadores personales:
[2026-10-28-evidencias-auditoria.json](2026-10-28-evidencias-auditoria.json).

Las trazas detalladas, pruebas aisladas, cachés CDN y capturas con datos
sintéticos se conservan en el área privada de trabajo. No se han añadido
identificadores reales, contenidos de perfiles ni claves al informe.

No se han desplegado correcciones, cambiado la configuración de Vercel/Pages,
modificado permisos, eliminado históricos ni ejecutado pruebas de carga contra
la web pública. La conformidad completa con los documentos oficiales queda
pendiente de vincular y contrastar esos documentos con el motor.
