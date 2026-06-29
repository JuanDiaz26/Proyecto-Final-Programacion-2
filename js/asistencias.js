// ============================================================
//  ASISTENCIAS (asistencias.html)
//  CRUD de las asistencias del empleado elegido en empleados.html.
//  El id del empleado llega por localStorage.
//  Las funciones API, fechaHoyISO() y manejarError() viven en
//  js/utils.js (se carga antes que este archivo).
// ============================================================

// Leemos el empleado que se guardó en la página anterior
const empleadoId = localStorage.getItem("empleadoId");

// Elementos del HTML
const listaAsistencias = document.getElementById("listaAsistencias");
const botonRegistrar = document.getElementById("botonRegistrar");
const tituloEmpleado = document.getElementById("tituloEmpleado");
const botonVolver = document.getElementById("botonVolver");

// Los tres estados posibles de una asistencia
const ESTADOS = ["Presente", "Ausente", "Tardanza"];

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
  try {
    const respuesta = await axios.get(`${API}/empleados/${empleadoId}`);
    tituloEmpleado.textContent = `Asistencias de ${respuesta.data.nombre}`;
  } catch (error) {
    manejarError(error, "obtener el empleado");
  }
}

// ------------------------------------------------------------
// LEER: trae las asistencias del empleado, las ordena de la
// más reciente a la más antigua, y las dibuja.
// ------------------------------------------------------------
async function cargarAsistencias() {
  try {
    const respuesta = await axios.get(`${API}/asistencias?empleadoId=${empleadoId}`);
    const asistencias = respuesta.data;

    // Ordenamos por FECHA de más reciente a más antigua. Como la fecha está
    // en formato ISO (AAAA-MM-DD), comparar los textos ya da el orden cronológico.
    // Si hay varias del mismo día, desempata el id (la última cargada primero).
    asistencias.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);

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
  } catch (error) {
    manejarError(error, "cargar las asistencias");
  }
}

// ------------------------------------------------------------
// RENDERIZAR: arma en el DOM la fila de UNA asistencia
// ------------------------------------------------------------
function renderizarAsistencia(asistencia) {
  // Sufijo en minúscula para las clases de color (is-presente, etc.)
  const claseColor = "is-" + asistencia.estado.toLowerCase();

  const item = document.createElement("div");
  item.className = "row-item";

  // Lado izquierdo: marcador de estado (cuadradito + texto SIEMPRE visible) + fecha
  const izquierda = document.createElement("div");
  izquierda.className = "row-left";

  // Cuadradito coloreado por estado (--ink / --muted / --accent vía CSS)
  const marca = document.createElement("span");
  marca.className = "row-icon " + claseColor;

  // Texto del estado, siempre visible (accesibilidad: no dependemos solo del color)
  const estadoTexto = document.createElement("span");
  estadoTexto.className = "row-state " + claseColor;
  estadoTexto.textContent = asistencia.estado;

  const fecha = document.createElement("span");
  fecha.className = "row-date";
  fecha.textContent = asistencia.fecha;

  izquierda.appendChild(marca);
  izquierda.appendChild(estadoTexto);
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
  const hoy = fechaHoyISO();

  // Modal: elegimos la FECHA (por defecto hoy, sin permitir futuro) y el ESTADO.
  const datos = await abrirModal("Registrar asistencia", [
    { name: "fecha", label: "Fecha", type: "date", value: hoy, max: hoy },
    {
      name: "estado",
      label: "Estado",
      type: "select",
      value: "Presente",
      options: ESTADOS.map((e) => ({ value: e, label: e })),
    },
  ]);
  if (!datos) return; // el usuario canceló

  // Validación: la fecha es obligatoria y no puede ser futura
  if (!datos.fecha) {
    alert("Elegí una fecha.");
    return;
  }
  if (datos.fecha > hoy) {
    alert("No se puede registrar una fecha futura.");
    return;
  }

  try {
    // No duplicar: que no haya ya una asistencia de este empleado en esa fecha
    const mismaFecha = (
      await axios.get(`${API}/asistencias?empleadoId=${empleadoId}&fecha=${datos.fecha}`)
    ).data;
    if (mismaFecha.length > 0) {
      alert("Ya hay una asistencia registrada para esa fecha.");
      return;
    }

    // Aviso (NO bloqueo): si estás cargando HOY y falta el día anterior (ayer)
    if (datos.fecha === hoy) {
      const ayer = fechaRelativaISO(-1);
      const deAyer = (
        await axios.get(`${API}/asistencias?empleadoId=${empleadoId}&fecha=${ayer}`)
      ).data;
      if (deAyer.length === 0) {
        const seguir = confirm(
          "Te falta registrar el día anterior (ayer). ¿Registrás hoy igual?"
        );
        if (!seguir) return;
      }
    }

    const nueva = {
      empleadoId: Number(empleadoId),
      fecha: datos.fecha,
      estado: datos.estado,
    };
    await axios.post(`${API}/asistencias`, nueva);

    // Volvemos a dibujar todo para que quede ordenado por fecha
    cargarAsistencias();
  } catch (error) {
    manejarError(error, "registrar la asistencia");
  }
}

// ------------------------------------------------------------
// ACTUALIZAR: cambia el estado de una asistencia (PATCH)
// ------------------------------------------------------------
async function editarAsistencia(id, nuevoEstado) {
  try {
    await axios.patch(`${API}/asistencias/${id}`, { estado: nuevoEstado });
    cargarAsistencias();
  } catch (error) {
    manejarError(error, "actualizar el estado");
  }
}

// ------------------------------------------------------------
// ELIMINAR: borra una sola asistencia (DELETE)
// ------------------------------------------------------------
async function eliminarAsistencia(id) {
  if (!confirm("¿Eliminar esta asistencia?")) {
    return;
  }
  try {
    await axios.delete(`${API}/asistencias/${id}`);
    cargarAsistencias();
  } catch (error) {
    manejarError(error, "eliminar la asistencia");
  }
}
