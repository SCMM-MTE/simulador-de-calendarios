# Formato privado del simulador

No subas ficheros nominales al repositorio ni a la carpeta pública de la web.
El anterior `mtes.xlsx` y el perfil de navegador han sido retirados del árbol
actual, con copia privada de recuperación. Esta retirada **no elimina el historial
de GitHub** ni modifica por sí sola la web publicada.

## Fuentes y cálculos

Acta CSD 13/05/2026, original `20260513 XXII JORNADA MTE.pdf`, SHA-256
`c9c19383040e32b34d77b8d7686a0c94449053a6fcb1c79675a8efefa803aae4`.
Se recuperó el original del almacenamiento privado y se comprobaron visualmente
las páginas 4–6: fórmula del sorteo, llenado y rotación.

- Número oficial inicial: primer premio del Niño, 06/01/2027. ONCE y aleatorio
  son escenarios, aunque utilicen la misma fórmula.
- Ordinal inicial: `floor(número × plantilla / 100000) + 1`, sobre DNE ordenados
  numéricamente, con vuelta circular. Escalafón y orden de sorteo son campos distintos.
- Llenado: 1–13/A1, 1–13/B1, 1–13/C1, ... A4/B4/C4, segunda plaza, etc.
- Bloques: 1,13,2,12,3,11,4,10,5,9,6,8,7. Giro interno de grupos cada tres años y
  subgrupos cada cuatro. Continuidad después de 2039 confirmada por el usuario
  el 18/10/2026; se conserva aparte de la tabla documental.
- Una asignación importada prevalece sobre el reparto simulado. Las vacantes,
  incorporaciones y ajustes reales no se reconstruyen cada año con el sorteo.
- Grupo de descanso 1–4 independiente de grupos de regularización A/B/C.
- Importes temporales en minutos enteros, fechas civiles UTC, sin desfases de DST.
- Referencias ordinarias: jornada 8 h desde 2027 y 1.620 h anuales. No se fija
  automáticamente un objetivo personal: depende del plan y sus incidencias.
- La referencia de 11 días es una media; no se concede automáticamente a cada DNE.
  El acta contempla al menos siete de lunes a viernes. La interfaz muestra lo
  elegido y no acredita el cumplimiento completo de todas las condiciones.
- Compensación ordinaria febrero–diciembre del año siguiente. Lo compensado del
  anterior se separa del saldo generado actual; el resto antiguo no se añade de
  nuevo automáticamente a años sucesivos. Su cancelación o traslado excepcional
  requiere datos documentados. Un objetivo desconocido produce saldo pendiente.
- El cupo PAP del 31/12 es independiente: 55 salvo domingo (37). No se utiliza
  como disponibilidad de regularización ni para adjudicar días.

## Periodos extraídos del PDF aportado el 28/10/2026

`VACACIONES Y FIESTAS AGRUPADAS MTE 2027.pdf.pdf`, 56 páginas, SHA-256
`df7b8d19faad59dccf7c46fb02712ee7e07d0c40a2263b0c44936af2e21fb839`.
La extracción privada contiene 2.084 DNE únicos: 2.077 ordinarios y siete casos
individuales de matrimonio. No incluye nombres ni asigna escalafón/grupo.

El catálogo público `core/periods-2027.mjs` contiene solo las fechas genéricas
correspondientes a los 16 periodos ordinarios, sin DNE. Las combinaciones reales
por DNE se conservan en el fichero privado; **no están incrustadas en la web**.
El caso de matrimonio puede mezclar un verano y un invierno de distintas familias,
con su propia fecha R.M.; no se reconstruye a partir del código de verano.

El fichero privado lleva `rosterReady:false`. Permite consultar vacaciones, PFA y
R.M. sin usar la lista de vacaciones como plantilla para el sorteo. Los demás días
quedan sin determinar y no permiten elegir descansos ni calcular un balance
laboral mientras falten los grupos/calendarios y objetivos correspondientes.

