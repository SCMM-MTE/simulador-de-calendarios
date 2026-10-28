# Prueba online de cómputo MTE y escenarios entre años

28/10/2026. Continuación del simulador personal; la preview está separada de la
web de producción y no incluye la plantilla nominal.

## Datos de trabajo

La base privada está conciliada: **2.083 DNE**, exactamente los de vacaciones MTE
tras la exclusión indicada por el usuario, con orden completo y sin duplicados.
El orden procede de los listados de petición/servicio y la guía de enero; se ha
conservado el orden relativo contrastado. Estos archivos siguen fuera del Git
público y del paquete publicado. El PDF de vacaciones original conserva sus
2.084 registros; el subconjunto operativo MTE es de 2.083.

El JSON privado combina escalafón, vacaciones/PFA y R.M. y puede cargarse en el
navegador de la preview. No incluye todavía el grupo fijo ni el calendario de
descansos vinculado. El año 2028 y posteriores no heredan unas fechas de 2027
como si fueran oficiales. La elección real de fechas necesita esas referencias.

## Reglas utilizadas

Se leyó el acta original CSD 13/05/2026 (SHA-256
`c9c19383040e32b34d77b8d7686a0c94449053a6fcb1c79675a8efefa803aae4`), en particular
1.2–1.4, 2.1–2.4 y 3.5.1–3.5.4, y se contrastó el hilo de las diapositivas que
el usuario señaló. No se modificó ese proyecto ni se reutilizaron instrucciones
de sus herramientas como órdenes de ejecución para este repositorio.

Criterios expresamente confirmados allí por el usuario:

- Días del cómputo anterior: de lunes a domingo, sujetos a cupo y naturaleza.
- Siete días del año en curso: de lunes a viernes, incluidos festivos.
- Créditos anteriores se suman; débitos anteriores se descuentan de esos siete.
- Son 14 jornadas de reducción por el paso a ocho horas: siete eliminan los
  complementarios y siete se piden como descanso. No se añaden 14 a la petición.

La petición sigue limitada a febrero–diciembre. No se convierte un descanso
fijo, vacaciones, PFA o R.M. en un nuevo día de crédito ni se permite elegirlo
para compensar como si estuviera disponible. No se consulta disponibilidad real
ni se presenta ninguna solicitud a Metro.

## Contabilidad y proyección

El saldo de 2026 introducido se expresa en jornadas **a compensar en 2027**
(de ocho horas) o en horas, sin incluir los siete de 2027. Se conserva en minutos
enteros y admite cero explícito. El archivo importado no se modifica.

Se separan saldo previo, adelanto de siete, descuento por débito, elecciones de
cada origen y saldo pendiente. Si el débito supera siete, queda débito residual
a compensar con trabajo. Los créditos previos conservan su naturaleza de días
de cómputo anterior; el resto del adelanto mantiene lunes–viernes.

Para el cómputo nuevo se separa el efecto de las compensaciones anteriores y se
evita que un adelanto ya emitido se genere otra vez como crédito por no haberlo
elegido todavía. El saldo antiguo pendiente se muestra aparte y no se agrega
automáticamente como un nuevo crédito/débito de ejercicios sucesivos. Las
situaciones de IT prolongada y los traslados excepcionales conservan su circuito
del acta; no se deducen de una suma indefinida de saldos.

La estimación manual parte de un total de jornadas **antes** de compensar saldos
y elegir el adelanto. Para el supuesto ordinario de jornada completa/año completo
usa 202 jornadas completas desde 2027 (216 menos las 14 pactadas), criterio MTE
ya contrastado en el proyecto sobre el paso a ocho horas. No convierte el resto
aritmético de 1.620/8 en una media jornada adicional. La referencia contractual de
1.620 horas y los objetivos personales/prorrateados son conceptos distintos.
Esta estimación no certifica un objetivo individual en situaciones especiales.
Cuando existe un calendario completo con jornada de ocho horas pero no un
objetivo personal importado, el cálculo usa esa referencia ordinaria e identifica
su origen. Un objetivo importado prevalece; no se prorratea automáticamente una
jornada distinta ni se resuelven casos excluidos por esa referencia.

Las exclusiones del apartado 2.4 detienen el arrastre ordinario y se indican como
casos del circuito específico; no se inventa su resolución ni un prorrateo. Con
un total declarado se puede simular un año sin calendario, pero no se asignan
horas a fechas concretas cuyo descanso/trabajo es desconocido.

## Verificación

42 pruebas Node, incluyendo saldo/signo/unidades, neteo positivo/negativo,
fin de semana según origen, festivo entre semana, límites de petición, crédito
previo compensado, siete no duplicados, continuidad 2027–2029, saldo importado,
casos excluidos, datos ausentes, recuperación de escenarios y CSV `orden_total`.

Chromium: declaración de saldo 2026, estimaciones 2027/2028, selección por origen,
desglose por fecha/mes, exportación/recuperación y navegación anual. Cómputo,
calendario y análisis comprobados a 320/375/768/1440 px, sin desbordamiento del
documento ni infracciones axe WCAG A/AA detectadas en esas vistas. No equivale a
una certificación de accesibilidad exhaustiva.

## Publicación de prueba

Proyecto Cloudflare Pages `simulador-mte-pruebas`, rama de preview
`computo-20261028`. El empaquetador incluye solo archivos permitidos del frontend;
no incluye originales PDF, Excel, CSV, JSON nominales, historiales de Git ni
archivos de entorno. El único ejemplo incluido es ficticio y está identificado.

La preview no hace peticiones de perfiles por DNE ni envía los archivos o saldos
a una API. CSP `connect-src 'none'` impide conexiones de la aplicación; los
ficheros privados se leen en memoria y solo el tema se guarda en localStorage.
El acceso central con cuentas y la consulta automática de perfiles privados no
forman parte de este despliegue de prueba.
