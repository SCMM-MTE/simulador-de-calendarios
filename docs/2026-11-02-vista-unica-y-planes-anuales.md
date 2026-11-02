# Vista única y selección anual de grupo y vacaciones

Por petición del usuario, el simulador se concentra en una única página. Año,
grupo de descanso, grupo de vacaciones/PFA, modalidad de R.M., saldo anterior y
calendario se encuentran en el mismo flujo. Ficha/guardado, desglose del cálculo,
evolución y rotación quedan en desplegables opcionales, sin pestañas.

La carga inicial mantiene el escalafón de 2.083 DNE y las preasignaciones de 2027.
La nueva configuración `calculationOptions.yearPlans` permite elegir, para cada
año, grupo de descanso y uno de los 16 grupos del catálogo. No modifica el DNE,
el escalafón, la asignación de regularización ni los documentos importados.
Los casos individuales conservan la opción de usar su preasignación original.

Los cambios se aplican al año elegido. Si cambian descansos o periodos, se retiran
las elecciones de fechas de ese año y se informa del número retirado, para no
conservar fechas incompatibles. Otros años conservan su configuración; el saldo
arrastrado se recalcula y las incompatibilidades posteriores siguen visibles.
Aplicar un plan vuelve al cálculo por calendario y retira el total manual de ese
año. Guardar/recuperar incluye grupos, periodos y elecciones de todos los años.

## Años sin datos publicados

La proyección se ofrece mediante una casilla visible y se etiqueta como simulación
en la cabecera y en el plan. Sin plan elegido no se inventan años automáticamente.
Sin aceptar la proyección no se traslada el catálogo 2027 a otro año.

Los ocho grupos diurnos/nocturnos de la referencia 2027 tienen patrón de 28 días.
Antes de proyectar se verifica el patrón contra todo el año; se continúa desde el
01/01/2027 mediante días civiles, también a través de bisiestos, sin reiniciar el
ciclo cada enero. Si existe calendario del año y grupo, se usa esa referencia.

Los periodos futuros conservan los mismos días/meses del grupo elegido en 2027.
Son escenarios, no asignaciones oficiales. SDF usa fines de semana y los festivos
que estén cargados para ese año; nunca copia festivos de 2027 a otro año ni
inventa fechas locales/autonómicas. La falta de festivos futuros se advierte.

La modalidad R.M. mantiene objetivo de 202 dentro de jornada y 201 fuera. Para
2027 se conserva la fecha compensatoria de origen; en un año proyectado se usa
la fecha de referencia del grupo elegido. Dentro de jornada no se aplica ese
descanso. Los saldos siguen separados por origen y se expresan en jornadas.

## Validación

62 pruebas correctas, incluidas seis nuevas: inmutabilidad de origen, grupos
anuales independientes, ciclo continuo/bisiesto, arrastre, aceptación explícita
de proyección, restauración de elecciones futuras y ausencia de festivos SDF
inventados. Navegador: carga real sin importar archivos, una única página,
cambio 2027/2028 y vuelta, elección de fechas en ambos años, exportación y
recuperación, y anchura de 320 px sin desbordamiento ni errores JavaScript.
No se comprueban cupos reales ni se envían solicitudes a Metro.
