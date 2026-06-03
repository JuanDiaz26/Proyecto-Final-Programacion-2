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
- **CSS con Bootstrap 5** (por CDN) como base, más un **tema propio** (`css/styles.css`) que
  le da el aspecto moderno y claro: tarjetas, avatares con iniciales y colores por estado.
- **JavaScript puro (vanilla)** — sin React, sin Vue, sin frameworks.
- **Axios** (por CDN) para hacer las peticiones HTTP a la API.
- **json-server** como **API REST fake**: convierte el archivo `db.json` en una API real
  con los endpoints `/departamentos`, `/empleados` y `/asistencias`.

### Estructura de archivos

```
Proyecto Final - Programacion 2/
├── index.html          → CRUD de Departamentos (página de inicio)
├── empleados.html      → CRUD de Empleados (del departamento elegido)
├── asistencias.html    → CRUD de Asistencias (del empleado elegido)
├── js/
│   ├── departamentos.js
│   ├── empleados.js
│   └── asistencias.js
├── css/
│   └── styles.css      → tema visual propio (look moderno sobre Bootstrap)
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
Crea en el DOM la tarjeta (`.tile`) de **un** departamento: avatar con iniciales, nombre,
responsable, el conteo de empleados y los botones.

```js
const avatar = document.createElement("div");
avatar.className = "avatar";
avatar.textContent = iniciales(depto.nombre);
avatar.style.background = gradienteAvatar(depto.nombre);
```
**[MEDIA]** `createElement` crea la etiqueta desde JS; `textContent` le pone las iniciales y
`style.background` el color. Las iniciales y el color salen de dos funciones auxiliares (más abajo).

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
cantidad.textContent = total === 1 ? "1 empleado" : `${total} empleados`;
```
**[DIFÍCIL]** La tarjeta ya se dibujó; recién ahí pedimos cuántos empleados tiene y completamos
el cartelito (al final, para no alterar el orden). El **condicional** elige singular
("1 empleado") o plural ("3 empleados").

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

#### `editarDepartamento(id)` — ACTUALIZAR (PATCH)
```js
if (!nuevoNombre || !nuevoResponsable) {
  alert("Datos incompletos. No se guardaron los cambios.");
  return;
}
```
**[MEDIA]** **Condicional / validación**: si algún dato vino vacío, cortamos con `return`.

```js
await axios.patch(`${API}/departamentos/${id}`, { nombre, responsable });
```
**[FÁCIL]** `axios.patch` actualiza solo los campos que le mandamos.

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

#### `iniciales(nombre)` y `gradienteAvatar(nombre)` — AUXILIARES DEL AVATAR
```js
function iniciales(nombre) {
  const partes = nombre.trim().split(" ");
  const primera = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primera + ultima).toUpperCase();
}
```
**[MEDIA]** Devuelve las iniciales de un nombre. `split(" ")` parte el texto en palabras, toma
la primera letra de la primera y de la última (`"Laura Martínez"` → `"LM"`) y las pasa a
mayúscula con `toUpperCase()`.
```js
function gradienteAvatar(nombre) {
  const indice = nombre.charCodeAt(0) % GRADIENTES.length;
  return GRADIENTES[indice];
}
```
**[DIFÍCIL]** Elige un color fijo para el avatar según el nombre. `charCodeAt(0)` toma el
código de la primera letra y con `%` (resto de la división) obtiene un índice válido del
array `GRADIENTES`. Mismo nombre → siempre el mismo color.

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
Igual que en departamentos: crea la tarjeta (`.tile`) con `createElement`/`appendChild`, con
su **avatar de iniciales** (usando `iniciales()` y `gradienteAvatar()`), el nombre, el cargo,
la fecha de ingreso y los botones con `addEventListener`. **[FÁCIL/MEDIA]**

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

