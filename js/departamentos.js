// DEPARTAMENTOS (INDEX.HTML) - CRUD CON AXIOS Y JSON-SERVER
// LO COMPARTIDO (API, MODAL, ETC) ESTA EN UTILS.JS

const listaDepartamentos = document.getElementById("listaDepartamentos");
const formDepartamento = document.getElementById("formDepartamento");
const inputNombre = document.getElementById("nombre");
const inputResponsable = document.getElementById("responsable");

// CUANDO CARGA LA PAGINA TRAIGO LOS DEPARTAMENTOS
document.addEventListener("DOMContentLoaded", cargarDepartamentos);
formDepartamento.addEventListener("submit", crearDepartamento);

// LEER: PIDO LOS DEPARTAMENTOS A LA API Y LOS DIBUJO
async function cargarDepartamentos() {
  try {
    const respuesta = await axios.get(`${API}/departamentos`);
    const departamentos = respuesta.data;

    listaDepartamentos.innerHTML = ""; // LIMPIO ANTES PARA NO DUPLICAR

    if (departamentos.length === 0) {
      listaDepartamentos.innerHTML =
        '<div class="empty">No hay departamentos todavía. Creá el primero usando el formulario de arriba.</div>';
      return;
    }

    // FOREACH RECORRE Y VA DIBUJANDO CADA UNO
    departamentos.forEach((depto) => {
      renderizarDepartamento(depto);
    });
  } catch (error) {
    manejarError(error, "cargar los departamentos");
  }
}

// RENDERIZAR: ARMA LA TARJETA DE UN DEPARTAMENTO EN EL DOM
// ESTO ES TODO DOM (DOCUMENT OBJETC MODEL), CREO LAS COSAS DESDE JS
async function renderizarDepartamento(depto) {
  const tile = document.createElement("div");
  tile.className = "tile";

  const head = document.createElement("div");
  head.className = "tile-head";

  // EL CUADRADITO + EL CODIGO CORTO (SIS, RH, VEN)
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

  const body = document.createElement("div");
  body.className = "tile-body";
  const cantidad = document.createElement("span");
  cantidad.className = "count";
  cantidad.textContent = "…";
  body.appendChild(cantidad);

  const acciones = document.createElement("div");
  acciones.className = "tile-actions";

  // BOTON VER EMPLEADOS: GUARDA EL ID Y CAMBIA DE PAGINA
  const verBtn = document.createElement("button");
  verBtn.className = "button primary small";
  verBtn.textContent = "Ver empleados →";
  verBtn.addEventListener("click", () => verEmpleados(depto.id));

  const editarBtn = document.createElement("button");
  editarBtn.className = "button ghost small";
  editarBtn.textContent = "Editar";
  editarBtn.addEventListener("click", () => editarDepartamento(depto.id));

  const eliminarBtn = document.createElement("button");
  eliminarBtn.className = "button danger small";
  eliminarBtn.textContent = "Eliminar";
  eliminarBtn.addEventListener("click", () => eliminarDepartamento(depto.id));

  // VOY COLGANDO TODO CON APPENDCHILD
  acciones.appendChild(verBtn);
  acciones.appendChild(editarBtn);
  acciones.appendChild(eliminarBtn);
  tile.appendChild(head);
  tile.appendChild(body);
  tile.appendChild(acciones);
  listaDepartamentos.appendChild(tile);

  // RECIEN ACA PIDO CUANTOS EMPLEADOS TIENE Y LO MUESTRO (02 EMPLEADOS)
  const total = await contarEmpleados(depto.id);
  const num = document.createElement("span");
  num.className = "count-num";
  num.textContent = String(total).padStart(2, "0");
  cantidad.textContent = "";
  cantidad.appendChild(num);
  cantidad.append(total === 1 ? " empleado" : " empleados");
}

// CUENTA CUANTOS EMPLEADOS TIENE EL DEPARTAMENTO (USA EL .LENGTH)
async function contarEmpleados(id) {
  try {
    const respuesta = await axios.get(`${API}/empleados?departamentoId=${id}`);
    return respuesta.data.length;
  } catch (error) {
    manejarError(error, "contar los empleados");
    return 0;
  }
}

