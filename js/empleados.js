// EMPLEADOS (EMPLEADOS.HTML)
// EL ID DEL DEPTO LLEGA POR LOCALSTORAGE DE LA PAGINA ANTERIOR

const departamentoId = localStorage.getItem("departamentoId");

const listaEmpleados = document.getElementById("listaEmpleados");
const formEmpleado = document.getElementById("formEmpleado");
const tituloDepartamento = document.getElementById("tituloDepartamento");
const botonVolver = document.getElementById("botonVolver");
const inputNombre = document.getElementById("nombre");
const inputCargo = document.getElementById("cargo");
const inputFecha = document.getElementById("fechaIngreso");

document.addEventListener("DOMContentLoaded", iniciar);
formEmpleado.addEventListener("submit", crearEmpleado);

// EL BOTON VOLVER ME LLEVA DE VUELTA A DEPARTAMENTOS
botonVolver.addEventListener("click", () => {
  window.location.href = "index.html";
});

async function iniciar() {
  // SI ENTRARON DERECHO SIN ELEGIR DEPTO NO HAY NADA QUE MOSTRAR
  if (!departamentoId) {
    tituloDepartamento.textContent = "No se seleccionó ningún departamento.";
    return;
  }
  await mostrarNombreDepartamento();
  await cargarEmpleados();
}

// PONE EL NOMBRE DEL DEPTO EN EL TITULO
async function mostrarNombreDepartamento() {
  try {
    const respuesta = await axios.get(`${API}/departamentos/${departamentoId}`);
    tituloDepartamento.textContent = `Empleados de ${respuesta.data.nombre}`;
  } catch (error) {
    manejarError(error, "obtener el departamento");
  }
}

// LEER: TRAIGO SOLO LOS EMPLEADOS DE ESTE DEPTO (FILTRO ?departamentoId=)
async function cargarEmpleados() {
  try {
    const respuesta = await axios.get(`${API}/empleados?departamentoId=${departamentoId}`);
    const empleados = respuesta.data;

    listaEmpleados.innerHTML = "";

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

// RENDERIZAR: DIBUJO LA TARJETA DEL EMPLEADO (TODO CON DOM)
function renderizarEmpleado(empleado) {
  const tile = document.createElement("div");
  tile.className = "tile";

  const head = document.createElement("div");
  head.className = "tile-head";

  // CUADRADITO + LAS INICIALES DEL EMPLEADO
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

  const body = document.createElement("div");
  body.className = "tile-body";
  const fila = document.createElement("div");
  fila.className = "meta-row";
  const fecha = document.createElement("span");
  fecha.className = "mono";
  fecha.textContent = `Ingreso: ${empleado.fechaIngreso}`;
  fila.appendChild(fecha);
  body.appendChild(fila);

  const acciones = document.createElement("div");
  acciones.className = "tile-actions";

  // BOTON VER ASISTENCIAS: GUARDA EL ID Y VA A LA OTRA PAGINA
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

// CREAR EMPLEADO (POST)
async function crearEmpleado(evento) {
  evento.preventDefault();

  const nombre = inputNombre.value.trim();
  const cargo = inputCargo.value.trim();
  const fechaIngreso = inputFecha.value;

  if (!nombre || !cargo || !fechaIngreso) {
    alert("Completá nombre, cargo y fecha de ingreso.");
    return;
  }

  try {
    // ACA SOLO AVISO, NO BLOQUEO, PORQUE DOS PERSONAS SE PUEDEN LLAMAR IGUAL
    const delDepto = (await axios.get(`${API}/empleados?departamentoId=${departamentoId}`)).data;
    const yaExiste = delDepto.some(
      (e) => e.nombre.trim().toLowerCase() === nombre.toLowerCase()
    );
    if (yaExiste) {
      const seguir = confirm(
        `Ya hay un empleado llamado "${nombre}" en este departamento. ¿Lo agrego igual?`
      );
      if (!seguir) return;
    }

    // ARMO EL OBJETO Y LO MANDO. EL DEPARTAMENTOID VA COMO NUMERO
    const nuevo = {
      nombre,
      cargo,
      fechaIngreso,
      departamentoId: Number(departamentoId),
    };
    const respuesta = await axios.post(`${API}/empleados`, nuevo);

    renderizarEmpleado(respuesta.data);
    formEmpleado.reset();
  } catch (error) {
    manejarError(error, "crear el empleado");
  }
}

// EDITAR EMPLEADO (PATCH) - EL DEPTO SE ELIGE DE UNA LISTA EN EL MODAL
async function editarEmpleado(id) {
  try {
    const actual = (await axios.get(`${API}/empleados/${id}`)).data;

    // CON MAP ARMO LAS OPCIONES DEL SELECT (CADA DEPTO -> {value, label})
    const departamentos = (await axios.get(`${API}/departamentos`)).data;
    const opciones = departamentos.map((depto) => ({
      value: depto.id,
      label: depto.nombre,
    }));

    // ABRO EL MODAL CON 3 CAMPOS, EL ULTIMO ES EL SELECT DEL DEPTO
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

    if (!datos) return; // CANCELO

    const nombre = datos.nombre.trim();
    const cargo = datos.cargo.trim();

    if (!nombre || !cargo) {
      alert("Datos incompletos. No se guardaron los cambios.");
      return;
    }

    // SI LE CAMBIO EL DEPTO, AL RECARGAR YA NO APARECE ACA (PASO A OTRA AREA)
    await axios.patch(`${API}/empleados/${id}`, {
      nombre,
      cargo,
      departamentoId: Number(datos.departamentoId),
    });

    cargarEmpleados();
  } catch (error) {
    manejarError(error, "editar el empleado");
  }
}

// ELIMINAR EN CASCADA: PRIMERO LAS ASISTENCIAS Y DESPUES EL EMPLEADO
async function eliminarEmpleado(id) {
  if (!confirm("¿Eliminar el empleado y TODAS sus asistencias?")) {
    return;
  }

  try {
    const respAsistencias = await axios.get(`${API}/asistencias?empleadoId=${id}`);
    for (const asistencia of respAsistencias.data) {
      await axios.delete(`${API}/asistencias/${asistencia.id}`);
    }

    await axios.delete(`${API}/empleados/${id}`);
    cargarEmpleados();
  } catch (error) {
    manejarError(error, "eliminar el empleado");
  }
}

// GUARDO EL ID DEL EMPLEADO Y ME VOY A SUS ASISTENCIAS
function verAsistencias(id) {
  localStorage.setItem("empleadoId", id);
  window.location.href = "asistencias.html";
}