#### `editarEmpleado(id)` — ACTUALIZAR (PATCH)
Edita **nombre, cargo y departamento** del empleado.
```js
const respuesta = await axios.get(`${API}/departamentos`);
departamentos.forEach((depto) => {
  opciones += `${depto.id} - ${depto.nombre}\n`;
});
const elegido = prompt(opciones, departamentoId);
const existe = departamentos.find((depto) => depto.id === Number(elegido));
```
**[DIFÍCIL]** Para cambiar de área traemos los departamentos, armamos la lista de opciones
con `forEach`, la mostramos en un `prompt` (con el departamento actual como valor por
defecto) y validamos con **`find`** que el id elegido exista de verdad.
```js
await axios.patch(`${API}/empleados/${id}`, { nombre, cargo, departamentoId: Number(elegido) });
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
asistencias.sort((a, b) => b.id - a.id);
```
**[DIFÍCIL]** **Ordenamiento del más reciente al más antiguo.** `sort` ordena el array; con
`b.id - a.id` ordena de **mayor a menor id**. Como json-server asigna ids crecientes, el id
más alto es el registro más nuevo → queda primero el más reciente.
```js
asistencias.forEach((asistencia) => renderizarAsistencia(asistencia));
```
**[MEDIA]** Recorre las asistencias **ya ordenadas** y las dibuja.

#### `renderizarAsistencia(asistencia)` — RENDERIZAR
Arma una fila (`.row-item`) con un ícono de calendario coloreado según el estado, la fecha,
el selector de estado y el botón de eliminar.
```js
const claseColor = "is-" + asistencia.estado.toLowerCase();
const icono = document.createElement("div");
icono.className = "row-icon " + claseColor;
icono.innerHTML = ICONO_CALENDARIO;
```
**[MEDIA]** Armamos el nombre de la clase de color desde el estado (`"Presente"` →
`"is-presente"`) y se la sumamos al ícono; el CSS lo pinta verde / rojo / ámbar. `innerHTML`
mete el dibujo SVG del calendario dentro del recuadro.
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

#### `crearAsistencia()` — CREAR (POST)
```js
fecha: new Date().toLocaleDateString(),
estado: "Presente",
```
**[MEDIA]** La **fecha se pone automática** (la de hoy) y el estado arranca en "Presente".
```js
await axios.post(`${API}/asistencias`, nueva);
cargarAsistencias();
```
**[MEDIA]** Crea la asistencia y vuelve a dibujar todo para que la nueva quede **arriba**.

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
| `forEach` | al renderizar las tres listas |
| `addEventListener` | submit del form, clic de botones, change del select |
| `localStorage` | `setItem` al navegar, `getItem` al cargar la página siguiente |
| Conteo por departamento | `contarEmpleados()` con `.length` |
| Eliminación en cascada | `eliminarDepartamento()` y `eliminarEmpleado()` |
| Ordenamiento | `asistencias.sort((a, b) => b.id - a.id)` |
| Búsqueda / validación | `find` en `editarEmpleado()` (valida el departamento elegido) |
| Avatares (iniciales + color) | `iniciales()` y `gradienteAvatar()` (`split`, `charCodeAt`, `%`) |
| Condicional singular/plural | conteo en `renderizarDepartamento()` |

---

## 3) Integrantes del grupo

- **Juan Diaz**
- **Luciano Bravo**
- **Segura Heredia Constanza**
- **Medinas Maria Belen**

---

## 4) División de la exposición

El temario se reparte entre los 4 integrantes. Cada uno expone su **teoría** y muestra las
**funciones reales** del proyecto.

### 🟦 Juan Diaz — DOM y Navegación

**Teoría a exponer:**
- Qué es el **DOM** (el árbol de elementos de la página que JS puede modificar).
- **Eventos** y `addEventListener` (click, submit, change).
- **Render dinámico**: crear contenido desde JS con `createElement`, `appendChild`,
  `textContent`, `innerHTML` y `style`.
- **Navegación entre páginas con `localStorage`** (en vez de query strings).