// CREAR (POST)
async function crearDepartamento(evento) {
  evento.preventDefault(); // PARA QUE NO SE RECARGUE LA PAGINA

  // EL TRIM SACA LOS ESPACIOS DE LOS COSTADOS
  const nombre = inputNombre.value.trim();
  const responsable = inputResponsable.value.trim();

  if (!nombre || !responsable) {
    alert("Completá el nombre y el responsable.");
    return;
  }

  try {
    // CHEQUEO QUE NO EXISTA OTRO IGUAL (SOME DEVUELVE TRUE SI YA ESTA)
    const existentes = (await axios.get(`${API}/departamentos`)).data;
    const repetido = existentes.some(
      (d) => d.nombre.trim().toLowerCase() === nombre.toLowerCase()
    );
    if (repetido) {
      alert(`Ya existe un departamento llamado "${nombre}".`);
      return;
    }

    const respuesta = await axios.post(`${API}/departamentos`, { nombre, responsable });

    // LO MUESTRO AL TOQUE SIN RECARGAR
    renderizarDepartamento(respuesta.data);
    formDepartamento.reset();
  } catch (error) {
    manejarError(error, "crear el departamento");
  }
}

// ACTUALIZAR (PATCH) - ABRE EL MODAL CON LOS DATOS YA CARGADOS
async function editarDepartamento(id) {
  try {
    const actual = (await axios.get(`${API}/departamentos/${id}`)).data;

    // ACA USO EL MODAL (LA VENTANITA NUESTRA PARA EDITAR), EL AWAIT ESPERA QUE GUARDE O CANCELE
    const datos = await abrirModal("Editar departamento", [
      { name: "nombre", label: "Nombre del departamento", value: actual.nombre },
      { name: "responsable", label: "Responsable", value: actual.responsable },
    ]);

    if (!datos) return; // CANCELO

    const nombre = datos.nombre.trim();
    const responsable = datos.responsable.trim();

    if (!nombre || !responsable) {
      alert("Datos incompletos. No se guardaron los cambios.");
      return;
    }

    // QUE EL NOMBRE NUEVO NO CHOQUE CON OTRO (EL D.ID !== ID DEJA PASAR EL ACTUAL)
    const existentes = (await axios.get(`${API}/departamentos`)).data;
    const repetido = existentes.some(
      (d) => d.id !== id && d.nombre.trim().toLowerCase() === nombre.toLowerCase()
    );
    if (repetido) {
      alert(`Ya existe otro departamento llamado "${nombre}".`);
      return;
    }

    await axios.patch(`${API}/departamentos/${id}`, { nombre, responsable });
    cargarDepartamentos();
  } catch (error) {
    manejarError(error, "editar el departamento");
  }
}

// ELIMINAR EN CASCADA: BORRO ASISTENCIAS, DESPUES EMPLEADOS Y AL FINAL EL DEPTO
// JSON-SERVER NO BORRA SOLO LOS HIJOS ASI QUE LO HAGO A MANO
async function eliminarDepartamento(id) {
  if (!confirm("¿Eliminar el departamento y TODOS sus empleados y asistencias?")) {
    return;
  }

  try {
    const respEmpleados = await axios.get(`${API}/empleados?departamentoId=${id}`);
    const empleados = respEmpleados.data;

    // POR CADA EMPLEADO BORRO SUS ASISTENCIAS Y DESPUES AL EMPLEADO
    for (const empleado of empleados) {
      const respAsistencias = await axios.get(`${API}/asistencias?empleadoId=${empleado.id}`);
      for (const asistencia of respAsistencias.data) {
        await axios.delete(`${API}/asistencias/${asistencia.id}`);
      }
      await axios.delete(`${API}/empleados/${empleado.id}`);
    }

    await axios.delete(`${API}/departamentos/${id}`); // RECIEN ACA EL DEPTO
    cargarDepartamentos();
  } catch (error) {
    manejarError(error, "eliminar el departamento");
  }
}

// GUARDO EL ID EN EL LOCALSTORAGE Y ME VOY A EMPLEADOS
function verEmpleados(id) {
  localStorage.setItem("departamentoId", id);
  window.location.href = "empleados.html";
}
