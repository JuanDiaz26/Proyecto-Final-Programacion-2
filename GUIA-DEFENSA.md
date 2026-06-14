# Guía de defensa — Panel de administración de empleados (RRHH)

> **Documento para estudiar y defender.** El `README.md` es la versión larga/técnica.
> Acá está lo importante + **qué hacer si el profe borra código y pide rehacerlo en vivo**.

---

## 1) Qué es el proyecto (en una frase)

Un panel de **Recursos Humanos** con tres entidades relacionadas —**Departamentos → Empleados →
Asistencias**— donde cada una tiene su **CRUD** (Crear, Leer, Actualizar, Eliminar). Los datos
salen de una **API falsa** (`json-server` sobre `db.json`) y se piden con **Axios**. Todo el HTML
de las listas lo dibuja **JavaScript**.

**Relación (padre → hijo):** un departamento tiene muchos empleados (cada empleado guarda
`departamentoId`); un empleado tiene muchas asistencias (cada una guarda `empleadoId`).

---

## 2) Stack (qué tecnología y por qué)

- **HTML5**: solo contenedores vacíos; el contenido lo crea el JS.
- **CSS propio** (`css/styles.css`): estilo editorial controlado con **variables (tokens)** en `:root`.
- **JavaScript puro** (sin frameworks): un archivo por página + `utils.js` con lo compartido.
- **Axios** (por CDN): hace los pedidos a la API (`get`, `post`, `patch`, `delete`).
- **json-server** (0.17.4): convierte `db.json` en una API REST en `localhost:3000`.

---

## 3) Cómo correrlo

1. `json-server --watch db.json --port 3000`
2. Abrir `index.html` con **Live Server** (por `http://`, no `file://`, por CORS).

---

## 4) Cómo se desarrolló (la evolución)

1. **Base:** los tres CRUD andando con Axios + json-server.
2. **Robustez:** `utils.js` (no repetir código), **modal** propio para editar, **manejo de errores**
   con `try/catch`, fecha en formato **ISO**.
3. **Rediseño + validaciones:** identidad visual con tokens + footer, **validación de duplicados**,
   asistencias **en cualquier fecha** y **navegación** por tabs y footer.

---

## 5) Estructura de archivos

```
index.html / empleados.html / asistencias.html   → las tres vistas
js/utils.js          → compartido (API, fechas, errores, modal, navegación, códigos)
js/departamentos.js  → CRUD de departamentos
js/empleados.js      → CRUD de empleados
js/asistencias.js    → CRUD de asistencias
css/styles.css       → tema visual (tokens) + footer
db.json              → "base de datos"
```

Cada `.js` tiene sus funciones **separadas por responsabilidad**: una para **leer/cargar**, una
para **renderizar** (dibujar), una para **crear**, una para **editar** y una para **eliminar**.

---

# 6) Qué defiende cada uno (en detalle)

> Cada uno tiene que poder **explicar su parte y rehacerla** si el profe la borra (ver sección 7).

## 🟦 Juan Diaz — DOM, Navegación e Identidad visual

**Lo que tenés que dominar:**

- **Qué es el DOM:** el árbol de elementos de la página. El HTML arranca **vacío**
  (`<div id="listaDepartamentos"></div>`) y el JavaScript **crea** las tarjetas.
  - `document.createElement("div")` → crea un elemento.
  - `elemento.textContent = "..."` → le pone texto.
  - `elemento.className = "..."` → le pone su clase de CSS.
  - `padre.appendChild(hijo)` → lo cuelga adentro de otro.
- **Eventos (`addEventListener`):** "escuchar" algo que pasa.
  - `submit` del formulario (crear), `click` de los botones (ver/editar/eliminar),
    `change` del selector de estado, y `DOMContentLoaded` (cuando termina de cargar la página).
  - Usamos **funciones flecha** para pasarle el id: `boton.addEventListener("click", () => verEmpleados(depto.id))`.
- **Navegación entre páginas con `localStorage`:** como son 3 páginas distintas, guardamos el id
  elegido en `localStorage` y cambiamos de página con `window.location.href`. La página siguiente
  lo lee con `localStorage.getItem(...)`. *(Se usa localStorage en vez de poner el id en la URL.)*
- **Las tabs del header y el footer también navegan:** una sola función `activarNavegacion()`
  engancha cualquier elemento con `data-nav`. "Empleados"/"Asistencias" se **deshabilitan** si
  todavía no se eligió un depto/empleado (no habría nada para mostrar).
- **Identidad visual:** todos los colores y tipografías están en **variables CSS** en `:root`;
  cambiando ese bloque cambia todo. El **footer** es la franja oscura con los datos del equipo.

**Funciones para mostrar:** `renderizarDepartamento()`, `verEmpleados()`, `activarNavegacion()`,
y los `addEventListener`.

