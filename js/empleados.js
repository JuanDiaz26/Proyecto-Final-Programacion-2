// ============================================================
//  EMPLEADOS (empleados.html)
//  CRUD de los empleados del departamento elegido en index.html.
//  El id del departamento llega por localStorage.
//  Las funciones API, iniciales(), manejarError() y abrirModal()
//  viven en js/utils.js (se carga antes que este archivo).
// ============================================================

// Leemos el departamento que se guardó en la página anterior
const departamentoId = localStorage.getItem("departamentoId");

// Elementos del HTML
const listaEmpleados = document.getElementById("listaEmpleados");
const formEmpleado = document.getElementById("formEmpleado");
const tituloDepartamento = document.getElementById("tituloDepartamento");
const botonVolver = document.getElementById("botonVolver");
const inputNombre = document.getElementById("nombre");
const inputCargo = document.getElementById("cargo");
const inputFecha = document.getElementById("fechaIngreso");

// Cuando carga la página, arrancamos
document.addEventListener("DOMContentLoaded", iniciar);

// El formulario crea empleados
formEmpleado.addEventListener("submit", crearEmpleado);

// El botón "Volver" lleva a la lista de departamentos
botonVolver.addEventListener("click", () => {
  window.location.href = "index.html";
});

// ------------------------------------------------------------
// INICIAR: valida que haya un departamento elegido y carga datos
// ------------------------------------------------------------
async function iniciar() {
  // Si entraron directo a esta página sin elegir departamento, avisamos
  if (!departamentoId) {
    tituloDepartamento.textContent = "No se seleccionó ningún departamento.";
    return;
  }
  await mostrarNombreDepartamento();
  await cargarEmpleados();
}

// ------------------------------------------------------------
// Muestra el nombre del departamento actual en el título
// ------------------------------------------------------------
async function mostrarNombreDepartamento() {
  try {
    const respuesta = await axios.get(`${API}/departamentos/${departamentoId}`);
    tituloDepartamento.textContent = `Empleados de ${respuesta.data.nombre}`;
  } catch (error) {
    manejarError(error, "obtener el departamento");
  }
}

// ------------------------------------------------------------
// LEER: trae los empleados de ESTE departamento y los dibuja
// ------------------------------------------------------------
async function cargarEmpleados() {
  try {
    const respuesta = await axios.get(`${API}/empleados?departamentoId=${departamentoId}`);
    const empleados = respuesta.data;

    listaEmpleados.innerHTML = "";

    // Si el departamento no tiene empleados, avisamos y cortamos
    if (empleados.length === 0) {
      listaEmpleados.innerHTML =
        '<div class="empty">Este departamento no tiene empleados todavía. Agregá uno con el formulario de arriba.</div>';
      return;
    }

    empleados.forEach((empleado) => {
      renderizarEmpleado(empleado);
    });
  } catch (error) {
    manejarError(error, "cargar los empleados");
  }
}

// ------------------------------------------------------------
// RENDERIZAR: arma en el DOM la tarjeta de UN empleado
// ------------------------------------------------------------
function renderizarEmpleado(empleado) {
  const tile = document.createElement("div");
  tile.className = "tile";

  // --- Encabezado: avatar con iniciales + nombre + cargo ---
  const head = document.createElement("div");
  head.className = "tile-head";

  // Identificador editorial: cuadradito de 8px (--ink) + iniciales en mono
  const tileId = document.createElement("div");
  tileId.className = "tile-id";
  const mark = document.createElement("span");
  mark.className = "mark";
  const code = document.createElement("span");
  code.className = "code";
  code.textContent = iniciales(empleado.nombre);
  tileId.appendChild(mark);
  tileId.appendChild(code);

  const headtext = document.createElement("div");
  headtext.className = "tile-headtext";
  const titulo = document.createElement("h3");
  titulo.className = "tile-title";
  titulo.textContent = empleado.nombre;
  const cargo = document.createElement("span");
  cargo.className = "tile-sub";
  cargo.textContent = empleado.cargo;
  headtext.appendChild(titulo);
  headtext.appendChild(cargo);

  head.appendChild(tileId);
  head.appendChild(headtext);

  // --- Cuerpo: fecha de ingreso (en estilo monoespaciado) ---
  const body = document.createElement("div");
  body.className = "tile-body";
  const fila = document.createElement("div");
  fila.className = "meta-row";
  const fecha = document.createElement("span");
  fecha.className = "mono";
  fecha.textContent = `Ingreso: ${empleado.fechaIngreso}`;
  fila.appendChild(fecha);
  body.appendChild(fila);

  // --- Acciones ---
  const acciones = document.createElement("div");
  acciones.className = "tile-actions";

  // Botón "Ver asistencias": guarda el id y navega
  const verBtn = document.createElement("button");
  verBtn.className = "button primary small";
  verBtn.textContent = "Ver asistencias →";
  verBtn.addEventListener("click", () => verAsistencias(empleado.id));

  const editarBtn = document.createElement("button");
  editarBtn.className = "button ghost small";
  editarBtn.textContent = "Editar";
  editarBtn.addEventListener("click", () => editarEmpleado(empleado.id));

  const eliminarBtn = document.createElement("button");
  eliminarBtn.className = "button danger small";
  eliminarBtn.textContent = "Eliminar";
  eliminarBtn.addEventListener("click", () => eliminarEmpleado(empleado.id));

  acciones.appendChild(verBtn);
  acciones.appendChild(editarBtn);
  acciones.appendChild(eliminarBtn);
  tile.appendChild(head);
  tile.appendChild(body);
  tile.appendChild(acciones);
  listaEmpleados.appendChild(tile);
}