En un invierno de 28 días se separan **los siete primeros de vacaciones** y los
21 restantes de PFA, conforme al criterio MTE ya contrastado (Convenio PDF 89 y
199, confirmación del 18/10/2026). Los inviernos de 21 días son íntegros PFA.
El resultado individual de este PDF suma 30 días naturales de vacaciones y 21 de
PFA en todos los casos. R.M. permanece separado como descanso compensatorio.

Los campos opcionales anuales `medicalRestDates` y `periodLabel` conservan R.M.
y los códigos de verano/invierno. R.M. no se convierte en vacaciones, no cuenta
como trabajo y no se desplaza automáticamente al editar periodos del escenario.
Cuando se aporte el escalafón, se cruzará por DNE sin sobrescribir estas fechas.

Extractor reproducible, con salida **obligatoriamente fuera del repositorio**:

```sh
python tools/extract_mte_periods_2027.py /ruta/periodos.pdf /ruta/privada/salida
python -m unittest discover -s tools/tests -v
```

Requiere PyMuPDF. Los resultados nominales no deben publicarse ni versionarse.
El informe privado conserva página/fila por DNE y el hash del original.

## JSON

Ejemplo ilustrativo de estructura, con DNE ficticio. No representa una plantilla
ni un calendario oficial. En una importación real, los descansos deben contener
las fechas completas del grupo y la referencia de su fuente.

```json
{
  "schema": "scmm-personal-simulator-v1",
  "version": "version-de-la-fuente",
  "sourceReference": "Referencia del escalafón",
  "entries": [{
    "dne": "9000000001",
    "seniorityRank": 1,
    "restGroup": 2,
    "years": {
      "2027": {
        "vacations": [{"start": "2027-07-01", "end": "2027-07-30"}],
        "pfa": [{"start": "2027-02-03", "end": "2027-02-23"}],
        "dailyMinutes": 480,
        "annualTargetMinutes": null,
        "openingBalanceMinutes": null,
        "sourceReference": "Referencia del plan anual"
      }
    }
  }],
  "calendars": {}
}
```

Cada calendario se añade a `calendars["2027"]` con `groups` (objeto, claves
`"1"`...`"4"`, arrays de fechas ISO de descanso), `holidays` (fechas ISO),
`sourceReference` y `verified`. Este último es un dato del archivo; no demuestra
por sí mismo una revisión oficial. Sin calendario del grupo, no se dibujan
calendarios sustitutivos. Sin plan del año, se muestra pendiente.

`annualTargetMinutes` y `openingBalanceMinutes` aceptan `null` para desconocido;
**cero es un valor conocido**, distinto de pendiente. Si no existe saldo inicial
importado pero sí plan anual, se utiliza como proyección el saldo generado por el
escenario anterior. El saldo importado prevalece y no se modifica.

Asignación real opcional por entrada, `officialAssignment`:
`{"initialBlock":1,"group":"A","subgroup":1,"seat":1,"sourceReference":"Fuente"}`.
Nunca equivale a una aprobación oficial por el mero hecho de cargar un archivo.

## CSV de escalafón inicial

Cabecera `dne;escalafon;grupo_descanso`. Solo `dne` es obligatorio al cargar un
escalafón parcial. Los campos ausentes se presentan pendientes, no se sortean.
El CSV no contiene planes anuales ni calendarios. Admite separadores coma o punto
y coma y campos entrecomillados. No ejecuta fórmulas ni conserva nombres/NIF.
El futuro Excel se convertirá de forma privada, comprobando estructura y datos,
sin volver a incluirlo como archivo público de la aplicación.

## Protección de los datos

Los datos se conservan en memoria de la pestaña. La descarga de una simulación
contiene solo su DNE, número, versión, periodos y elecciones, nunca el escalafón
completo. Recupérala con el mismo archivo/versionado y DNE.
La descarga sigue siendo un archivo personal: no debe publicarse.

Las plantillas se validan por lista blanca y se congelan recursivamente. Las
modificaciones del escenario solo admiten `vacations`, `pfa` y `selections`.
Esto bloquea el cambio de grupo en la aplicación, pero no autentica un archivo
editado fuera de ella. Una versión compartida con cuentas requiere datos
autorizados en servidor, verificación de sesión y acceso limitado al propio DNE.
