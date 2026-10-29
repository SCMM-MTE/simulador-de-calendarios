# Simulador personal por DNE — preparación y validación

28/10/2026. Implementación solicitada tras la auditoría integral.

## Estado

Versión preparada para revisión, sin integración de perfiles reales ni despliegue
en producción. Entrada estática nueva en `index.html` y `personal/`.
Se conserva el commit local de identidad `bbbc500`, previamente ausente de main.
El main remoto comprobado antes de esta integración es `ed1261a`.

El usuario confirmó **DNE de maquinista**, no DNI/NIF. Se sustituyó la entrada por
un flujo DNE → número de cinco cifras → calendario personal. Se rediseñaron el
calendario, la ficha, el análisis anual y la explicación de la rotación, también
para móvil. Se permite editar/restaurar vacaciones y PFA; no el grupo de descanso.

## Datos y reglas

El original del acta CSD 13/05/2026 se recuperó de almacenamiento privado, se
comprobó su hash y se revisaron visualmente las páginas 4–6. Las reglas y límites
están documentados en [personal/README.md](../personal/README.md).

El nuevo motor corrige el llenado de bloques y separa grupo de descanso, unidad
de regularización, escalafón y orden del sorteo. Sorteo del Niño es la referencia
del acta; ONCE/aleatorio se presentan como escenarios.

La contabilidad utiliza minutos enteros y fechas civiles: una compensación del
año anterior no genera un nuevo saldo duplicado. Se diferencia saldo generado,
proyección siguiente año y anterior pendiente. Sin objetivo/calendario/plan no
se inventa un resultado; el dato queda pendiente. Los conflictos de un año futuro
no bloquean la revisión del anterior y se identifican para corregir elecciones.

La plantilla Excel anterior y el perfil de navegador se retiraron del árbol
público actual; sus copias privadas de recuperación se conservaron. La retirada
no purga el historial Git ni acredita que la web pública se haya actualizado.
La nueva app retira los campos de plantilla nominal cacheados por la versión
anterior, conservando los demás ajustes. No reutiliza esa plantilla.

Los nuevos ficheros se importan solo en memoria, con lista blanca y validación;
no se envían a ninguna API ni se guardan como plantilla en localStorage. Se
pueden descargar y recuperar escenarios del mismo DNE/versión. El ejemplo es
completamente ficticio y requiere una acción explícita para abrirlo.

## Validación realizada

- 19 pruebas Node: fechas/DST/bisiesto, relleno del acta, fórmula/extremos y
  circularidad del sorteo, rotación continua, prioridades únicas, prevalencia
  de asignación importada, CSV, datos inmutables y modificación restringida.
- Balance exacto, ausencia de datos, saldo anterior positivo/negativo, límites de
  compensación, rechazo de naturaleza mezclada, cadena 2027–2029, conflictos
  futuros aislados, recuperación de escenarios y retirada de caché nominal.
- Chromium: raíz y subcarpeta, ejemplo ficticio, selección reversible, edición
  y restauración de periodos, descarga/recuperación, años, análisis y grupo fijo.
- Anchos 320, 375, 768 y 1440 px sin desbordamiento horizontal del documento.
  Las tablas amplias tienen desplazamiento propio accesible con teclado.
- axe-core WCAG A/AA: cero infracciones detectadas en calendario claro y análisis
  oscuro revisados. No equivale a una certificación de accesibilidad completa.
- Sin errores JavaScript de página en los flujos comprobados; la versión estática
  no requiere React/CDN/Babel ni la compilación Next.js anterior.
- Búsqueda de patrones de credenciales en nuevos módulos e informes: cero.

## Pendiente

1. Nuevo escalafón, vacaciones/PFA y grupo fijo por DNE anunciados por el usuario.
2. Vincular los calendarios oficiales 2027 ya aportados al formato del motor;
   incorporar los datos documentados de cada año posterior para calcularlo.
3. Concretar si el acceso será con cuentas Consulta Convenio o local privado.
   DNE por sí solo no autentica. No hay todavía una API central de perfiles.
4. Capturas del portal de petición PAP para ajustar el aspecto solicitado.
5. Incidencias/prorrateos, situaciones excluidas, IT y ajustes de Nombramiento:
   no se pueden certificar con el calendario ordinario ni con datos inventados.
6. Revisión y despliegue: esta preparación no cambia la producción. Los problemas
   de la migración Next.js anterior siguen documentados y no se ocultan como
   corregidos por haber construido la entrada estática nueva.
