# Panel de Administración de Empleados (RRHH)

Proyecto Final — **Programación Web**

---

## 1) Descripción del proyecto

Este proyecto es un **panel de administración de Recursos Humanos**. Permite gestionar
tres entidades relacionadas, cada una con su **CRUD completo** (Crear, Leer, Actualizar
y Eliminar):

- **Departamentos** → áreas de la empresa (ej: Sistemas, Ventas).
- **Empleados** → personas que pertenecen a un departamento.
- **Asistencias** → registros diarios de cada empleado (Presente / Ausente / Tardanza).

### ¿Cómo se relacionan las tres entidades?

```
DEPARTAMENTO  (1) ───< (muchos)  EMPLEADO  (1) ───< (muchos)  ASISTENCIA
```

- Un **departamento** tiene muchos **empleados** (cada empleado guarda un `departamentoId`).
- Un **empleado** tiene muchas **asistencias** (cada asistencia guarda un `empleadoId`).

Por eso, al borrar usamos **eliminación en cascada**: si se borra un departamento, se
borran sus empleados y, de cada empleado, sus asistencias.

### Stack utilizado

- **HTML5** para la estructura de las páginas.
- **CSS con Bootstrap 5** (por CDN) solo como reset base, más un **tema propio editorial**
  (`css/styles.css`) que define toda la identidad: paleta sobria con **un solo color de acento**
  (coral), bordes finitos (*hairline*), esquinas casi rectas, tipografía protagonista
  (**Space Grotesk**, **Inter** y **JetBrains Mono** por Google Fonts), **ventanas modales**
  propias y un **footer** en franja oscura. Todo se controla desde **tokens** (variables CSS
  en `:root`): cambiando ese bloque cambia la identidad entera.
- **JavaScript puro (vanilla)** — sin React, sin Vue, sin frameworks. Las funciones comunes a
  las tres páginas viven en un único archivo `js/utils.js` (para no repetir código).
- **Axios** (por CDN) para hacer las peticiones HTTP a la API. Todas las llamadas están
  envueltas en `try/catch` para avisar con un mensaje claro si la API está caída.
- **json-server** como **API REST fake**: convierte el archivo `db.json` en una API real
  con los endpoints `/departamentos`, `/empleados` y `/asistencias`.
- **Favicon propio** (`favicon.svg`): monograma "RH" hecho en SVG con la misma paleta.

### Estructura de archivos

```
Proyecto Final - Programacion 2/
├── index.html          → CRUD de Departamentos (página de inicio)
├── empleados.html      → CRUD de Empleados (del departamento elegido)
├── asistencias.html    → CRUD de Asistencias (del empleado elegido)
├── js/
│   ├── utils.js        → compartido (API, códigos, fechas, errores, modal, navegación)
│   ├── departamentos.js
│   ├── empleados.js
│   └── asistencias.js
├── css/
│   └── styles.css      → tema editorial: tokens + componentes + modal + footer
├── favicon.svg         → ícono propio (monograma "RH")
├── db.json             → "base de datos" con datos de ejemplo
└── README.md
```

### Pasos para correrlo

1. **Instalar json-server** (una sola vez, de forma global):

   ```bash
   npm install -g json-server@0.17.4
   ```

   > **Importante:** instalamos la versión **0.17.4** (la clásica) a propósito. La versión
   > nueva (1.x) quitó el comando `--watch` y genera `id` aleatorios (ej: `"Tnrtdrov2lQ"`),
   > lo que rompe el ordenamiento de asistencias por `id`. Con la 0.17.4 los `id` son
   > números que crecen de a uno (1, 2, 3, …), justo lo que necesita este proyecto.

2. **Levantar la API** (parado en la carpeta del proyecto):

   ```bash
   json-server --watch db.json --port 3000
   ```

   Esto deja la API escuchando en `http://localhost:3000`. Probá abrir
   `http://localhost:3000/departamentos` en el navegador para ver los datos.

3. **Abrir `index.html` con Live Server** de VS Code (clic derecho sobre `index.html` →
   *Open with Live Server*).

#### ¿Por qué con Live Server y NO con doble clic (file://)?

Si abrís el HTML con doble clic, el navegador lo carga con el protocolo `file://`. En ese
modo, por seguridad, los navegadores **bloquean las peticiones HTTP** (Axios) hacia
`http://localhost:3000` por la política **CORS**. Live Server, en cambio, sirve la página
por `http://` (ej: `http://127.0.0.1:5500`), y desde ahí sí se permiten las peticiones a la
API. En resumen: **necesitamos que la página se sirva por `http://`, no por `file://`.**

---

## 1.b) Mejoras de la segunda versión

Sobre la primera entrega (que ya tenía los tres CRUD andando) hicimos **cuatro mejoras** para
que el proyecto quede más prolijo, más robusto y más lindo de usar. Las anotamos acá juntas
para tenerlas claras en la defensa; más abajo, en la parte de código, están explicadas línea
por línea.

### Mejora 1 — Código compartido en `js/utils.js` (no repetir código)

Antes, el bloque del **avatar** (la lista `GRADIENTES` y las funciones `iniciales()` y
`gradienteAvatar()`) estaba **copiado y pegado** en `departamentos.js` y en `empleados.js`, y la
constante `API` estaba escrita en los tres archivos. Eso es **código duplicado**: si había que
cambiar algo, había que tocarlo en varios lados.

