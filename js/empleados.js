// ============================================================
//  EMPLEADOS (empleados.html)
//  CRUD de los empleados del departamento elegido en index.html.
//  El id del departamento llega por localStorage.
// ============================================================

// Dirección de la API fake
const API = "http://localhost:3000";

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
  const respuesta = await axios.get(`${API}/departamentos/${departamentoId}`);
  tituloDepartamento.textContent = `Empleados de ${respuesta.data.nombre}`;
}

// ------------------------------------------------------------
// LEER: trae los empleados de ESTE departamento y los dibuja
// ------------------------------------------------------------
async function cargarEmpleados() {
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

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = iniciales(empleado.nombre);
  avatar.style.background = gradienteAvatar(empleado.nombre);

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

  head.appendChild(avatar);
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

  const respuesta = await axios.post(`${API}/empleados`, nuevo);

  // Mostramos el nuevo empleado al instante
  renderizarEmpleado(respuesta.data);

  formEmpleado.reset();
}

// ------------------------------------------------------------
// ACTUALIZAR: edita nombre, cargo y departamento (PATCH)
// ------------------------------------------------------------
async function editarEmpleado(id) {
  const nuevoNombre = prompt("Nuevo nombre del empleado:");
  const nuevoCargo = prompt("Nuevo cargo:");

  // Validación: nombre y cargo no pueden quedar vacíos
  if (!nuevoNombre || !nuevoCargo) {
    alert("Datos incompletos. No se guardaron los cambios.");
    return;
  }

  // Traemos todos los departamentos para poder cambiar de área al empleado
  const respuesta = await axios.get(`${API}/departamentos`);
  const departamentos = respuesta.data;

  // Armamos un texto con las opciones disponibles (id - nombre)
  let opciones = "Departamento (escribí el número de id):\n";
  departamentos.forEach((depto) => {
    opciones += `${depto.id} - ${depto.nombre}\n`;
  });

  // El prompt arranca con el departamento actual ya cargado como valor por defecto
  const elegido = prompt(opciones, departamentoId);
  if (!elegido) {
    alert("No se eligió departamento. No se guardaron los cambios.");
    return;
  }

  // Validamos que el id elegido exista realmente entre los departamentos
  const existe = departamentos.find((depto) => depto.id === Number(elegido));
  if (!existe) {
    alert("Ese departamento no existe. No se guardaron los cambios.");
    return;
  }

  // Guardamos los tres campos. Si cambió de departamento, al recargar la
  // lista (filtrada por el departamento actual) el empleado ya no aparecerá:
  // ahora pertenece a otra área.
  await axios.patch(`${API}/empleados/${id}`, {
    nombre: nuevoNombre,
    cargo: nuevoCargo,
    departamentoId: Number(elegido),
  });

  cargarEmpleados();
}

// ------------------------------------------------------------
// ELIMINAR EN CASCADA: borra el empleado y sus asistencias
// ------------------------------------------------------------
async function eliminarEmpleado(id) {
  if (!confirm("¿Eliminar el empleado y TODAS sus asistencias?")) {
    return;
  }

  // Borramos primero las asistencias del empleado
  const respAsistencias = await axios.get(`${API}/asistencias?empleadoId=${id}`);
  for (const asistencia of respAsistencias.data) {
    await axios.delete(`${API}/asistencias/${asistencia.id}`);
  }

  // Y después al empleado
  await axios.delete(`${API}/empleados/${id}`);

  cargarEmpleados();
}

// ------------------------------------------------------------
// NAVEGAR: guarda el id del empleado y va a sus asistencias
// ------------------------------------------------------------
function verAsistencias(id) {
  localStorage.setItem("empleadoId", id);
  window.location.href = "asistencias.html";
}

// ============================================================
//  FUNCIONES AUXILIARES PARA EL AVATAR
// ============================================================

// Lista de degradados para los avatares (le da variedad de color)
const GRADIENTES = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #0ea5e9, #22d3ee)",
  "linear-gradient(135deg, #10b981, #34d399)",
  "linear-gradient(135deg, #f59e0b, #fbbf24)",
  "linear-gradient(135deg, #ef4444, #fb7185)",
  "linear-gradient(135deg, #ec4899, #f472b6)",
];

// Devuelve las iniciales de un nombre. Ej: "Laura Martínez" -> "LM"
function iniciales(nombre) {
  const partes = nombre.trim().split(" ");
  const primera = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primera + ultima).toUpperCase();
}

// Elige un degradado fijo según la primera letra del nombre
function gradienteAvatar(nombre) {
  const indice = nombre.charCodeAt(0) % GRADIENTES.length;
  return GRADIENTES[indice];
}
