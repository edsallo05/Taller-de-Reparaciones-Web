1. Propósito del proyecto

Estamos desarrollando una aplicación web para la gestión de un taller de reparaciones de equipos electrónicos.

El proyecto utiliza React con Vite para el frontend y PocketBase como backend.

El documento Segundo_Parcial.docx, situado en la raíz del repositorio, contiene los requisitos oficiales del proyecto. Debe considerarse la fuente principal de verdad para todos los requisitos funcionales y técnicos.

El objetivo es construir una aplicación que cumpla todos los requisitos del profesor, pero que mantenga una implementación sencilla, clara y fácil de comprender.

Este proyecto será evaluado mediante una defensa oral individual. Por tanto, el código debe poder ser comprendido y explicado por un estudiante.

2. Principios generales de desarrollo

2.1. Pensar antes de programar

- Antes de implementar una funcionalidad, analiza el problema y el código existente.
- No asumas que una solución es necesaria sin comprobarlo.
- Identifica qué archivos necesitan modificarse antes de comenzar.
- Si existen dudas importantes sobre los requisitos, pregunta antes de tomar decisiones que puedan afectar al funcionamiento.
- Si detectas contradicciones entre instrucciones, respeta los requisitos oficiales del profesor y consulta antes de tomar decisiones importantes.

  2.2. Priorizar la simplicidad

- Implementa siempre la solución más sencilla que cumpla los requisitos.
- Evita arquitecturas excesivamente elaboradas.
- No introduzcas patrones de diseño, abstracciones o capas innecesarias.
- No crees funcionalidades que no hayan sido solicitadas.
- No añadas dependencias externas sin una justificación real.
- No intentes optimizar prematuramente.
- Prioriza la legibilidad y facilidad de mantenimiento sobre la sofisticación técnica.

  2.3. Realizar cambios precisos

- Modifica únicamente los archivos necesarios para completar la tarea.
- No reestructures partes del proyecto que ya funcionan sin una razón justificada.
- No cambies nombres, estructuras o funcionalidades existentes por preferencias personales.
- Evita introducir cambios no relacionados con la tarea solicitada.
- Conserva el comportamiento existente salvo que sea necesario modificarlo.

  2.4. Verificar los resultados

- No consideres terminada una tarea simplemente porque el código se haya escrito.
- Comprueba que la funcionalidad cumple su objetivo.
- Ejecuta las pruebas y comprobaciones pertinentes.
- Si aparecen errores, intenta resolverlos antes de dar la tarea por terminada.
- Nunca afirmes que algo funciona si no lo has comprobado.

3. Estilo de programación

Esta sección es especialmente importante. La prioridad es producir código que resulte fácil de leer y comprender.

3.1. Nombres descriptivos

- Utiliza nombres de variables, funciones, componentes y constantes que describan claramente su propósito.
- Evita nombres de una o dos letras.
- No utilices abreviaciones innecesarias.
- Prefiere clienteSeleccionado antes que c.
- Prefiere obtenerOrdenes antes que getO.
- Prefiere totalPresupuesto antes que total cuando el contexto lo requiera.
- Mantén una nomenclatura coherente en todo el proyecto.

  3.2. Comentarios en el código

- Coloca un comentario breve, de una sola línea, encima de cada función declarada que implemente una funcionalidad.
- El comentario debe explicar qué hace la función, no describir detalles evidentes de su sintaxis.
- Los comentarios deben ser sencillos y estar escritos en español.
- Evita comentarios extensos e innecesarios.
- No escribas comentarios que simplemente repitan el nombre de la función.
- Actualiza los comentarios cuando cambie el comportamiento de una función.

Ejemplo:

// Obtiene las órdenes registradas en PocketBase.
async function obtenerOrdenes() {
// Implementación
}

3.3. Sintaxis sencilla

- Evita expresiones excesivamente compactas.
- No combines demasiadas operaciones en una misma línea.
- Evita anidamientos innecesarios.
- Prefiere condiciones if/else claras cuando faciliten la comprensión.
- Evita operadores ternarios anidados.
- Evita encadenamientos complejos de métodos.
- Utiliza async/await para trabajar con operaciones asíncronas.
- Utiliza map, filter y otras funciones habituales de JavaScript cuando mejoren la claridad.
- No utilices técnicas avanzadas de JavaScript si existe una alternativa más sencilla y comprensible.

No es necesario evitar las características modernas del lenguaje. Se pueden utilizar siempre que aporten claridad y no compliquen innecesariamente el código.

3.4. Funciones y componentes

- Cada función debe tener una responsabilidad clara.
- Evita funciones excesivamente largas.
- No dividas una funcionalidad en demasiadas funciones pequeñas sin necesidad.
- Los componentes React deben ser pequeños y fáciles de comprender.
- Evita pasar demasiadas propiedades entre componentes.
- No crees componentes reutilizables si solamente complican una implementación sencilla.

4. Arquitectura y organización

- Mantén una estructura de carpetas sencilla y coherente.
- Separa el frontend de los archivos propios de PocketBase.
- Organiza los componentes según su responsabilidad.
- Separa las peticiones HTTP de los componentes cuando resulte útil para mantener el código ordenado.
- Evita crear archivos genéricos que terminen acumulando funcionalidades sin relación.
- No introduzcas capas adicionales de servicios, repositorios o gestores de estado si no son necesarias.

Antes de crear una nueva estructura de carpetas, comprueba si la estructura existente ya permite implementar la funcionalidad.

5. Tecnologías y restricciones obligatorias

Respeta estrictamente los requisitos del documento oficial.

5.1. Frontend

- React.
- Vite.
- JavaScript.
- React Router utilizando el paquete react-router.
- Peticiones HTTP mediante fetch.

