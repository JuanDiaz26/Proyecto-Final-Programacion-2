# Panel de Administración de Empleados (RRHH)

Proyecto Final — **Programación 2**

Aplicación web para gestionar el personal de una empresa. Permite administrar tres entidades
relacionadas —**Departamentos**, **Empleados** y **Asistencias**— cada una con su **CRUD**
completo (Crear, Leer, Actualizar y Eliminar). Los datos se consumen desde una API REST falsa
montada con `json-server`, usando **Axios**.

---

## Tecnologías

- **HTML5** para la estructura.
- **CSS3** con estilos propios.
- **JavaScript** puro (sin frameworks).
- **Axios** (por CDN) para las peticiones HTTP a la API.
- **json-server** como API REST falsa sobre el archivo `db.json`.

---

## Cómo se relacionan los datos

```
DEPARTAMENTO  (1) ──< (muchos) EMPLEADO  (1) ──< (muchas) ASISTENCIA
```

- Cada **empleado** guarda el `departamentoId` al que pertenece.
- Cada **asistencia** guarda el `empleadoId` al que corresponde.
- Al eliminar un departamento, se eliminan también sus empleados y las asistencias de esos
  empleados (**eliminación en cascada**).

---

## Cómo ejecutarlo

1. Instalar json-server (una sola vez):

   ```bash
   npm install -g json-server@0.17.4
   ```

2. Levantar la API, parado en la carpeta del proyecto:

   ```bash
   json-server --watch db.json --port 3000
   ```

   La API queda en `http://localhost:3000`.

3. Abrir `index.html` con **Live Server** de VS Code (clic derecho → *Open with Live Server*).

> Se abre con Live Server (por `http://`) y no con doble clic al archivo (`file://`), porque por
> seguridad (CORS) el navegador bloquea las peticiones a la API en modo `file://`.

---

## Funcionalidades

**Departamentos** (`index.html`): crear, listar (con su responsable y la cantidad de empleados),
editar y eliminar (en cascada).

**Empleados** (`empleados.html`): muestra los empleados del departamento elegido. Crear, editar
(incluye reasignar el departamento) y eliminar (borra también sus asistencias).

**Asistencias** (`asistencias.html`): historial del empleado elegido, ordenado de la más reciente
a la más antigua. Crear, cambiar el estado (Presente / Ausente / Tardanza) y eliminar.

### Funcionalidad extra

Además de lo pedido, se agregó una **ventana modal** propia para editar departamentos y empleados
(en lugar de las ventanas `prompt()` del navegador), para una mejor experiencia de uso.

---

## Estructura de archivos

```
index.html          → Departamentos
empleados.html      → Empleados
asistencias.html    → Asistencias
js/
  ├── departamentos.js
  ├── empleados.js
  ├── asistencias.js
  └── utils.js        → funciones compartidas
css/
  └── styles.css
db.json             → base de datos de ejemplo
```

---

## Integrantes

- Juan Diaz
- Luciano Bravo
- Segura Heredia Constanza
