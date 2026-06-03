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
- **CSS con Bootstrap 5** (por CDN) para los estilos, sin escribir CSS a mano.
- **JavaScript puro (vanilla)** — sin React, sin Vue, sin frameworks.
- **Axios** (por CDN) para hacer las peticiones HTTP a la API.
- **json-server** como **API REST fake**: convierte el archivo `db.json` en una API real
  con los endpoints `/departamentos`, `/empleados` y `/asistencias`.

### Estructura de archivos

```
Proyecto Final - Ismael/
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
Crea en el DOM la tarjeta de **un** departamento.

```js
const col = document.createElement("div");
col.className = "col-md-4";
```
**[FÁCIL]** `createElement` crea una etiqueta HTML desde JS y le ponemos clases de Bootstrap.

```js
verBtn.addEventListener("click", () => verEmpleados(depto.id));
```
**[MEDIA]** Le asignamos al botón qué hacer cuando se hace clic. Usamos una función flecha
para poder **pasarle el `depto.id`** a `verEmpleados`.

```js
body.appendChild(titulo);
card.appendChild(body);
listaDepartamentos.appendChild(col);
```
**[FÁCIL]** `appendChild` "cuelga" un elemento dentro de otro, armando el árbol del DOM.

```js
const total = await contarEmpleados(depto.id);
cantidad.textContent = `Empleados: ${total}`;
```
**[DIFÍCIL]** La tarjeta ya se dibujó; ahora pedimos (aparte) cuántos empleados tiene y
completamos el cartelito. Lo hacemos al final para no alterar el orden de las tarjetas.

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
Igual que en departamentos: crea la tarjeta con `createElement`/`appendChild`, muestra
nombre, cargo y fecha de ingreso, y arma los botones con `addEventListener`. **[FÁCIL/MEDIA]**

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
Pide nuevo nombre y cargo con `prompt`, valida con un condicional y manda `axios.patch`. **[MEDIA]**

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
  `textContent` e `innerHTML`. Explicar que el HTML solo tiene contenedores vacíos y que
  **todo lo llena el JavaScript**.
- **Navegación entre páginas con `localStorage`** (en vez de query strings).

*Cómo presentarlo:* abrir `index.html`, mostrar que el `<div id="listaDepartamentos">` está
vacío en el HTML y que las tarjetas aparecen porque las crea el JS. Hacer clic en "Ver
empleados" y mostrar en las DevTools cómo se guardó el `departamentoId` en localStorage.

**Prácticas / código a mostrar:**
- `renderizarDepartamento()` y `renderizarEmpleado()` (`createElement` + `appendChild`).
- `verEmpleados()` y `verAsistencias()` (`localStorage.setItem` + `window.location.href`).
- Los `addEventListener` de los botones "Volver", "Ver empleados" y "Ver asistencias".
- `document.addEventListener("DOMContentLoaded", ...)` en los tres archivos.

---

### 🟩 Luciano Bravo — Axios, async/await y json-server

**Teoría a exponer:**
- Qué es una **API REST** y qué es la **API fake** (json-server convierte `db.json` en API).
- Los **cuatro métodos** de Axios: `get` (leer), `post` (crear), `patch` (actualizar),
  `delete` (borrar).
- **Promesas** y por qué usamos `async/await` (esperar la respuesta sin congelar la página).
- Por qué leemos siempre desde **`response.data`**.

*Cómo presentarlo:* levantar `json-server` en vivo, abrir `http://localhost:3000/empleados`
para mostrar la API, y explicar el viaje pedido → respuesta → `response.data` → pantalla.

**Prácticas / código a mostrar:**
- `cargarDepartamentos()` (`axios.get` + `response.data`).
- `crearDepartamento()` / `crearEmpleado()` (`axios.post`).
- `editarAsistencia()` (`axios.patch`).
- `eliminarAsistencia()` (`axios.delete`).
- `contarEmpleados()` con el **filtro** `?departamentoId=ID`.

---

### 🟨 Segura Heredia Constanza — CRUD y Condicionales

**Teoría a exponer:**
- Concepto de **CRUD completo** (Crear, Leer, Actualizar, Eliminar) sobre cada entidad.
- En detalle **Actualizar (`patch`)** y **Eliminar (`delete`)**.
- **Eliminación en cascada**: qué es, por qué hace falta (json-server no borra los hijos
  solo) y cómo respeta la relación entre las tablas.
- **Condicionales y validaciones** (`if`, `return`, `confirm`).

*Cómo presentarlo:* borrar un departamento en vivo y mostrar que también desaparecen sus
empleados y asistencias. Intentar editar dejando un campo vacío para mostrar la validación.

**Prácticas / código a mostrar:**
- `editarDepartamento()` / `editarEmpleado()` (validación con `if` + `axios.patch`).
- `eliminarDepartamento()` (cascada completa: asistencias → empleados → departamento).
- `eliminarEmpleado()` (cascada: asistencias → empleado).
- Los `confirm(...)` y los `if (!dato) { ... return; }`.

---

### 🟥 Medinas Maria Belen — Objetos, Arrays, Métodos y Bucles

**Teoría a exponer:**
- **Estructura de datos**: cómo está armado `db.json` (objetos con propiedades) y cómo se
  relacionan por `id` / `departamentoId` / `empleadoId`.
- **Arrays** y **objetos** en JavaScript.
- **Métodos de array**: `forEach` (recorrer y dibujar), `sort` (ordenar) y `.length` (contar).
- El **bucle `forEach`** para renderizar listas y el **ordenamiento de asistencias**.

*Cómo presentarlo:* abrir `db.json`, mostrar la forma de un objeto departamento/empleado/
asistencia. Después abrir la página de asistencias y mostrar que aparecen ordenadas de la
más reciente a la más antigua, explicando el `sort`.

**Prácticas / código a mostrar:**
- La estructura de `db.json` (las tres "tablas" y sus relaciones).
- El objeto `nuevo` que se arma en `crearEmpleado()` / `crearAsistencia()`.
- Los `forEach` de `cargarDepartamentos()`, `cargarEmpleados()` y `cargarAsistencias()`.
- `asistencias.sort((a, b) => b.id - a.id)` (ordenamiento).
- `respuesta.data.length` en `contarEmpleados()`.
