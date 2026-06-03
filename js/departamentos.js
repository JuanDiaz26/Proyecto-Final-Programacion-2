// ============================================================
//  DEPARTAMENTOS (index.html)
//  CRUD completo de departamentos usando Axios + json-server.
// ============================================================

// Dirección de la API fake (json-server corre en este puerto)
const API = "http://localhost:3000";

// Tomamos los elementos del HTML que vamos a usar
const listaDepartamentos = document.getElementById("listaDepartamentos");
const formDepartamento = document.getElementById("formDepartamento");
const inputNombre = document.getElementById("nombre");
const inputResponsable = document.getElementById("responsable");

// Cuando la página termina de cargar, traemos los departamentos
document.addEventListener("DOMContentLoaded", cargarDepartamentos);

// Cuando se envía el formulario, creamos un departamento nuevo
formDepartamento.addEventListener("submit", crearDepartamento);

// ------------------------------------------------------------
// LEER: pide los departamentos a la API y los dibuja en pantalla
// ------------------------------------------------------------
async function cargarDepartamentos() {
  const respuesta = await axios.get(`${API}/departamentos`);
  const departamentos = respuesta.data;

  // Limpiamos la lista antes de volver a dibujarla
  listaDepartamentos.innerHTML = "";

  // Si no hay departamentos, mostramos un mensaje y cortamos
  if (departamentos.length === 0) {
    listaDepartamentos.innerHTML =
      '<div class="empty">No hay departamentos todavía. Creá el primero usando el formulario de arriba.</div>';
    return;
  }

  // Recorremos cada departamento y lo dibujamos
  departamentos.forEach((depto) => {
    renderizarDepartamento(depto);
  });
}

// ------------------------------------------------------------
// RENDERIZAR: arma en el DOM la tarjeta de UN departamento
// ------------------------------------------------------------
async function renderizarDepartamento(depto) {
  // Tarjeta
  const tile = document.createElement("div");
  tile.className = "tile";

  // --- Encabezado: avatar con iniciales + nombre + responsable ---
  const head = document.createElement("div");
  head.className = "tile-head";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = iniciales(depto.nombre);
  avatar.style.background = gradienteAvatar(depto.nombre);

  const headtext = document.createElement("div");
  headtext.className = "tile-headtext";
  const titulo = document.createElement("h3");
  titulo.className = "tile-title";
  titulo.textContent = depto.nombre;
  const responsable = document.createElement("span");
  responsable.className = "tile-sub";
  responsable.textContent = depto.responsable;
  headtext.appendChild(titulo);
  headtext.appendChild(responsable);

  head.appendChild(avatar);
  head.appendChild(headtext);

  // --- Cuerpo: chip con la cantidad de empleados (se completa luego) ---
  const body = document.createElement("div");
  body.className = "tile-body";
  const cantidad = document.createElement("span");
  cantidad.className = "chip";
  cantidad.textContent = "…";
  body.appendChild(cantidad);

  // --- Acciones ---
  const acciones = document.createElement("div");
  acciones.className = "tile-actions";

  // Botón "Ver empleados": guarda el id y navega a empleados.html
  const verBtn = document.createElement("button");
  verBtn.className = "button primary small";
  verBtn.textContent = "Ver empleados →";
  verBtn.addEventListener("click", () => verEmpleados(depto.id));

  // Botón "Editar"
  const editarBtn = document.createElement("button");
  editarBtn.className = "button ghost small";
  editarBtn.textContent = "Editar";
  editarBtn.addEventListener("click", () => editarDepartamento(depto.id));

  // Botón "Eliminar"
  const eliminarBtn = document.createElement("button");
  eliminarBtn.className = "button danger small";
  eliminarBtn.textContent = "Eliminar";
  eliminarBtn.addEventListener("click", () => eliminarDepartamento(depto.id));

  // Vamos colgando los elementos uno dentro del otro
  acciones.appendChild(verBtn);
  acciones.appendChild(editarBtn);
  acciones.appendChild(eliminarBtn);
  tile.appendChild(head);
  tile.appendChild(body);
  tile.appendChild(acciones);
  listaDepartamentos.appendChild(tile);

  // Ya está dibujada la tarjeta; ahora pedimos el conteo y lo mostramos.
  // Mostramos "1 empleado" o "X empleados" según corresponda.
  const total = await contarEmpleados(depto.id);
  cantidad.textContent = total === 1 ? "1 empleado" : `${total} empleados`;
}

// ------------------------------------------------------------
// CONTAR: cuántos empleados tiene un departamento
// ------------------------------------------------------------
async function contarEmpleados(id) {
  const respuesta = await axios.get(`${API}/empleados?departamentoId=${id}`);
  return respuesta.data.length;
}

// ------------------------------------------------------------
// CREAR: agrega un departamento nuevo (POST)
// ------------------------------------------------------------
async function crearDepartamento(evento) {
  evento.preventDefault(); // evita que el formulario recargue la página

  const nuevo = {
    nombre: inputNombre.value,
    responsable: inputResponsable.value,
  };

  const respuesta = await axios.post(`${API}/departamentos`, nuevo);

  // Mostramos el nuevo departamento al instante (sin recargar)
  renderizarDepartamento(respuesta.data);

  // Limpiamos el formulario
  formDepartamento.reset();
}

// ------------------------------------------------------------
// ACTUALIZAR: edita nombre y responsable (PATCH)
// ------------------------------------------------------------
async function editarDepartamento(id) {
  const nuevoNombre = prompt("Nuevo nombre del departamento:");
  const nuevoResponsable = prompt("Nuevo responsable:");

  // Validación simple: si quedó algo vacío, no guardamos
  if (!nuevoNombre || !nuevoResponsable) {
    alert("Datos incompletos. No se guardaron los cambios.");
    return;
  }

  await axios.patch(`${API}/departamentos/${id}`, {
    nombre: nuevoNombre,
    responsable: nuevoResponsable,
  });

  // Volvemos a dibujar la lista ya actualizada
  cargarDepartamentos();
}

// ------------------------------------------------------------
// ELIMINAR EN CASCADA: borra el departamento, sus empleados
// y las asistencias de esos empleados.
// ------------------------------------------------------------
async function eliminarDepartamento(id) {
  if (!confirm("¿Eliminar el departamento y TODOS sus empleados y asistencias?")) {
    return;
  }

  // 1) Buscamos los empleados de este departamento
  const respEmpleados = await axios.get(`${API}/empleados?departamentoId=${id}`);
  const empleados = respEmpleados.data;

  // 2) Por cada empleado: borramos sus asistencias y luego al empleado
  for (const empleado of empleados) {
    const respAsistencias = await axios.get(`${API}/asistencias?empleadoId=${empleado.id}`);
    for (const asistencia of respAsistencias.data) {
      await axios.delete(`${API}/asistencias/${asistencia.id}`);
    }
    await axios.delete(`${API}/empleados/${empleado.id}`);
  }

  // 3) Finalmente borramos el departamento
  await axios.delete(`${API}/departamentos/${id}`);

  // 4) Redibujamos la lista
  cargarDepartamentos();
}

// ------------------------------------------------------------
// NAVEGAR: guarda el id elegido y va a la página de empleados
// ------------------------------------------------------------
function verEmpleados(id) {
  localStorage.setItem("departamentoId", id);
  window.location.href = "empleados.html";
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

// Devuelve las iniciales de un nombre. Ej: "Recursos Humanos" -> "RH"
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