**Por qué así (preguntas de "por qué"):**
- *¿Por qué el HTML está vacío?* Porque la consigna pide crear el contenido dinámicamente desde el
  JS con datos de la API, no escribirlo a mano.
- *¿Por qué localStorage y no la URL?* Para pasar el id de una página a otra; lo pide la consigna.

## 🟩 Luciano Bravo — Axios, async/await y métodos de array

**Lo que tenés que dominar:**

- **API REST + json-server:** `db.json` se convierte en endpoints: `/departamentos`, `/empleados`,
  `/asistencias`. Probarlo en el navegador: `http://localhost:3000/departamentos`.
- **Los 4 métodos de Axios:**
  - `axios.get(url)` → leer.  `axios.post(url, datos)` → crear.
  - `axios.patch(url, datos)` → actualizar.  `axios.delete(url)` → borrar.
- **async/await:** los pedidos tardan; `await` **espera** la respuesta sin congelar la página.
  Por eso las funciones son `async`. La respuesta llega en **`response.data`** (Axios ya la
  convierte de JSON a objeto/array; la usamos directo, no la tocamos a mano).
- **Filtros de json-server:** `?departamentoId=ID` y `?empleadoId=ID` traen **solo lo necesario**
  del servidor, en vez de bajar todo y filtrar en el navegador.
- **Métodos de array:**
  - `forEach` → recorrer la lista y dibujar cada item.
  - `map` → transformar (arma las opciones del `<select>` al editar empleado).
  - `sort` → ordenar las asistencias por fecha.
  - `.length` → contar (cuántos empleados tiene un departamento).

**Funciones para mostrar:** `cargarDepartamentos()` (get + forEach), `crearEmpleado()` (post),
`contarEmpleados()` (get filtrado + `.length`), `editarAsistencia()` (patch).

**Por qué así:**
- *¿Por qué `async/await` y no `.then()`?* Se lee de arriba a abajo, paso a paso; más claro.
- *¿Por qué json-server 0.17.4?* Da `id` numéricos (1, 2, 3…) y soporta `--watch`.

## 🟨 Segura Heredia Constanza — CRUD, Condicionales y Datos

**Lo que tenés que dominar:**

- **CRUD completo** sobre cada entidad, en **funciones separadas por responsabilidad**.
- **Estructura de `db.json`:** tres "tablas" relacionadas por id (modelo **padre → hijo**). Los
  objetos que se mandan se **arman en JS** (`const nuevo = { ... }`) y el `id` lo pone la API.
- **Eliminación en cascada:** json-server **no** borra los hijos solos. Al borrar un departamento,
  primero borramos las asistencias de cada empleado, después los empleados y al final el
  departamento. Se hace con el bucle **`for...of` + `await`** para que sea **en orden**.
- **Condicionales y validaciones (`if`, `return`, `confirm`):**
  - `confirm("¿Eliminar...?")` antes de borrar (evita borrados accidentales).
  - `if (!nombre) return;` corta si falta un dato.
  - `.trim()` para que no entren campos con solo espacios.
  - **Sin duplicados:** antes de crear, un `GET` + `some()` chequea si ya existe (departamento por
    nombre = bloquea; empleado por nombre = avisa con `confirm`; asistencia por día = bloquea).

**Funciones para mostrar:** `eliminarDepartamento()` (cascada), `crearDepartamento()` (validación),
`crearAsistencia()` (fecha + estado + chequeos).

**Por qué así:**
- *¿Por qué la cascada a mano?* Para no dejar empleados/asistencias "huérfanos" apuntando a algo
  que ya no existe.
- *¿Por qué bloquear depto repetido pero solo avisar en empleado?* Un área no se repite; dos
  personas sí pueden llamarse igual.

---

# 7) ⚠️ Si el profe BORRA código y hay que rehacerlo en vivo

> El TP avisa que el docente puede borrar partes y pedir que las reescriban. Acá están las más
> probables, en **versión simple** (lo esencial que tiene que funcionar). Memorizá el patrón.

### 🟦 Juan — Dibujar una tarjeta (render)
Si borra `renderizarDepartamento`, lo básico es:
```js
function renderizarDepartamento(depto) {
  const tile = document.createElement("div");      // creo la tarjeta
  const titulo = document.createElement("h3");
  titulo.textContent = depto.nombre;               // le pongo el nombre
  tile.appendChild(titulo);

  const verBtn = document.createElement("button");
  verBtn.textContent = "Ver empleados";
  verBtn.addEventListener("click", () => verEmpleados(depto.id)); // evento
  tile.appendChild(verBtn);

  listaDepartamentos.appendChild(tile);            // lo cuelgo en la página
}
```

### 🟦 Juan — Navegar a otra página
```js
function verEmpleados(id) {
  localStorage.setItem("departamentoId", id);      // guardo el id
  window.location.href = "empleados.html";          // cambio de página
}
```

