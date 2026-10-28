# Preasignación de grupo y periodos de 2027

La portada recupera por DNE el grupo de descanso del cuadro anual y las vacaciones,
PFA y R.M. del documento de vacaciones. La elección manual del grupo solo aparece
si la referencia no asigna uno. Un DNE ajeno al escalafón puede probar un grupo y
un periodo del catálogo sin incorporarse al sorteo ni recibir un escalafón ficticio.
Las fechas se pueden modificar después dentro de la simulación.

Fuentes contrastadas:

- Libro `Evolucion_Cuadros_Franjas_Separadas_Centrado.xlsx`, SHA256
  `e225a9708d0624d26c43e03e4197ab5258c7ccfec14f8294401b04da8351e1e9`:
  tablas `Cuadro_2027` y `Calendario_Diario_2027`.
- Las 2.086 filas del cuadro coinciden por DNE y DSO con la extracción digital
  conciliada de la adjudicación de 2027. Se vinculan únicamente los 2.083 DNE de
  la base activa de vacaciones, conservando la exclusión solicitada.
- Vacaciones/PFA: extracción y escalafón conciliados descritos en los informes
  anteriores. Los 2.083 DNE conservan sus periodos originales.

Resultado: 2.046 grupos preasignados, 37 sin asignación y seleccionables.
Se conservan los grupos nocturnos `GR1N`–`GR4N`, distintos de los diurnos. Los ocho
calendarios tienen 365 fechas consecutivas; D se interpreta como descanso.
Para los 11 casos SDF se aplica la regla confirmada por el usuario: sábados,
domingos y festivos nacionales, autonómicos y locales aplicables al municipio
de Madrid. Se ha contrastado la lista de 14 fiestas laborales de 2027 con el
[calendario oficial del Ayuntamiento](https://www.madrid.es/portales/munimadrid/es/Inicio/Actividad-economica-y-hacienda/Empresa-y-comercio/Normativa/Calendario-oficial-laboral-y-de-dias-inhabiles-y-festivos-2027-para-Madrid/?vgnextchannel=dd3c6d5ef88fe410VgnVCM1000000b205a0aRCRD&vgnextoid=f67c646ba5011a10VgnVCM100000891ecb1aRCRD).
Son 115 descansos distintos: 104 sábados/domingos y 11 festivos adicionales en
lunes a viernes. Las tres fiestas coincidentes en sábado no se duplican ni se
trasladan a un lunes inexistente en la referencia oficial. La lista está en
`tools/data/madrid-festivos-2027.json`. No se trasladan calendarios a otros años.

La prueba online incorpora ahora las asociaciones solicitadas de DNE, orden,
grupo y periodos; esto sustituye la anterior prueba que requería importar el
archivo para consultar los datos reales. No incorpora nombres, DNI, documentos
originales ni credenciales. Las importaciones adicionales siguen siendo locales.
El JSON de asignaciones se prepara fuera del repositorio y se incluye únicamente
al empaquetar el despliegue con `--dataset`. No es un portal autenticado.

Preparación reproducible:

```sh
python tools/prepare_personal_defaults.py perfiles-privados.json libro.xlsx /ruta/privada/default-dataset.json
python tools/build_personal_preview.py /ruta/privada/publicacion --dataset /ruta/privada/default-dataset.json
npm run test:personal
```

Verificación: 46 pruebas del motor; prueba de navegador con preasignación diurna,
nocturna y SDF, grupo ausente, DNE nuevo, periodos originales, exportación y
recuperación. Anchuras de 320, 375, 768 y 1440 píxeles sin desbordamiento horizontal.

Verificación adicional SDF: seis pruebas Python (incluida la integración del libro), 46 pruebas del motor y contraste de los once perfiles SDF contra las fechas oficiales.