**Qué se hizo y por qué así:**
- El HTML **solo tiene contenedores vacíos** (`<div id="listaDepartamentos">`, etc.) y
  **todo el contenido lo crea el JavaScript**. *¿Por qué?* La consigna pide manipular el DOM
  dinámicamente y que los datos vengan de la API, no escritos a mano en el HTML.
- La navegación se hace con **botones creados/asignados por JS + `localStorage`**, no con la
  URL. *¿Por qué localStorage?* Hay que pasar el id elegido de una página a la siguiente, y la
  consigna pide explícitamente usar localStorage en lugar de query strings.
- La barra de arriba (*Departamentos › Empleados › Asistencias*) es **solo un indicador
  visual, no navega**. *¿Por qué?* Empleados necesita un departamento elegido y Asistencias un
  empleado elegido; sin ese id la página no sabría qué mostrar.
- Los **avatares con iniciales** se dibujan con `createElement` + `style.background`. *¿Por
  qué?* Para que la interfaz no dependa de imágenes externas: el "ícono" es puro DOM + CSS.

**Código concreto a mostrar:**
- `renderizarDepartamento()`, `renderizarEmpleado()`, `renderizarAsistencia()`
  (`createElement` + `appendChild` + `textContent` + `style`).
- `verEmpleados()` y `verAsistencias()` (`localStorage.setItem` + `window.location.href`).
- Los `addEventListener` de los botones "Volver"/"Ver…", del **submit** del formulario y del
  **change** del selector de estado.
- `ICONO_CALENDARIO` insertado con `innerHTML`, y `document.addEventListener("DOMContentLoaded", …)`.

*Cómo presentarlo:* abrir `index.html`, mostrar que el `<div id="listaDepartamentos">` está
vacío y que las tarjetas aparecen porque las crea el JS. Hacer clic en "Ver empleados" y
mostrar en DevTools → Application → Local Storage cómo se guardó el `departamentoId`.

---

### 🟩 Luciano Bravo — Axios, async/await y json-server

**Teoría a exponer:**
- Qué es una **API REST** y qué es la **API fake** (json-server convierte `db.json` en API).
- Los **cuatro métodos** de Axios: `get` (leer), `post` (crear), `patch` (actualizar),
  `delete` (borrar).
- **Promesas** y por qué usamos `async/await` (esperar la respuesta sin congelar la página).
- Por qué leemos siempre desde **`response.data`**.

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

**Código concreto a mostrar:**
- `cargarDepartamentos()` / `cargarEmpleados()` / `cargarAsistencias()` (`axios.get` + `response.data`).
- `crearDepartamento()` / `crearEmpleado()` / `crearAsistencia()` (`axios.post`).
- `editarAsistencia()` / `editarDepartamento()` / `editarEmpleado()` (`axios.patch`).
- `eliminarAsistencia()` (`axios.delete`).
- `contarEmpleados()` y `editarEmpleado()` con el **filtro**/lectura extra de la API.

*Cómo presentarlo:* levantar `json-server` en vivo, abrir `http://localhost:3000/empleados`
para mostrar la API, y explicar el viaje pedido → respuesta → `response.data` → pantalla.

---

### 🟨 Segura Heredia Constanza — CRUD y Condicionales

**Teoría a exponer:**
- Concepto de **CRUD completo** (Crear, Leer, Actualizar, Eliminar) sobre cada entidad.
- En detalle **Actualizar (`patch`)** y **Eliminar (`delete`)**.
- **Eliminación en cascada** y **condicionales/validaciones** (`if`, `return`, `confirm`).

**Qué se hizo y por qué así:**
- Cada entidad tiene las **4 operaciones**, en **funciones separadas por responsabilidad**
  (una para crear, una para renderizar, una para editar, una para eliminar). *¿Por qué?* Lo
  pide la consigna y deja el código ordenado y fácil de explicar.