No utilizar:

- SDK de PocketBase.
- Librerías de componentes visuales.
- Librerías externas de gestión de estado.

Los formularios deben ser controlados y las listas deben utilizar correctamente la propiedad key.

Utiliza los hooks de React de forma adecuada:

- useState para gestionar estados locales.
- useEffect cuando sea necesario sincronizar con elementos externos.
- useRef cuando exista una utilidad real.
- useMemo y useCallback únicamente cuando exista una justificación clara.

No introduzcas hooks innecesariamente.

La aplicación debe incluir:

- Rutas con parámetros.
- Rutas anidadas.
- Uso de Outlet.
- Página para rutas inexistentes.

  5.2. Backend

PocketBase será el backend de la aplicación.

- Las migraciones deben estar dentro de pb_migrations.
- La lógica personalizada debe estar dentro de pb_hooks.
- Las peticiones desde React deben realizarse mediante fetch.
- No utilizar el SDK oficial de PocketBase.
- Las validaciones importantes deben realizarse en el servidor.
- Las reglas de acceso deben impedir las operaciones expresamente prohibidas.

No implementar autenticación, usuarios ni roles, ya que el sistema solamente será utilizado por el personal del taller y así lo establece el documento oficial.

5.3. Modelo de datos

Los nombres de las colecciones y sus campos deben respetarse exactamente.

Colecciones obligatorias:

clientes

- nombre
- telefono

ordenes

- cliente
- equipo
- problema
- estado
- diagnostico
- manoObra
- piezas
- fotos

eventos

- orden
- de
- a
- fecha de creación automática

Respeta los tipos de datos, relaciones y restricciones indicados en el documento oficial.

No cambies los nombres de los campos ni introduzcas campos adicionales sin una justificación y autorización.

6. Reglas de negocio

El funcionamiento del taller debe respetar estrictamente las reglas establecidas en el documento oficial.

Etapas:

- solicitada
- en_diagnostico
- presupuestada
- aprobada
- en_reparacion
- lista
- entregada

Estados de salida:

- rechazada
- cancelada

Transiciones permitidas:

- solicitada → en_diagnostico
- solicitada → cancelada
- en_diagnostico → presupuestada
- presupuestada → aprobada
- presupuestada → rechazada
- aprobada → en_reparacion
- en_reparacion → lista
- lista → entregada

Reglas importantes:

- Una orden no puede saltarse etapas.
- Una orden solamente puede cancelarse mientras esté solicitada.
- Las órdenes rechazadas, canceladas o entregadas no pueden modificarse posteriormente.
- Cada cambio de etapa debe generar un evento histórico.
- Los eventos no pueden editarse ni eliminarse.
- El presupuesto se registra al presupuestar y no puede modificarse posteriormente.
- El total del presupuesto se calcula sumando la mano de obra y el importe de las piezas. No debe almacenarse.
- Las fotos deben respetar el límite de tres imágenes por orden.

Todas estas reglas deben estar protegidas en el backend. No basta con validarlas desde la interfaz.

7. Metodología de trabajo

Trabaja mediante etapas pequeñas y verificables.

- No intentes construir toda la aplicación en una sola operación.
- Antes de comenzar una etapa, identifica su objetivo y los archivos que necesitarás modificar.
- Implementa únicamente lo correspondiente a esa etapa.
- Comprueba el funcionamiento antes de continuar.
- Explica los cambios realizados.
- Identifica los conceptos técnicos importantes que debería comprender el estudiante.
- Si una etapa presenta errores importantes, resuélvelos antes de avanzar.

No continúes automáticamente con etapas posteriores sin haber completado y verificado la actual.

8. Comunicación y explicaciones

Al finalizar cada tarea, proporciona un resumen claro y breve que incluya:

1. Qué se ha implementado.
2. Qué archivos se han creado o modificado.
3. Qué hace cada archivo nuevo.
4. Qué comprobaciones se han realizado.
5. Si quedan errores o tareas pendientes.
6. Qué conceptos debería comprender el estudiante.

Evita explicaciones excesivamente técnicas cuando exista una forma más sencilla de expresarlo.

No ocultes problemas ni presentes funcionalidades incompletas como terminadas.

9. Preparación para la defensa oral

Recuerda que el estudiante debe ser capaz de explicar el código que entrega.

Por tanto:

- No implementes soluciones innecesariamente avanzadas.
- Evita código que funcione pero resulte difícil de explicar.
- No introduzcas dependencias o herramientas que no sean necesarias.
- Prioriza soluciones transparentes y fáciles de seguir.
- Cuando utilices un concepto que pueda resultar nuevo, explícalo brevemente al finalizar la tarea.
- Si existen varias alternativas, elige la más sencilla que cumpla los requisitos.

10. Documentación y entrega

El proyecto debe incluir un README.md que explique cómo instalar y ejecutar la aplicación desde cero en una máquina limpia.

Debe incluir también:

- Preparación de PocketBase.
- Configuración necesaria.
- Forma de ejecutar el frontend.
- Datos de demostración.
- Dos clientes de prueba.
- Al menos tres órdenes en etapas diferentes.

El repositorio debe mantener un historial de commits que refleje el avance del desarrollo.

No marques el proyecto como terminado hasta comprobar los requisitos funcionales, técnicos y de entrega del documento oficial.

⸻

PRINCIPIO FUNDAMENTAL

La prioridad absoluta es construir una aplicación funcional que cumpla los requisitos del profesor mediante código sencillo, legible y fácil de comprender.

No buscamos la solución más sofisticada ni demostrar cuánto código puede producir un agente de inteligencia artificial.

Buscamos la solución más sencilla que funcione correctamente y que el estudiante pueda comprender y defender en su totalidad.
