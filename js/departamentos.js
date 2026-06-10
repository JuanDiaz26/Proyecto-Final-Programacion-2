// ============================================================
//  DEPARTAMENTOS (index.html)
//  CRUD completo de departamentos usando Axios + json-server.
//  Las funciones API, codigoDepartamento(), manejarError() y abrirModal()
//  viven en js/utils.js (se carga antes que este archivo).
// ============================================================

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
  try {
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
  } catch (error) {
    manejarError(error, "cargar los departamentos");
  }
}

// ------------------------------------------------------------
// RENDERIZAR: arma en el DOM la tarjeta de UN departamento
// ------------------------------------------------------------
async function renderizarDepartamento(depto) {
  // Tarjeta
  const tile = document.createElement("div");
  tile.className = "tile";

  // --- Encabezado: identificador (cuadradito + código en mono) + nombre + responsable ---
  const head = document.createElement("div");
  head.className = "tile-head";

  // Identificador editorial: un cuadradito de 8px (--ink) y un código corto en mono
  const tileId = document.createElement("div");
  tileId.className = "tile-id";
  const mark = document.createElement("span");
  mark.className = "mark";
  const code = document.createElement("span");
  code.className = "code";
  code.textContent = codigoDepartamento(depto.nombre);
  tileId.appendChild(mark);
  tileId.appendChild(code);

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

  head.appendChild(tileId);
  head.appendChild(headtext);

  // --- Cuerpo: chip con la cantidad de empleados (se completa luego) ---
  const body = document.createElement("div");
  body.className = "tile-body";
  const cantidad = document.createElement("span");
  cantidad.className = "count";
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
  // Formato "02 empleados": número en mono con cero a la izquierda (padStart).
  const total = await contarEmpleados(depto.id);
  const num = document.createElement("span");
  num.className = "count-num";
  num.textContent = String(total).padStart(2, "0");
  cantidad.textContent = "";
  cantidad.appendChild(num);
  cantidad.append(total === 1 ? " empleado" : " empleados");
}

// ------------------------------------------------------------
// CONTAR: cuántos empleados tiene un departamento
// ------------------------------------------------------------
async function contarEmpleados(id) {
  try {
    const respuesta = await axios.get(`${API}/empleados?departamentoId=${id}`);
    return respuesta.data.length;
  } catch (error) {
    manejarError(error, "contar los empleados");
    return 0; // si falla, mostramos 0 para no romper la tarjeta
  }
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

  try {
    const respuesta = await axios.post(`${API}/departamentos`, nuevo);

    // Mostramos el nuevo departamento al instante (sin recargar)
    renderizarDepartamento(respuesta.data);

    // Limpiamos el formulario
    formDepartamento.reset();
  } catch (error) {
    manejarError(error, "crear el departamento");
  }
}

// ------------------------------------------------------------
// ACTUALIZAR: edita nombre y responsable (PATCH)
// Usa un modal con los datos actuales ya precargados.
// ------------------------------------------------------------
async function editarDepartamento(id) {
  try {
    // Traemos el departamento actual para precargar el formulario
    const actual = (await axios.get(`${API}/departamentos/${id}`)).data;

    // Abrimos el modal y esperamos (await) a que el usuario guarde o cancele
    const datos = await abrirModal("Editar departamento", [
      { name: "nombre", label: "Nombre del departamento", value: actual.nombre },
      { name: "responsable", label: "Responsable", value: actual.responsable },
    ]);

    if (!datos) return; // el usuario canceló

    // Validación: si quedó algo vacío, no guardamos
    if (!datos.nombre || !datos.responsable) {
      alert("Datos incompletos. No se guardaron los cambios.");
      return;
    }

    await axios.patch(`${API}/departamentos/${id}`, {
      nombre: datos.nombre,
      responsable: datos.responsable,
    });

    // Volvemos a dibujar la lista ya actualizada
    cargarDepartamentos();
  } catch (error) {
    manejarError(error, "editar el departamento");
  }
}

// ------------------------------------------------------------
// ELIMINAR EN CASCADA: borra el departamento, sus empleados
// y las asistencias de esos empleados.
// ------------------------------------------------------------
async function eliminarDepartamento(id) {
  if (!confirm("¿Eliminar el departamento y TODOS sus empleados y asistencias?")) {
    return;
  }

  try {
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
  } catch (error) {
    manejarError(error, "eliminar el departamento");
  }
}

// ------------------------------------------------------------
// NAVEGAR: guarda el id elegido y va a la página de empleados
// ------------------------------------------------------------
function verEmpleados(id) {
  localStorage.setItem("departamentoId", id);
  window.location.href = "empleados.html";
}
