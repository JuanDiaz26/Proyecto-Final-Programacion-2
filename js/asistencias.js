// ============================================================
//  ASISTENCIAS (asistencias.html)
//  CRUD de las asistencias del empleado elegido en empleados.html.
//  El id del empleado llega por localStorage.
// ============================================================

// Dirección de la API fake
const API = "http://localhost:3000";

// Leemos el empleado que se guardó en la página anterior
const empleadoId = localStorage.getItem("empleadoId");

// Elementos del HTML
const listaAsistencias = document.getElementById("listaAsistencias");
const botonRegistrar = document.getElementById("botonRegistrar");
const tituloEmpleado = document.getElementById("tituloEmpleado");
const botonVolver = document.getElementById("botonVolver");

// Los tres estados posibles de una asistencia
const ESTADOS = ["Presente", "Ausente", "Tardanza"];

// Dibujo (SVG) de un calendario que usamos como ícono de cada fila
const ICONO_CALENDARIO =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';

// Cuando carga la página, arrancamos
document.addEventListener("DOMContentLoaded", iniciar);

// El botón registra una asistencia nueva (con la fecha de hoy)
botonRegistrar.addEventListener("click", crearAsistencia);

// El botón "Volver" lleva a la lista de empleados
botonVolver.addEventListener("click", () => {
  window.location.href = "empleados.html";
});

// ------------------------------------------------------------
// INICIAR: valida que haya un empleado elegido y carga datos
// ------------------------------------------------------------
async function iniciar() {
  if (!empleadoId) {
    tituloEmpleado.textContent = "No se seleccionó ningún empleado.";
    return;
  }
  await mostrarNombreEmpleado();
  await cargarAsistencias();
}

// ------------------------------------------------------------
// Muestra el nombre del empleado actual en el título
// ------------------------------------------------------------
async function mostrarNombreEmpleado() {
  const respuesta = await axios.get(`${API}/empleados/${empleadoId}`);
  tituloEmpleado.textContent = `Asistencias de ${respuesta.data.nombre}`;
}

// ------------------------------------------------------------
// LEER: trae las asistencias del empleado, las ordena de la
// más reciente a la más antigua, y las dibuja.
// ------------------------------------------------------------
async function cargarAsistencias() {
  const respuesta = await axios.get(`${API}/asistencias?empleadoId=${empleadoId}`);
  const asistencias = respuesta.data;

  // Ordenamos por id de mayor a menor: el id más alto es el registro
  // más nuevo, así que queda primero el más reciente.
  asistencias.sort((a, b) => b.id - a.id);

  listaAsistencias.innerHTML = "";

  // Si no hay asistencias, avisamos y cortamos
  if (asistencias.length === 0) {
    listaAsistencias.innerHTML =
      '<div class="empty">Sin asistencias registradas. Usá el botón “Registrar hoy”.</div>';
    return;
  }

  asistencias.forEach((asistencia) => {
    renderizarAsistencia(asistencia);
  });
}

// ------------------------------------------------------------
// RENDERIZAR: arma en el DOM la fila de UNA asistencia
// ------------------------------------------------------------
function renderizarAsistencia(asistencia) {
  // Sufijo en minúscula para las clases de color (is-presente, etc.)
  const claseColor = "is-" + asistencia.estado.toLowerCase();

  const item = document.createElement("div");
  item.className = "row-item";

  // Lado izquierdo: ícono de calendario (coloreado según el estado) + fecha
  const izquierda = document.createElement("div");
  izquierda.className = "row-left";

  const icono = document.createElement("div");
  icono.className = "row-icon " + claseColor;
  icono.innerHTML = ICONO_CALENDARIO;

  const fecha = document.createElement("span");
  fecha.className = "row-date";
  fecha.textContent = asistencia.fecha;

  izquierda.appendChild(icono);
  izquierda.appendChild(fecha);

  // Lado derecho: selector de estado + botón eliminar
  const derecha = document.createElement("div");
  derecha.className = "row-right";

  // Selector de estado: al cambiarlo, se guarda con PATCH
  const select = document.createElement("select");
  select.className = "status " + claseColor;
  ESTADOS.forEach((estado) => {
    const opcion = document.createElement("option");
    opcion.value = estado;
    opcion.textContent = estado;
    // Dejamos seleccionado el estado actual de la asistencia
    if (estado === asistencia.estado) {
      opcion.selected = true;
    }
    select.appendChild(opcion);
  });
  select.addEventListener("change", () => editarAsistencia(asistencia.id, select.value));

  // Botón "Eliminar"
  const eliminarBtn = document.createElement("button");
  eliminarBtn.className = "button danger small";
  eliminarBtn.textContent = "Eliminar";
  eliminarBtn.addEventListener("click", () => eliminarAsistencia(asistencia.id));

  derecha.appendChild(select);
  derecha.appendChild(eliminarBtn);

  item.appendChild(izquierda);
  item.appendChild(derecha);
  listaAsistencias.appendChild(item);
}

// ------------------------------------------------------------
// CREAR: registra una asistencia con la fecha de hoy (POST)
// ------------------------------------------------------------
async function crearAsistencia() {
  const nueva = {
    empleadoId: Number(empleadoId),
    fecha: new Date().toLocaleDateString(), // fecha automática de hoy
    estado: "Presente", // estado inicial
  };

  await axios.post(`${API}/asistencias`, nueva);

  // Volvemos a dibujar todo para que la nueva quede arriba (más reciente)
  cargarAsistencias();
}

// ------------------------------------------------------------
// ACTUALIZAR: cambia el estado de una asistencia (PATCH)
// ------------------------------------------------------------
async function editarAsistencia(id, nuevoEstado) {
  await axios.patch(`${API}/asistencias/${id}`, { estado: nuevoEstado });
  cargarAsistencias();
}

// ------------------------------------------------------------
// ELIMINAR: borra una sola asistencia (DELETE)
// ------------------------------------------------------------
async function eliminarAsistencia(id) {
  if (!confirm("¿Eliminar esta asistencia?")) {
    return;
  }
  await axios.delete(`${API}/asistencias/${id}`);
  cargarAsistencias();
}