### 🟩 Luciano — Leer y dibujar la lista (GET + forEach)
```js
async function cargarDepartamentos() {
  const respuesta = await axios.get(`${API}/departamentos`);
  listaDepartamentos.innerHTML = "";               // limpio antes de redibujar
  respuesta.data.forEach((depto) => renderizarDepartamento(depto));
}
```

### 🟩 Luciano — Crear (POST) y mostrarlo sin recargar
```js
async function crearDepartamento(evento) {
  evento.preventDefault();                          // que no recargue la página
  const nuevo = { nombre: inputNombre.value, responsable: inputResponsable.value };
  const respuesta = await axios.post(`${API}/departamentos`, nuevo);
  renderizarDepartamento(respuesta.data);           // lo muestro al instante
  formDepartamento.reset();
}
```

### 🟩 Luciano — Contar con filtro (GET + .length)
```js
async function contarEmpleados(id) {
  const respuesta = await axios.get(`${API}/empleados?departamentoId=${id}`);
  return respuesta.data.length;
}
```

### 🟩 Luciano — Actualizar (PATCH)
```js
await axios.patch(`${API}/empleados/${id}`, { nombre, cargo });
```

### 🟨 Constanza — Eliminar en cascada (DELETE + for...of)
```js
async function eliminarDepartamento(id) {
  const emps = await axios.get(`${API}/empleados?departamentoId=${id}`);
  for (const emp of emps.data) {                    // por cada empleado...
    const asis = await axios.get(`${API}/asistencias?empleadoId=${emp.id}`);
    for (const a of asis.data) {
      await axios.delete(`${API}/asistencias/${a.id}`); // borro sus asistencias
    }
    await axios.delete(`${API}/empleados/${emp.id}`);   // borro el empleado
  }
  await axios.delete(`${API}/departamentos/${id}`);     // y al final el depto
  cargarDepartamentos();
}
```

### 🟨 Constanza — Validación / condicional
```js
const nombre = inputNombre.value.trim();
if (!nombre) {                       // si está vacío, corto
  alert("Falta el nombre");
  return;
}
if (!confirm("¿Seguro?")) return;    // confirmación antes de una acción
```

---

# 8) Si el profe pide AGREGAR algo en vivo

- **Agregar un registro (depto/empleado/asistencia):** usar el formulario o el botón de la pantalla
  correspondiente — ya hace el `POST` y lo muestra. (O mostrar la función `crear...`).
- **Agregar un campo nuevo** (ej: "teléfono" del empleado): se suma al objeto `nuevo` en `crearEmpleado`
  (`telefono: inputTelefono.value`), se agrega el `<input>` en el HTML, y se muestra en
  `renderizarEmpleado` con otro `createElement`. json-server lo guarda solo (no hay que tocar `db.json`).

---

# 9) Conceptos clave (machete rápido)

| Concepto | Dónde está | Qué decir |
|---|---|---|
| `async/await` | funciones con `axios` | espera la respuesta sin trabar la página |
| `response.data` | después de `axios.get/post` | ahí vienen los datos ya convertidos |
| `get/post/patch/delete` | uno por operación CRUD | leer / crear / actualizar / borrar |
| `forEach` | en los render | recorre la lista y dibuja cada item |
| `localStorage` | al navegar entre páginas | guarda el id para la página siguiente |
| `for...of` + cascada | `eliminarDepartamento` | borra hijos antes que el padre, en orden |
| `if` / `return` / `confirm` | en crear/editar/eliminar | validaciones y confirmación |
| `.length` / `map` / `sort` | conteo / opciones / orden | métodos de array |

---

# 10) Preguntas típicas del profe (respuesta corta)

- **¿Por qué `async/await`?** Los pedidos tardan; `await` espera la respuesta sin congelar la página.
- **¿Qué es `response.data`?** Lo que devuelve el servidor; Axios ya lo convierte, lo usamos directo.
- **¿Por qué `localStorage`?** Para pasar el id elegido de una página a otra.
- **¿Qué es la cascada?** Borrar los hijos (asistencias, empleados) antes del padre (departamento).
- **¿Cómo evitan duplicados?** Un `GET` + `some()` antes de crear; si ya existe, no se crea.
- **¿Qué hace `forEach`?** Recorre el array y, por cada elemento, lo dibuja en pantalla.
- **¿Por qué json-server 0.17.4?** `id` numéricos e incrementales y soporta `--watch`.

---

# 11) La parte más "difícil": el modal (`abrirModal`)

Es la pieza más avanzada porque usa una **promesa**. Para explicarlo simple:

> "El modal abre un formulario y **devuelve una promesa** — un valor que va a estar *más tarde*,
> cuando el usuario toca Guardar o Cancelar. Por eso lo usamos con `await`, igual que esperamos a
> Axios: `const datos = await abrirModal(...)`. Si guarda, `datos` trae lo cargado; si cancela,
> `datos` es `null` y no hacemos nada."

Todo lo demás (DOM, eventos, CRUD, condicionales, arrays, bucles, Axios) es de nivel del curso.