Lo movimos **todo a un solo archivo**, `js/utils.js`, que se carga **antes** que el script de
cada página. Así las tres páginas comparten exactamente las mismas funciones. Es el principio
**DRY** (*Don't Repeat Yourself* → "no te repitas").

### Mejora 2 — Ventanas modales propias en lugar de `prompt()`

Antes, para **editar** un departamento o un empleado usábamos varios `prompt()` seguidos (las
ventanitas grises del navegador). Quedaba feo y, en el caso del empleado, había que **escribir
a mano el número de id** del departamento.

Ahora hay un **modal propio** (`abrirModal()` en `utils.js`): una ventana con un formulario de
verdad, con todos los campos juntos y un `<select>` para elegir el departamento de una lista.
Está hecho con **JavaScript puro + una promesa**, sin sumar librerías nuevas.

### Mejora 3 — Manejo de errores con `try/catch`

Antes, si `json-server` estaba apagado, las llamadas de Axios fallaban **en silencio** (no
pasaba nada visible y costaba darse cuenta del problema). Ahora **todas** las llamadas están
dentro de `try/catch` y, si algo falla, una función común (`manejarError()`) muestra un aviso
claro: *"No se pudo … Revisá que json-server esté corriendo"*.

### Mejora 4 — Fecha en formato ISO uniforme

Antes, al registrar una asistencia, la fecha se guardaba con `toLocaleDateString()`, que da un
formato tipo `10/6/2026`, **distinto** al de los datos de ejemplo (`2025-06-12`). Lo unificamos:
ahora usamos `fechaHoyISO()`, que devuelve la fecha de hoy en formato **ISO** (`AAAA-MM-DD`),
el **mismo** que usa el `<input type="date">` y `db.json`.

---

## 1.c) Mejoras de la tercera versión (rediseño + validaciones)

En esta entrega le dimos **identidad visual propia** y cerramos varios **errores lógicos** que
habíamos detectado probando. Resumen para la defensa:

### Mejora 5 — Rediseño visual editorial (identidad propia)

Cambiamos por completo la **capa visual** (sin tocar la lógica): estilo **editorial/suizo** con
tipografía protagonista, mucho aire y **cero decoración**. Lo importante para explicar:
- **Tokens en `:root`**: colores, tipografías, radios y espaciados están centralizados en
  variables CSS. Ningún componente usa valores "a mano": todos referencian las variables, así
  se puede cambiar la identidad entera tocando un solo lugar.
- **Un solo color de acento** (coral), bordes *hairline* de 1px (nada de sombras), esquinas
  casi rectas, y tres tipografías con un rol claro (display / cuerpo / monoespaciada).
- En vez del avatar de letra con degradé, cada tarjeta lleva un **cuadradito + un código corto
  en mono** (departamento: `SIS`, `RH`, `VEN`…; empleado: sus iniciales).
- **Favicon propio** (`favicon.svg`) y **footer** en franja oscura con los datos del equipo.

### Mejora 6 — Validación de duplicados y datos

Antes se podía crear basura: dos departamentos con el mismo nombre, empleados repetidos, o
varias asistencias del mismo día. Lo cerramos con un `GET` de chequeo **antes** de cada `POST`:
- **Departamentos:** no se permite repetir el **nombre** (comparado sin distinguir
  mayúsculas/espacios), ni al crear ni al editar.
- **Empleados:** si ya hay alguien con ese nombre en el departamento, **avisa y deja confirmar**
  (no bloquea, porque dos personas pueden llamarse igual).
- **Asistencias:** no se permite **dos veces el mismo día** para el mismo empleado.
- **`.trim()`** en todos los campos: no entran textos que sean solo espacios.

### Mejora 7 — Registrar asistencia en cualquier fecha

Antes solo se podía registrar "hoy". Ahora el botón abre el **modal** con dos campos: **fecha**
(por defecto hoy, sin permitir futuro) y **estado**. Reglas:
- No se puede una fecha **futura**.
- Si cargás **hoy** y falta **ayer**, te **avisa** (sin trabarte).
- El historial se **ordena por fecha** (no por `id`), así una fecha vieja cargada hoy queda en
  su lugar cronológico correcto.

### Mejora 8 — Navegación por el DOM en tabs y footer

Las **tabs del header** y los **enlaces del footer** ahora navegan (antes eran solo
indicadores), usando el **mismo mecanismo** que los botones de las tarjetas (`localStorage` +
`window.location.href`). Una sola función, `activarNavegacion()`, engancha a cualquier elemento
con `data-nav`. "Empleados" y "Asistencias" quedan **deshabilitados** si todavía no se eligió un
departamento/empleado (no habría nada que mostrar).

---

## 2) Práctica — Explicación del código

Cada archivo JavaScript maneja **una página** y tiene sus funciones **separadas por
responsabilidad**: una para leer/cargar, una para renderizar, una para crear, una para
editar y una para eliminar.

Las líneas se clasifican en **[FÁCIL]**, **[MEDIA]** o **[DIFÍCIL]** según su complejidad.

### Conceptos base que se repiten en todos los archivos

```js
const API = "http://localhost:3000";
```
**[FÁCIL]** Guardamos la dirección de la API en una constante. Así, si cambia el puerto,
lo cambiamos en un solo lugar.

```js
document.addEventListener("DOMContentLoaded", cargarDepartamentos);
```
**[MEDIA]** `addEventListener` "escucha" un evento. `DOMContentLoaded` se dispara cuando el
HTML terminó de cargar; recién ahí pedimos los datos (si lo hiciéramos antes, los
contenedores podrían no existir todavía).

```js
async function cargarDepartamentos() {
  const respuesta = await axios.get(`${API}/departamentos`);
  const departamentos = respuesta.data;
}
```
**[DIFÍCIL]** `async/await`: `axios.get(...)` devuelve una **promesa** (la respuesta tarda).
`await` **pausa** la función hasta que llega la respuesta, sin congelar la página. Los datos
siempre se leen desde **`response.data`** (Axios ya los convierte de JSON a objeto/array).

---

### Archivo `js/utils.js` (funciones compartidas)

Este archivo **no maneja ninguna página en particular**: junta las funciones que usan las tres.
Se carga **antes** que el resto (mirá el orden de los `<script>` en cada HTML), así cuando corre
`departamentos.js`, `empleados.js` o `asistencias.js`, estas funciones **ya existen**.

```js
const API = "http://localhost:3000";
```
**[FÁCIL]** La dirección de la API ahora vive **acá y en ningún otro lado**. Antes estaba repetida
en los tres archivos. Por eso la quitamos de cada página: dejarla dos veces daría error
(`const` no se puede declarar dos veces con el mismo nombre).

#### Identificadores de tarjeta: `iniciales()` y `codigoDepartamento()`
Con el rediseño, la tarjeta ya no usa un avatar de letra con color: usa un **cuadradito + un
código corto en mono**. Estas dos funciones arman ese código.

```js
function iniciales(nombre) {
  const partes = nombre.trim().split(" ");
  const primera = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primera + ultima).toUpperCase();
}
```
**[MEDIA]** Iniciales de un empleado. `split(" ")` parte el nombre en palabras; tomamos la primera
letra de la primera y de la última (`"Laura Martínez"` → `"LM"`) y las pasamos a mayúscula.

```js
const CODIGOS_DEPARTAMENTO = { /* "Ventas": "VTA"  (override opcional) */ };

function codigoDepartamento(nombre) {
  const limpio = nombre.trim();
  if (CODIGOS_DEPARTAMENTO[limpio]) return CODIGOS_DEPARTAMENTO[limpio];
  const palabras = limpio.split(/\s+/);
  if (palabras.length > 1) return palabras.map((p) => p[0]).join("").toUpperCase();
  return limpio.slice(0, 3).toUpperCase();
}
```
**[DIFÍCIL]** Código del departamento. Si está en el objeto de **override** lo usa; si no, lo
calcula: varias palabras → iniciales (`"Recursos Humanos"` → `"RH"`); una sola → primeras 3
letras (`"Sistemas"` → `"SIS"`, `"Ventas"` → `"VEN"`).

#### `fechaHoyISO()` y `fechaRelativaISO(dias)` — fechas en formato ISO
```js
function fechaHoyISO() {
  return new Date().toISOString().slice(0, 10);
}
function fechaRelativaISO(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}
```
**[MEDIA]** `toISOString()` da la fecha como texto (`"2026-06-10T..."`) y `slice(0, 10)` se queda
con `"2026-06-10"`. `fechaRelativaISO(-1)` devuelve **ayer** (lo usamos para avisar si falta
registrar el día anterior).

#### `manejarError(error, accion)` — avisar cuando algo falla
```js
function manejarError(error, accion) {
  console.error(error);
  alert(`No se pudo ${accion}.\n\nRevisá que json-server esté corriendo en ${API}.`);
}
```
**[MEDIA]** Función común para los errores. Deja el detalle técnico en la **consola**
(`console.error`, se ve con F12) y le muestra al usuario un **mensaje entendible** con `alert`.
El parámetro `accion` es el texto que cambia según el caso ("cargar los empleados", "editar el
departamento", etc.).

#### `abrirModal(titulo, campos)` — el formulario emergente (reemplaza a `prompt()`)
Es la función más interesante de las nuevas. Crea una ventana modal con un formulario y devuelve
una **promesa** con lo que cargó el usuario.

```js
function abrirModal(titulo, campos) {
  return new Promise((resolve) => {
    // ... arma el modal en el DOM ...
  });
}
```
**[DIFÍCIL]** Devolvemos `new Promise(...)`. Una **promesa** representa un valor que va a estar
**más tarde** (cuando el usuario toque "Guardar" o "Cancelar"). Por eso, desde afuera, podemos
hacer `const datos = await abrirModal(...)`: el `await` **espera** a que el usuario decida, sin
congelar la página. Esto es lo que `prompt()` hacía "gratis" (frenaba todo), pero ahora lo
controlamos nosotros y con un formulario lindo.

```js
campos.forEach((campo) => {
  let input;
  if (campo.type === "select") {
    input = document.createElement("select");
    campo.options.forEach((op) => {
      const opcion = document.createElement("option");
      opcion.value = op.value;
      opcion.textContent = op.label;
      if (String(op.value) === String(campo.value)) opcion.selected = true;
      input.appendChild(opcion);
    });
  } else {
    input = document.createElement("input");
    input.type = campo.type || "text";
    input.value = campo.value != null ? campo.value : "";
  }
  inputs[campo.name] = input;
  // ...
});
```
**[DIFÍCIL]** Recorremos con `forEach` la lista de **campos** que nos pasaron y, por cada uno,
creamos su input. Si el campo es de tipo `"select"`, armamos un `<select>` con sus opciones (y
dejamos elegida la actual con el `if`). Guardamos cada input en el objeto `inputs` para poder
**leer su valor después**.

```js
form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const valores = {};
  campos.forEach((campo) => {
    valores[campo.name] = inputs[campo.name].value;
  });
  cerrar(valores);          // resolvemos la promesa con los datos
});
cancelar.addEventListener("click", () => cerrar(null)); // canceló → null
```
**[DIFÍCIL]** Cuando se envía el formulario, juntamos todos los valores en un objeto y llamamos a
`cerrar(valores)`, que hace `resolve(valores)` (la promesa entrega los datos). Si el usuario
cancela (botón, clic en el fondo o tecla **Escape**), resolvemos con `null`. Por eso, en cada
edición, lo primero que chequeamos es `if (!datos) return;` → "si canceló, no hago nada".

---

### Archivo `js/departamentos.js`

#### `cargarDepartamentos()` — LEER
Pide todos los departamentos y los dibuja.

```js
listaDepartamentos.innerHTML = "";
```
**[FÁCIL]** Vacía el contenedor antes de redibujar, para no duplicar tarjetas.

```js
departamentos.forEach((depto) => {
  renderizarDepartamento(depto);
});
```
**[MEDIA]** **`forEach`** recorre el array de departamentos y, por cada uno, llama a la
función que lo dibuja. Es el bucle que arma la lista.

#### `renderizarDepartamento(depto)` — RENDERIZAR
Crea en el DOM la tarjeta (`.tile`) de **un** departamento: identificador (cuadradito + código),
nombre, responsable, el conteo de empleados y los botones.

```js
const tileId = document.createElement("div");
tileId.className = "tile-id";
const mark = document.createElement("span");
mark.className = "mark";              // el cuadradito (color desde el CSS)
const code = document.createElement("span");
code.className = "code";
code.textContent = codigoDepartamento(depto.nombre);  // "SIS", "RH", "VEN"...
tileId.appendChild(mark);
tileId.appendChild(code);
```
**[MEDIA]** `createElement` crea las etiquetas desde JS; el **cuadradito** (`.mark`) se pinta con
CSS y el **código** (`.code`) sale de `codigoDepartamento()`. Reemplazó al viejo avatar de letra
con degradé.

```js
verBtn.addEventListener("click", () => verEmpleados(depto.id));
```
**[MEDIA]** Le asignamos al botón qué hacer al hacer clic. Usamos una función flecha para
poder **pasarle el `depto.id`** a `verEmpleados`.

```js
tile.appendChild(head);
tile.appendChild(body);
listaDepartamentos.appendChild(tile);
```
**[FÁCIL]** `appendChild` "cuelga" cada elemento dentro de otro, armando el árbol del DOM.

```js
const total = await contarEmpleados(depto.id);
const num = document.createElement("span");
num.textContent = String(total).padStart(2, "0");   // "02"
cantidad.appendChild(num);
cantidad.append(total === 1 ? " empleado" : " empleados");
```
**[DIFÍCIL]** La tarjeta ya se dibujó; recién ahí pedimos cuántos empleados tiene y completamos
el cartelito (al final, para no alterar el orden). `padStart(2, "0")` agrega el **cero a la
izquierda** (`"02"`) y el **condicional** elige singular ("empleado") o plural ("empleados").

#### `contarEmpleados(id)` — conteo de empleados por departamento
```js
const respuesta = await axios.get(`${API}/empleados?departamentoId=${id}`);
return respuesta.data.length;
```
**[DIFÍCIL]** Usamos un **filtro de json-server** (`?departamentoId=ID`) para traer SOLO los
empleados de ese departamento, y devolvemos `.length` (la cantidad de elementos del array).

#### `crearDepartamento(evento)` — CREAR (POST)
```js
evento.preventDefault();
```
**[MEDIA]** Evita que el formulario recargue la página (comportamiento por defecto del submit).

```js
const respuesta = await axios.post(`${API}/departamentos`, nuevo);
renderizarDepartamento(respuesta.data);
```
**[MEDIA]** `axios.post` crea el registro en la API. Dibujamos lo que devuelve el servidor
(`respuesta.data`, que ya incluye el `id` nuevo) para mostrarlo **al instante, sin recargar**.

#### `editarDepartamento(id)` — ACTUALIZAR (PATCH) **[ahora con modal]**
```js
const actual = (await axios.get(`${API}/departamentos/${id}`)).data;
const datos = await abrirModal("Editar departamento", [
  { name: "nombre", label: "Nombre del departamento", value: actual.nombre },
  { name: "responsable", label: "Responsable", value: actual.responsable },
]);
if (!datos) return; // el usuario canceló
```
**[DIFÍCIL]** Primero traemos el departamento **actual** para **precargar** el formulario (que
los campos aparezcan ya completos). Después abrimos el modal con `await abrirModal(...)`: la
función **espera** a que el usuario guarde o cancele. Si canceló, `datos` es `null` y cortamos.

```js
if (!datos.nombre || !datos.responsable) {
  alert("Datos incompletos. No se guardaron los cambios.");
  return;
}
await axios.patch(`${API}/departamentos/${id}`, {
  nombre: datos.nombre,
  responsable: datos.responsable,
});
```
**[MEDIA]** **Validación** con `if`/`return`: si algún campo quedó vacío, no guardamos. Si está
todo bien, `axios.patch` actualiza solo esos dos campos. Todo el bloque va dentro de un
`try/catch` que, si la API falla, llama a `manejarError()`.

#### `eliminarDepartamento(id)` — ELIMINAR EN CASCADA (DELETE)
```js
const respEmpleados = await axios.get(`${API}/empleados?departamentoId=${id}`);
for (const empleado of respEmpleados.data) {
  const respAsistencias = await axios.get(`${API}/asistencias?empleadoId=${empleado.id}`);
  for (const asistencia of respAsistencias.data) {
    await axios.delete(`${API}/asistencias/${asistencia.id}`);
  }
  await axios.delete(`${API}/empleados/${empleado.id}`);
}
await axios.delete(`${API}/departamentos/${id}`);
```
**[DIFÍCIL]** **Eliminación en cascada**. Como json-server no borra los "hijos"
automáticamente, lo hacemos a mano: primero las asistencias de cada empleado, después los
empleados, y por último el departamento. Usamos `for...of` con `await` para borrar **en orden**.

#### `verEmpleados(id)` — NAVEGAR
```js
localStorage.setItem("departamentoId", id);
window.location.href = "empleados.html";
```
**[MEDIA]** Guardamos el id en **`localStorage`** (memoria del navegador que sobrevive al
cambio de página) y navegamos. Así pasamos el dato de una página a otra **sin query strings**.

#### Identificador de la tarjeta: `codigoDepartamento(nombre)`
El cuadradito + código que va arriba del nombre usa `codigoDepartamento()`, que vive en
`js/utils.js` (ya explicado arriba): si el nombre está en el objeto de override lo usa, si no
calcula el código (varias palabras → iniciales; una sola → primeras 3 letras). El cuadradito
es puro CSS (`.mark`), no lleva color por nombre: el que diferencia es el **código**.

---

### Archivo `js/empleados.js`

#### `const departamentoId = localStorage.getItem("departamentoId");`
**[MEDIA]** Recuperamos el id que guardó la página anterior. Es lo que conecta `index.html`
con `empleados.html`.

#### `iniciar()`
```js
if (!departamentoId) {
  tituloDepartamento.textContent = "No se seleccionó ningún departamento.";
  return;
}
```
**[MEDIA]** **Condicional** de seguridad: si alguien entra directo sin elegir departamento,
avisamos y no seguimos.

#### `mostrarNombreDepartamento()`
```js
const respuesta = await axios.get(`${API}/departamentos/${departamentoId}`);
tituloDepartamento.textContent = `Empleados de ${respuesta.data.nombre}`;
```
**[FÁCIL]** Trae **un** departamento por su id y escribe su nombre en el título.

#### `cargarEmpleados()` — LEER
```js
const respuesta = await axios.get(`${API}/empleados?departamentoId=${departamentoId}`);
respuesta.data.forEach((empleado) => renderizarEmpleado(empleado));
```
**[MEDIA]** Trae **solo** los empleados de este departamento (filtro) y los recorre con
`forEach` para dibujarlos.

#### `renderizarEmpleado(empleado)` — RENDERIZAR
Igual que en departamentos: crea la tarjeta (`.tile`) con `createElement`/`appendChild`, con su
**cuadradito + código en mono** (acá el código son las `iniciales()` del empleado), el nombre, el
cargo, la fecha de ingreso y los botones con `addEventListener`. **[FÁCIL/MEDIA]**

#### `crearEmpleado(evento)` — CREAR (POST)
```js
departamentoId: Number(departamentoId),
```
**[MEDIA]** Convertimos el id a **número** (de localStorage siempre sale como texto) para que
quede igual que en `db.json`.
```js
const respuesta = await axios.post(`${API}/empleados`, nuevo);
renderizarEmpleado(respuesta.data);
```
**[MEDIA]** Crea el empleado y lo muestra al instante.

#### `editarEmpleado(id)` — ACTUALIZAR (PATCH) **[ahora con modal + `<select>`]**
Edita **nombre, cargo y departamento** del empleado. El departamento se elige de una **lista
desplegable** dentro del modal (antes había que escribir el número de id a mano).
```js
const actual = (await axios.get(`${API}/empleados/${id}`)).data;
const departamentos = (await axios.get(`${API}/departamentos`)).data;
const opciones = departamentos.map((depto) => ({
  value: depto.id,
  label: depto.nombre,
}));
```
**[DIFÍCIL]** Traemos el empleado **actual** (para precargar) y todos los departamentos. Con
**`map`** transformamos cada departamento en un objeto `{ value, label }`, que es el formato que
el modal espera para armar las opciones del `<select>`. `map` **devuelve un array nuevo** del
mismo tamaño, con cada elemento transformado (a diferencia de `forEach`, que no devuelve nada).
```js
const datos = await abrirModal("Editar empleado", [
  { name: "nombre", label: "Nombre", value: actual.nombre },
  { name: "cargo", label: "Cargo", value: actual.cargo },
  { name: "departamentoId", label: "Departamento", type: "select",
    value: actual.departamentoId, options: opciones },
]);
if (!datos) return;
```
**[DIFÍCIL]** Abrimos el modal con los **tres campos**; el último es de tipo `"select"` y recibe
las `opciones` que armamos con `map`. El modal ya deja **elegido** el departamento actual. Como
el `<select>` solo deja elegir opciones reales, **ya no hace falta** validar el id con `find`.
```js
await axios.patch(`${API}/empleados/${id}`, {
  nombre: datos.nombre,
  cargo: datos.cargo,
  departamentoId: Number(datos.departamentoId),
});
```
**[MEDIA]** Guardamos los tres campos. **Importante:** si el empleado cambió de departamento,
al recargar la lista (que está filtrada por el departamento actual) **ya no aparece**, porque
ahora pertenece a otra área. Es el comportamiento esperado de una reasignación.

#### `eliminarEmpleado(id)` — ELIMINAR EN CASCADA (DELETE)
```js
const respAsistencias = await axios.get(`${API}/asistencias?empleadoId=${id}`);
for (const asistencia of respAsistencias.data) {
  await axios.delete(`${API}/asistencias/${asistencia.id}`);
}
await axios.delete(`${API}/empleados/${id}`);
```
**[DIFÍCIL]** Antes de borrar al empleado, borramos todas **sus** asistencias.

#### `verAsistencias(id)` — NAVEGAR
Guarda `empleadoId` en `localStorage` y va a `asistencias.html`. **[MEDIA]**

---

### Archivo `js/asistencias.js`

#### `const ESTADOS = ["Presente", "Ausente", "Tardanza"];`
**[FÁCIL]** Un array con los tres estados posibles; lo usamos para armar el selector.

#### `cargarAsistencias()` — LEER + ORDENAR
```js
asistencias.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);
```
**[DIFÍCIL]** **Ordenamiento por fecha, de la más reciente a la más antigua.** Como la fecha está
en formato ISO (`AAAA-MM-DD`), `localeCompare` compara los **textos** y eso ya da el orden
cronológico. Si dos asistencias son del **mismo día**, desempata el `id` (`b.id - a.id`). *¿Por
qué por fecha y no por id?* Porque ahora se pueden cargar fechas pasadas (ej: ayer); si ordenáramos
por id, una fecha vieja cargada hoy quedaría arriba de todo.
```js
asistencias.forEach((asistencia) => renderizarAsistencia(asistencia));
```
**[MEDIA]** Recorre las asistencias **ya ordenadas** y las dibuja.

#### `renderizarAsistencia(asistencia)` — RENDERIZAR
Arma una fila (`.row-item`) con un **cuadradito de estado + el texto del estado** (siempre
visible), la fecha, el selector de estado y el botón de eliminar.
```js
const claseColor = "is-" + asistencia.estado.toLowerCase();
const marca = document.createElement("span");
marca.className = "row-icon " + claseColor;          // cuadradito coloreado por estado
const estadoTexto = document.createElement("span");
estadoTexto.className = "row-state " + claseColor;
estadoTexto.textContent = asistencia.estado;          // texto SIEMPRE visible
```
**[MEDIA]** Armamos la clase de color desde el estado (`"Presente"` → `"is-presente"`); el CSS
pinta el cuadradito y el texto con `--ink` / `--muted` / `--accent`. Mostramos **siempre el texto
del estado** al lado (accesibilidad: no dependemos solo del color).
```js
ESTADOS.forEach((estado) => {
  const opcion = document.createElement("option");
  opcion.value = estado;
  opcion.textContent = estado;
  if (estado === asistencia.estado) opcion.selected = true;
  select.appendChild(opcion);
});
```
**[DIFÍCIL]** Arma un `<select>` con las tres opciones usando `forEach`, y deja
**seleccionada** la que coincide con el estado actual (condicional `if`).
```js
select.addEventListener("change", () => editarAsistencia(asistencia.id, select.value));
```
**[MEDIA]** Cuando el usuario cambia el estado en el selector, se guarda automáticamente.

#### `crearAsistencia()` — CREAR (POST) **[ahora con modal: fecha + estado]**
```js
const hoy = fechaHoyISO();
const datos = await abrirModal("Registrar asistencia", [
  { name: "fecha", label: "Fecha", type: "date", value: hoy, max: hoy },
  { name: "estado", label: "Estado", type: "select", value: "Presente",
    options: ESTADOS.map((e) => ({ value: e, label: e })) },
]);
if (!datos) return;
if (datos.fecha > hoy) { alert("No se puede registrar una fecha futura."); return; }
```
**[DIFÍCIL]** Abrimos el modal con **fecha** (por defecto hoy, y `max: hoy` para que el calendario
no deje elegir futuro) y **estado**. El `if (datos.fecha > hoy)` es la red de seguridad por las
dudas (comparación de textos ISO).
```js
// No duplicar el día
const mismaFecha = (await axios.get(`${API}/asistencias?empleadoId=${empleadoId}&fecha=${datos.fecha}`)).data;
if (mismaFecha.length > 0) { alert("Ya hay una asistencia para esa fecha."); return; }

// Aviso si falta ayer (solo cuando se carga hoy)
if (datos.fecha === hoy) {
  const ayer = fechaRelativaISO(-1);
  const deAyer = (await axios.get(`${API}/asistencias?empleadoId=${empleadoId}&fecha=${ayer}`)).data;
  if (deAyer.length === 0 && !confirm("Te falta registrar ayer. ¿Registrás hoy igual?")) return;
}
await axios.post(`${API}/asistencias`, { empleadoId: Number(empleadoId), fecha: datos.fecha, estado: datos.estado });
cargarAsistencias();
```
**[DIFÍCIL]** Antes de crear: con un `GET` filtrado por `empleadoId` **y** `fecha` chequeamos que
no haya ya una asistencia ese día (si hay, cortamos). Si se está cargando **hoy** y falta **ayer**,
avisamos con `confirm` (pero no trabamos). Recién entonces hacemos el `POST` y redibujamos.

#### `editarAsistencia(id, nuevoEstado)` — ACTUALIZAR (PATCH)
```js
await axios.patch(`${API}/asistencias/${id}`, { estado: nuevoEstado });
```
**[FÁCIL]** Cambia el estado entre Presente / Ausente / Tardanza.

#### `eliminarAsistencia(id)` — ELIMINAR (DELETE)
```js
await axios.delete(`${API}/asistencias/${id}`);
```
**[FÁCIL]** Borra **solo** ese registro (las asistencias no tienen "hijos", así que no hay
cascada).

---

### Resumen de los conceptos clave (para la defensa)

| Concepto | Dónde verlo |
|---|---|
| `async/await` | en todas las funciones que usan `axios` |
| `response.data` | después de cada `axios.get/post` |
| `axios.get / post / patch / delete` | uno por cada operación CRUD |
| `forEach` | al renderizar las tres listas y al armar los campos del modal |
| `map` | en `editarEmpleado()`, para armar las opciones del `<select>` |
| `addEventListener` | submit del form, clic de botones, change del select |
| `localStorage` | `setItem` al navegar, `getItem` al cargar la página siguiente |
| Conteo por departamento | `contarEmpleados()` con `.length` |
| Eliminación en cascada | `eliminarDepartamento()` y `eliminarEmpleado()` |
| Ordenamiento | `asistencias.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)` |
| Identificador de tarjeta | cuadradito + código en mono (`iniciales()` / `codigoDepartamento()`) |
| Condicional singular/plural | conteo en `renderizarDepartamento()` |
| **Código compartido (DRY)** | `js/utils.js` (lo usan las tres páginas) |
| **Promesas** | `abrirModal()` devuelve `new Promise`; se usa con `await` |
| **Manejo de errores** | `try/catch` en cada llamada + `manejarError()` |
| **Fecha ISO** | `fechaHoyISO()` / `<input type="date">` en `crearAsistencia()` |
| **Validación de duplicados** | `GET` + `some()` antes del `POST` (depto/empleado/asistencia) |
| **Navegación por el DOM** | `activarNavegacion()` en tabs y footer (`data-nav`) |
| **Tokens / identidad** | variables CSS en `:root` (`css/styles.css`) |

---

## 3) Integrantes del grupo

- **Juan Diaz**
- **Luciano Bravo**
- **Segura Heredia Constanza**

---

## 4) División de la exposición

El temario se reparte entre los **3 integrantes**. Cada uno expone su **teoría** y muestra las
**funciones reales** del proyecto. Como ahora somos 3, los temas que antes eran de un cuarto
integrante (**Objetos, Arrays, Métodos y Bucles**) se repartieron: los **métodos de array** van
con Luciano (que maneja los datos de la API) y los **objetos / estructura de datos** van con
Constanza (que maneja el CRUD).

### 🟦 Juan Diaz — DOM, Navegación e Identidad visual

**Teoría a exponer:**
- Qué es el **DOM** (el árbol de elementos que JS puede modificar).
- **Eventos** y `addEventListener` (click, submit, change, y la tecla Escape en el modal).
- **Render dinámico**: crear contenido desde JS con `createElement`, `appendChild`,
  `textContent` y `style`.
- **Navegación con `localStorage`** (en vez de query strings): en los botones de las tarjetas y
  ahora también en las **tabs del header y los enlaces del footer**.
- **El modal propio** (`abrirModal`): cómo se arma una ventana emergente con JS puro.
- **Identidad visual con tokens CSS**: cómo `:root` centraliza colores y tipografías, y por qué
  el **cuadradito + código en mono** reemplazó al viejo avatar.

**Qué se hizo y por qué así:**
- El HTML **solo tiene contenedores vacíos** y **todo el contenido lo crea el JavaScript**.
  *¿Por qué?* La consigna pide manipular el DOM dinámicamente con datos de la API.
- La navegación pasa el id elegido por **`localStorage`** y cambia de página con
  `window.location.href`. *¿Por qué localStorage?* La consigna pide usarlo en vez de query strings.
- **Las tabs del header y los enlaces del footer ahora navegan** (antes eran solo indicadores).
  Una sola función, `activarNavegacion()`, engancha a cualquier elemento con `data-nav`.
  *¿Por qué se deshabilitan "Empleados"/"Asistencias" a veces?* Porque necesitan un
  departamento/empleado ya elegido; sin esa selección no habría nada que mostrar.
- En vez del avatar de letra con degradé, cada tarjeta muestra un **cuadradito + un código corto
  en mono** (`createElement` + clases CSS). *¿Por qué?* Identidad propia, sin imágenes externas.
- **El `prompt()` se reemplazó por un modal propio**, armado **enteramente con el DOM**
  (`createElement` del fondo, la caja, el formulario, los inputs y los botones; `overlay.remove()`
  al cerrar).
- **Rediseño editorial con tokens**: toda la identidad (colores, tipografías, radios, espaciados)
  vive en variables CSS en `:root`. *¿Por qué?* Para cambiar el estilo entero desde un solo lugar.
  El **footer** es una franja oscura con los datos del equipo.

**Código concreto a mostrar:**
- `renderizarDepartamento()` / `renderizarEmpleado()` / `renderizarAsistencia()`
  (`createElement` + `appendChild` + `textContent`) y el cuadradito + código (`codigoDepartamento`).
- `abrirModal()` en `utils.js`: cómo construye el formulario y el `<select>` en el DOM.
- `activarNavegacion()` (tabs + footer con `data-nav`), y `verEmpleados()` / `verAsistencias()`
  (`localStorage.setItem` + `window.location.href`).
- El bloque de **tokens** en `:root` de `css/styles.css` y el `<footer>` de las páginas.

*Cómo presentarlo:* abrir `index.html`, mostrar que la lista está vacía en el HTML y que las
tarjetas las crea el JS. Mostrar el **modal** al editar (cerrarlo con Escape), las **tabs/footer**
navegando (y deshabilitadas sin selección), y en DevTools → Application → Local Storage el
`departamentoId` guardado.

---

### 🟩 Luciano Bravo — Axios, async/await, Promesas, Errores y Métodos de array

**Teoría a exponer:**
- Qué es una **API REST** y qué es la **API fake** (json-server convierte `db.json` en API).
- Los **cuatro métodos** de Axios: `get` (leer), `post` (crear), `patch` (actualizar),
  `delete` (borrar).
- **Promesas** y por qué usamos `async/await` (esperar la respuesta sin congelar la página).
- Por qué leemos siempre desde **`response.data`**.
- **Manejo de errores** con `try/catch` (Mejora 3).
- **Métodos de array** sobre los datos que vuelven de la API: `forEach` (recorrer), `map`
  (transformar), `sort` (ordenar) y `.length` (contar).

**Qué se hizo y por qué así:**
- **Toda** la comunicación de datos pasa por **Axios** apuntando a `http://localhost:3000`
  (nada de `fetch`). *¿Por qué?* Es lo que pide la consigna y centraliza las llamadas.
- Se usa **`async/await`** en vez de `.then()`. *¿Por qué?* El código se lee de arriba hacia
  abajo, como si fuera paso a paso, y es mucho más fácil de entender y explicar.
- Siempre se lee **`response.data`** sin tocarla a mano. *¿Por qué?* Axios ya convierte el
  JSON en objeto/array; manipularla sería rehacer lo que la librería ya hizo.
- Se usan los **filtros de json-server** (`?departamentoId=`, `?empleadoId=`). *¿Por qué?*
  Para traer del servidor **solo lo necesario**, en vez de bajar todo y filtrar en el navegador.
- Se eligió **json-server 0.17.4**. *¿Por qué?* Da `id` numéricos e incrementales (1, 2, 3…) y
  soporta `--watch`; la versión nueva rompe el orden de asistencias con ids aleatorios.
- **Todas las llamadas van dentro de `try/catch`** y, si fallan, llaman a `manejarError()`.
  *¿Por qué?* Antes, si json-server estaba apagado, la página fallaba **en silencio**; ahora
  avisa con un mensaje claro.
- El modal (`abrirModal`) **devuelve una Promesa**. *¿Por qué?* Para poder hacer
  `const datos = await abrirModal(...)` y **esperar** la decisión del usuario igual que se
  espera una respuesta de Axios. Es el mismo concepto de promesa que hay detrás de `async/await`.
- **`map`** arma las opciones del `<select>` en `editarEmpleado()`. *¿Por qué map y no forEach?*
  Porque `map` **devuelve un array nuevo** transformado (cada depto → `{ value, label }`),
  justo lo que necesita el modal.
- **Chequeo de duplicados con un `GET` antes del `POST`**: traemos la lista (o la filtrada) y
  comparamos con `some()`. *¿Por qué un GET extra?* json-server no tiene "campos únicos", así que
  la unicidad la validamos nosotros antes de crear.
- **El orden de asistencias pasó a ser por `fecha`** (no por `id`): como la fecha es ISO,
  comparar los textos da el orden cronológico (`b.fecha.localeCompare(a.fecha)`). *¿Por qué?* Para
  que una fecha vieja cargada hoy quede en su lugar y no arriba de todo.

**Código concreto a mostrar:**
- `cargarDepartamentos()` / `cargarEmpleados()` / `cargarAsistencias()` (`axios.get` +
  `response.data` + `forEach` para recorrer).
- `crearDepartamento()` / `crearEmpleado()` / `crearAsistencia()` (`axios.post`), con el
  **`GET` de chequeo + `some()`** antes de crear.
- `editarAsistencia()` / `editarDepartamento()` / `editarEmpleado()` (`axios.patch`).
- `eliminarAsistencia()` (`axios.delete`) y `contarEmpleados()` (filtro + `.length`).
- `manejarError()` y el `try { ... } catch (error) { manejarError(...) }` que envuelve todo.
- `new Promise(...)` / `resolve(...)` dentro de `abrirModal()`, y `map` + `sort` por fecha.

*Cómo presentarlo:* levantar `json-server` en vivo, abrir `http://localhost:3000/empleados`
para mostrar la API, y explicar el viaje pedido → respuesta → `response.data` → pantalla.
**Apagar json-server** y mostrar que ahora salta el aviso de error (gracias al `try/catch`).

---

### 🟨 Segura Heredia Constanza — CRUD, Condicionales y Estructura de datos

**Teoría a exponer:**
- Concepto de **CRUD completo** (Crear, Leer, Actualizar, Eliminar) sobre cada entidad.
- En detalle **Actualizar (`patch`)** y **Eliminar (`delete`)**.
- **Eliminación en cascada** con `for...of` + `await` (bucle).
- **Condicionales/validaciones** (`if`, `return`, `confirm`).
- **Estructura de datos**: cómo está armado `db.json` (objetos relacionados por id) y cómo se
  arman los objetos `nuevo`/`nueva` que se mandan a la API.

**Qué se hizo y por qué así:**
- `db.json` modela **tres "tablas"** (departamentos, empleados, asistencias) relacionadas por
  id. *¿Por qué así?* Es un modelo **padre → hijo**: el empleado guarda el `departamentoId` y
  la asistencia el `empleadoId`, igual que una base de datos real.
- Los objetos `nuevo`/`nueva` se **arman en JS** y se mandan con `post`; el `id` lo pone la
  API. *¿Por qué?* Para no inventar ids a mano y evitar repetidos.
- Cada entidad tiene las **4 operaciones**, en **funciones separadas por responsabilidad**
  (una para crear, una para renderizar, una para editar, una para eliminar). *¿Por qué?* Lo
  pide la consigna y deja el código ordenado y fácil de explicar.
- **Eliminación en cascada hecha a mano**: al borrar, primero los hijos y al final el padre
  (asistencias → empleados → departamento). *¿Por qué?* json-server **no** borra los hijos
  solos; si no lo hiciéramos quedarían empleados y asistencias **huérfanos**. Se usa `for...of`
  con `await` para borrarlos **en orden**.
- **Validaciones con `if`/`return` y `confirm`**. *¿Por qué?* El `confirm` evita borrados
  accidentales; el `if (!datos) return` corta si el usuario cierra el modal, y el
  `if (!datos.nombre || ...)` evita guardar campos vacíos.
- `editarEmpleado()` permite **reasignar el departamento** desde un `<select>`. *¿Por qué
  desaparece de la lista?* Al cambiarlo de área deja de pertenecer al departamento que se está
  viendo: se respeta la relación entre las tablas. *(Antes había que validar el id a mano con
  `find`; ahora, como el `<select>` solo ofrece opciones reales, esa validación ya no hace
  falta.)*
- **Validación de duplicados** (todas son condicionales): departamentos no repiten **nombre**
  (bloquea), empleados avisan con `confirm` si el nombre ya existe (deja seguir), y asistencias
  no se cargan **dos veces el mismo día** (bloquea). Más `.trim()` para no aceptar espacios
  vacíos. *¿Por qué distinto en cada caso?* Un área no se repite; una persona sí puede llamarse
  igual; un día de asistencia es único por empleado.
- **Registrar asistencia en cualquier fecha**: el modal pide **fecha** (por defecto hoy, sin
  permitir futuro) y **estado**. Si falta el día anterior, **avisa** (no traba). Todo con
  `if`/`return`/`confirm`. *¿Por qué?* Para poder cargar días pasados (ej: ayer) sin romper nada.

**Código concreto a mostrar:**
- La estructura de `db.json` (las tres "tablas" y sus relaciones) y los objetos `nuevo`/`nueva`
  de `crearEmpleado()` / `crearAsistencia()`.
- `eliminarDepartamento()` (cascada completa: asistencias → empleados → departamento) y
  `eliminarEmpleado()` (cascada: asistencias → empleado), con el `for...of` + `await`.
- Las **validaciones de duplicados** en `crearDepartamento()` / `crearEmpleado()` /
  `crearAsistencia()` (chequeo + `if`/`return`/`confirm`) y el `.trim()` de los campos.
- `editarDepartamento()` / `editarEmpleado()`: el flujo con el modal y las validaciones.
- Los `confirm(...)` y el condicional singular/plural del conteo en `renderizarDepartamento()`.

*Cómo presentarlo:* borrar un departamento en vivo y mostrar que desaparecen sus empleados y
asistencias. Intentar crear un departamento repetido (lo bloquea) y un empleado repetido (avisa).
En Asistencias, registrar **ayer** y **hoy** desde el modal, e intentar duplicar un día o poner
una fecha futura (no deja).