// ------------------------------------------------------------
// CREAR: agrega un empleado al departamento actual (POST)
// ------------------------------------------------------------
async function crearEmpleado(evento) {
  evento.preventDefault();

  const nuevo = {
    nombre: inputNombre.value,
    cargo: inputCargo.value,
    fechaIngreso: inputFecha.value,
    departamentoId: Number(departamentoId), // lo guardamos como número
  };

  try {
    const respuesta = await axios.post(`${API}/empleados`, nuevo);

    // Mostramos el nuevo empleado al instante
    renderizarEmpleado(respuesta.data);

    formEmpleado.reset();
  } catch (error) {
    manejarError(error, "crear el empleado");
  }
}

// ------------------------------------------------------------
// ACTUALIZAR: edita nombre, cargo y departamento (PATCH)
// El departamento se elige desde un <select> dentro del modal.
// ------------------------------------------------------------
async function editarEmpleado(id) {
  try {
    // Datos actuales del empleado (para precargar el formulario)
    const actual = (await axios.get(`${API}/empleados/${id}`)).data;

    // Traemos los departamentos y armamos las opciones del <select>.
    // map() transforma cada departamento en { value, label }.
    const departamentos = (await axios.get(`${API}/departamentos`)).data;
    const opciones = departamentos.map((depto) => ({
      value: depto.id,
      label: depto.nombre,
    }));

    // Abrimos el modal con los 3 campos (el último es un selector)
    const datos = await abrirModal("Editar empleado", [
      { name: "nombre", label: "Nombre", value: actual.nombre },
      { name: "cargo", label: "Cargo", value: actual.cargo },
      {
        name: "departamentoId",
        label: "Departamento",
        type: "select",
        value: actual.departamentoId,
        options: opciones,
      },
    ]);

    if (!datos) return; // canceló

    // Validación: nombre y cargo no pueden quedar vacíos
    if (!datos.nombre || !datos.cargo) {
      alert("Datos incompletos. No se guardaron los cambios.");
      return;
    }

    // Guardamos los tres campos. Si cambió de departamento, al recargar la
    // lista (filtrada por el departamento actual) el empleado ya no aparecerá:
    // ahora pertenece a otra área.
    await axios.patch(`${API}/empleados/${id}`, {
      nombre: datos.nombre,
      cargo: datos.cargo,
      departamentoId: Number(datos.departamentoId),
    });

    cargarEmpleados();
  } catch (error) {
    manejarError(error, "editar el empleado");
  }
}

// ------------------------------------------------------------
// ELIMINAR EN CASCADA: borra el empleado y sus asistencias
// ------------------------------------------------------------
async function eliminarEmpleado(id) {
  if (!confirm("¿Eliminar el empleado y TODAS sus asistencias?")) {
    return;
  }

  try {
    // Borramos primero las asistencias del empleado
    const respAsistencias = await axios.get(`${API}/asistencias?empleadoId=${id}`);
    for (const asistencia of respAsistencias.data) {
      await axios.delete(`${API}/asistencias/${asistencia.id}`);
    }

    // Y después al empleado
    await axios.delete(`${API}/empleados/${id}`);

    cargarEmpleados();
  } catch (error) {
    manejarError(error, "eliminar el empleado");
  }
}

// ------------------------------------------------------------
// NAVEGAR: guarda el id del empleado y va a sus asistencias
// ------------------------------------------------------------
function verAsistencias(id) {
  localStorage.setItem("empleadoId", id);
  window.location.href = "asistencias.html";
}
