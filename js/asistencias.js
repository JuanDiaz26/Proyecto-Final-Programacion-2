// ASISTENCIAS (ASISTENCIAS.HTML)
// EL ID DEL EMPLEADO LLEGA POR LOCALSTORAGE

const empleadoId = localStorage.getItem("empleadoId");

const listaAsistencias = document.getElementById("listaAsistencias");
const botonRegistrar = document.getElementById("botonRegistrar");
const tituloEmpleado = document.getElementById("tituloEmpleado");
const botonVolver = document.getElementById("botonVolver");

// LOS 3 ESTADOS POSIBLES
const ESTADOS = ["Presente", "Ausente", "Tardanza"];

document.addEventListener("DOMContentLoaded", iniciar);
botonRegistrar.addEventListener("click", crearAsistencia);

botonVolver.addEventListener("click", () => {
  window.location.href = "empleados.html";
});

async function iniciar() {
  if (!empleadoId) {
    tituloEmpleado.textContent = "No se seleccionó ningún empleado.";
    return;
  }
  await mostrarNombreEmpleado();
  await cargarAsistencias();
}

// PONE EL NOMBRE DEL EMPLEADO EN EL TITULO
async function mostrarNombreEmpleado() {
  try {
    const respuesta = await axios.get(`${API}/empleados/${empleadoId}`);
    tituloEmpleado.textContent = `Asistencias de ${respuesta.data.nombre}`;
  } catch (error) {
    manejarError(error, "obtener el empleado");
  }
}

// LEER: TRAIGO LAS ASISTENCIAS Y LAS ORDENO DE LA MAS NUEVA A LA MAS VIEJA
async function cargarAsistencias() {
  try {
    const respuesta = await axios.get(`${API}/asistencias?empleadoId=${empleadoId}`);
    const asistencias = respuesta.data;

    // ORDENO POR FECHA. COMO ESTA EN ISO (AAAA-MM-DD) COMPARANDO EL TEXTO YA QUEDA BIEN
    // SI HAY VARIAS DEL MISMO DIA, DESEMPATA EL ID
    asistencias.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);

    listaAsistencias.innerHTML = "";

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

// RENDERIZAR: ARMO LA FILA DE UNA ASISTENCIA
function renderizarAsistencia(asistencia) {
  // ARMO LA CLASE DE COLOR DESDE EL ESTADO (Presente -> is-presente)
  const claseColor = "is-" + asistencia.estado.toLowerCase();

  const item = document.createElement("div");
  item.className = "row-item";

  const izquierda = document.createElement("div");
  izquierda.className = "row-left";

  // EL CUADRADITO DE COLOR SEGUN EL ESTADO
  const marca = document.createElement("span");
  marca.className = "row-icon " + claseColor;

  // EL TEXTO DEL ESTADO SIEMPRE VISIBLE (NO TODOS DISTINGUEN EL COLOR)
  const estadoTexto = document.createElement("span");
  estadoTexto.className = "row-state " + claseColor;
  estadoTexto.textContent = asistencia.estado;

  const fecha = document.createElement("span");
  fecha.className = "row-date";
  fecha.textContent = asistencia.fecha;

  izquierda.appendChild(marca);
  izquierda.appendChild(estadoTexto);
  izquierda.appendChild(fecha);

  const derecha = document.createElement("div");
  derecha.className = "row-right";

  // SELECT DE ESTADO: AL CAMBIARLO SE GUARDA SOLO CON PATCH
  const select = document.createElement("select");
  select.className = "status " + claseColor;
  ESTADOS.forEach((estado) => {
    const opcion = document.createElement("option");
    opcion.value = estado;
    opcion.textContent = estado;
    if (estado === asistencia.estado) {
      opcion.selected = true; // DEJO ELEGIDO EL ESTADO ACTUAL
    }
    select.appendChild(opcion);
  });
  select.addEventListener("change", () => editarAsistencia(asistencia.id, select.value));

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

// CREAR (POST) - ABRO EL MODAL (LA VENTANITA) PARA ELEGIR FECHA Y ESTADO
async function crearAsistencia() {
  const hoy = fechaHoyISO();

  // EL MAX: HOY ES PARA QUE EL CALENDARIO NO DEJE ELEGIR DIAS FUTUROS
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
  if (!datos) return; // CANCELO

  if (!datos.fecha) {
    alert("Elegí una fecha.");
    return;
  }
  if (datos.fecha > hoy) {
    alert("No se puede registrar una fecha futura.");
    return;
  }

  try {
    // NO DEJO CARGAR DOS VECES EL MISMO DIA
    const mismaFecha = (
      await axios.get(`${API}/asistencias?empleadoId=${empleadoId}&fecha=${datos.fecha}`)
    ).data;
    if (mismaFecha.length > 0) {
      alert("Ya hay una asistencia registrada para esa fecha.");
      return;
    }

    // SI CARGO HOY Y FALTA AYER, AVISO (PERO NO TRABO)
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

    cargarAsistencias();
  } catch (error) {
    manejarError(error, "registrar la asistencia");
  }
}

// ACTUALIZAR EL ESTADO (PATCH)
async function editarAsistencia(id, nuevoEstado) {
  try {
    await axios.patch(`${API}/asistencias/${id}`, { estado: nuevoEstado });
    cargarAsistencias();
  } catch (error) {
    manejarError(error, "actualizar el estado");
  }
}

// ELIMINAR UNA SOLA ASISTENCIA (DELETE) - NO TIENE HIJOS ASI QUE NO HAY CASCADA
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
