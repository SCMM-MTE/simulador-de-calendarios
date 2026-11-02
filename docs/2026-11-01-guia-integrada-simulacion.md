# Explicaciones integradas en el simulador personal

Base: `codex/simulador-personal-dne-20261028`, commit `0948fd3`. Cambios preparados en `codex/guia-visual-simulacion`. La versión Next.js antigua de main y la web publicada no se sustituyen con esta revisión.

## Comportamiento

El fondo claro, la tipografía y los colores siguen el aviso visual aprobado: dorado para compensaciones anteriores, verde para días del año y violeta para el saldo nuevo. Se conserva el tema oscuro y el movimiento reducido.

- La vista Cómputo distingue los tres años y explica la cuenta del saldo nuevo.
- El calendario muestra las elecciones según su origen y una explicación de la fecha enfocada o consultada. Incluye consulta de fechas no elegibles.
- La cuenta del año siguiente permanece junto al calendario. Los contadores anteriores siguen disponibles.
- Dos escenarios de acceso directo usan el GR1 y periodo 1A del ejemplo revisado, con persona ficticia y saldos supuestos de +4 o -3. El calendario documental no se etiqueta como ficticio. No se incluye plantilla personal.
- La guía reúne origen de los días, cronograma de 2027, citas del subgrupo, ajustes, baja, parejas y huecos de plantilla. Las excepciones se explican y no se aplican como si fueran una deducción del cálculo ordinario.
- El sorteo ordena por `seniorityRank` y muestra el DNE de la persona por la que empieza el recorrido circular. El DNE identifica, no ordena. Sin escalafón completo se mantiene pendiente el reparto, conservando el calendario y las asignaciones oficiales importadas.

Los cálculos anuales y la asignación automática del origen de las elecciones mantienen su motor. Las explicaciones leen sus resultados. La corrección del orden inicial del sorteo responde a la aclaración expresa del usuario.

## Verificación

56 pruebas del motor y de las explicaciones superadas. Incluyen crédito y débito anteriores, 213−202−7=4, reconocimiento fuera 212−201−7=4, naturaleza de fines de semana/festivos, años sin datos, escalafón contrario al orden numérico del DNE y rechazo de rangos ausentes/duplicados.

En el navegador se comprobaron apertura de ambos ejemplos, elección de días verdes y dorados, reducción independiente de los saldos, consulta de sábado sin crédito, cuatro elecciones con débito, paso a 2028 sin inventar calendario, guía y DNE de inicio. Las cuatro vistas caben en 320 px sin desbordamiento del documento. La captura de pantalla del navegador no estuvo disponible: la comprobación de dimensiones y flujos usa el DOM, no acredita una revisión visual por captura.

## Entrega local

`tools/build_personal_preview.py` incluye los nuevos archivos de la guía en el paquete estático. `tools/build_personal_standalone.py` genera un HTML sin dependencias externas ni datos privados que puede abrirse sin servidor. La carga automática de asignaciones sigue requiriendo su archivo separado; los ejemplos funcionan sin él.

El paquete no contiene archivos de plantilla privada, entornos, documentos de personal ni historial Git. No se modifican las reservas ni los cupos reales. No se publica producción ni se mezcla la rama con main en esta revisión.