- **Eliminación en cascada hecha a mano**: al borrar, primero los hijos y al final el padre
  (asistencias → empleados → departamento). *¿Por qué?* json-server **no** borra los hijos
  solos; si no lo hiciéramos quedarían empleados y asistencias **huérfanos** apuntando a algo
  que ya no existe. Se usa `for...of` con `await` para borrarlos **en orden**.
- **Validaciones con `if`/`return` y `confirm`**. *¿Por qué?* El `confirm` evita borrados
  accidentales; el `if (!dato) return` evita guardar campos vacíos.
- `editarEmpleado()` permite **reasignar el departamento** y valida con `find` que el id
  exista. *¿Por qué desaparece de la lista?* Al cambiarlo de área deja de pertenecer al
  departamento que se está viendo: se respeta la relación entre las tablas.

**Código concreto a mostrar:**
- `eliminarDepartamento()` (cascada completa: asistencias → empleados → departamento).
- `eliminarEmpleado()` (cascada: asistencias → empleado).
- `editarDepartamento()` / `editarEmpleado()` (validación con `if` + `find` + `axios.patch`).
- Los `confirm(...)`, los `if (!dato) { … return; }` y el condicional singular/plural del conteo.

*Cómo presentarlo:* borrar un departamento en vivo y mostrar (en las URLs de la API) que
también desaparecen sus empleados y asistencias. Intentar editar dejando un campo vacío para
mostrar la validación, y reasignar un empleado a otro departamento.

---

### 🟥 Medinas Maria Belen — Objetos, Arrays, Métodos y Bucles

**Teoría a exponer:**
- **Estructura de datos**: cómo está armado `db.json` (objetos con propiedades) y cómo se
  relacionan por `id` / `departamentoId` / `empleadoId`.
- **Arrays** y **objetos** en JavaScript.
- **Métodos de array**: `forEach` (recorrer), `sort` (ordenar), `find` (buscar) y `.length`
  (contar); además `split` y `charCodeAt` en las funciones del avatar.

**Qué se hizo y por qué así:**
- `db.json` modela **tres "tablas"** (departamentos, empleados, asistencias) relacionadas por
  id. *¿Por qué así?* Es un modelo **padre → hijo**: el empleado guarda el `departamentoId` y
  la asistencia el `empleadoId`, igual que una base de datos real.
- Los objetos `nuevo`/`nueva` se **arman en JS** y se mandan con `post`; el `id` lo pone la
  API. *¿Por qué?* Para no inventar ids a mano y evitar repetidos.
- Se usa **`forEach`** para dibujar todas las listas. *¿Por qué?* La consigna pide al menos un
  bucle, y `forEach` es el más claro para "recorrer y dibujar cada elemento".
- Las asistencias se ordenan con **`sort` por `id` de mayor a menor**. *¿Por qué por id y no
  por fecha?* El `id` más alto siempre es el más nuevo, así no dependemos del formato de la
  fecha (puede venir como `2025-06-12` o como `3/6/2026`).
- **`find`** valida el departamento elegido, **`.length`** cuenta empleados, y `split`/
  `charCodeAt`/`%` generan las iniciales y el color del avatar.

**Código concreto a mostrar:**
- La estructura de `db.json` (las tres "tablas" y sus relaciones).
- El objeto `nuevo`/`nueva` que se arma en `crearEmpleado()` / `crearAsistencia()`.
- Los `forEach` de `cargarDepartamentos()`, `cargarEmpleados()` y `cargarAsistencias()`.
- `asistencias.sort((a, b) => b.id - a.id)` (ordenamiento) y `find()` en `editarEmpleado()`.
- `respuesta.data.length` en `contarEmpleados()` y las auxiliares `iniciales()` / `gradienteAvatar()`.

*Cómo presentarlo:* abrir `db.json`, mostrar la forma de un objeto departamento/empleado/
asistencia y sus relaciones. Después abrir la página de asistencias y mostrar que aparecen
ordenadas de la más reciente a la más antigua, explicando el `sort`.
