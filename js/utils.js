// UTILS - FUNCIONES QUE USAN LAS 3 PAGINAS
// ESTE ARCHIVO SE CARGA ANTES QUE LOS DEMAS ASI YA EXISTEN ESTAS FUNCIONES

// LA DIRECCION DE LA API EN UN SOLO LUGAR
const API = "http://localhost:3000";

// INICIALES DE UN NOMBRE (Laura Martinez -> LM)
function iniciales(nombre) {
  const partes = nombre.trim().split(" ");
  const primera = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primera + ultima).toUpperCase();
}

// SI QUIERO FORZAR UNA ABREVIATURA A MANO LA PONGO ACA, SINO SE CALCULA SOLA
const CODIGOS_DEPARTAMENTO = {
  // "Ventas": "VTA",
};

// CODIGO CORTO DEL DEPTO: VARIAS PALABRAS -> INICIALES, UNA SOLA -> 3 LETRAS
function codigoDepartamento(nombre) {
  const limpio = nombre.trim();
  if (CODIGOS_DEPARTAMENTO[limpio]) return CODIGOS_DEPARTAMENTO[limpio];

  const palabras = limpio.split(/\s+/);
  if (palabras.length > 1) {
    return palabras.map((p) => p[0]).join("").toUpperCase();
  }
  return limpio.slice(0, 3).toUpperCase();
}

// FECHA DE HOY EN FORMATO ISO (AAAA-MM-DD), IGUAL QUE EL DB.JSON
function fechaHoyISO() {
  return new Date().toISOString().slice(0, 10);
}

// FECHA RELATIVA: fechaRelativaISO(-1) ME DA AYER
function fechaRelativaISO(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

// SI SE CAE LA API AVISO CON UN ALERT EN VEZ DE QUE FALLE SIN MOSTRAR NADA
function manejarError(error, accion) {
  console.error(error); // EL DETALLE TECNICO QUEDA EN LA CONSOLA (F12)
  alert(`No se pudo ${accion}.\n\nRevisá que json-server esté corriendo en ${API}.`);
}

// ===== EL MODAL =====
// ESTA ES LA VENTANITA NUESTRA PARA EDITAR (REEMPLAZA AL PROMPT FEO DEL NAVEGADOR)
// DEVUELVE UNA PROMESA: TRAE LOS DATOS SI EL USUARIO GUARDA, O NULL SI CANCELA
// POR ESO AFUERA LA USAMOS CON AWAIT (ESPERA A QUE EL USUARIO DECIDA). ESTO ES LO MAS DIFICIL, ACORDARSE
function abrirModal(titulo, campos) {
  return new Promise((resolve) => {
    // EL FONDO OSCURO QUE TAPA LA PANTALLA
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    // LA CAJA BLANCA DEL MEDIO
    const caja = document.createElement("div");
    caja.className = "modal-box";

    const h = document.createElement("h3");
    h.className = "modal-title";
    h.textContent = titulo;
    caja.appendChild(h);

    const form = document.createElement("form");
    const inputs = {}; // GUARDO CADA INPUT POR SU NOMBRE PARA LEERLO DESPUES

    // POR CADA CAMPO QUE ME PASARON ARMO SU INPUT
    campos.forEach((campo) => {
      const label = document.createElement("label");
      label.className = "modal-label";
      label.textContent = campo.label;

      let input;
      if (campo.type === "select") {
        // SI ES UN SELECT (EJ: ELEGIR DEPTO) ARMO LAS OPCIONES
        input = document.createElement("select");
        input.className = "field";
        campo.options.forEach((op) => {
          const opcion = document.createElement("option");
          opcion.value = op.value;
          opcion.textContent = op.label;
          if (String(op.value) === String(campo.value)) opcion.selected = true;
          input.appendChild(opcion);
        });
      } else {
        // SI ES TEXTO O FECHA NORMAL
        input = document.createElement("input");
        input.className = "field";
        input.type = campo.type || "text";
        input.value = campo.value != null ? campo.value : "";
        if (campo.max != null) input.max = campo.max; // MAX PARA QUE NO ELIJA FECHA FUTURA
        if (campo.min != null) input.min = campo.min;
      }

      inputs[campo.name] = input;
      label.appendChild(input);
      form.appendChild(label);
    });

    // LOS BOTONES CANCELAR Y GUARDAR
    const acciones = document.createElement("div");
    acciones.className = "modal-actions";

    const cancelar = document.createElement("button");
    cancelar.type = "button";
    cancelar.className = "button ghost";
    cancelar.textContent = "Cancelar";

    const guardar = document.createElement("button");
    guardar.type = "submit";
    guardar.className = "button primary";
    guardar.textContent = "Guardar";

    acciones.appendChild(cancelar);
    acciones.appendChild(guardar);
    form.appendChild(acciones);

    caja.appendChild(form);
    overlay.appendChild(caja);
    document.body.appendChild(overlay);

    // FOCO EN EL PRIMER CAMPO PARA EMPEZAR A ESCRIBIR DE UNA
    const primero = campos[0] && inputs[campos[0].name];
    if (primero) primero.focus();

    // CIERRA EL MODAL (LO SACA DEL DOM) Y RESUELVE LA PROMESA
    function cerrar(resultado) {
      document.removeEventListener("keydown", alPresionarTecla);
      overlay.remove();
      resolve(resultado);
    }

    // AL GUARDAR JUNTO TODOS LOS VALORES Y LOS DEVUELVO
    form.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const valores = {};
      campos.forEach((campo) => {
        valores[campo.name] = inputs[campo.name].value;
      });
      cerrar(valores);
    });

    // CANCELAR / CLICK EN EL FONDO / TECLA ESC -> DEVUELVE NULL
    cancelar.addEventListener("click", () => cerrar(null));
    overlay.addEventListener("click", (evento) => {
      if (evento.target === overlay) cerrar(null);
    });
    function alPresionarTecla(evento) {
      if (evento.key === "Escape") cerrar(null);
    }
    document.addEventListener("keydown", alPresionarTecla);
  });
}

// HACE QUE LAS TABS DE ARRIBA Y LOS LINKS DEL FOOTER NAVEGUEN
// USA LO MISMO QUE LOS BOTONES: LOCALSTORAGE + WINDOW.LOCATION
// EMPLEADOS Y ASISTENCIAS SE DESABILITAN SI TODAVIA NO ELEGISTE NADA
function activarNavegacion() {
  const items = document.querySelectorAll("[data-nav]");
  const hayDepto = !!localStorage.getItem("departamentoId");
  const hayEmpleado = !!localStorage.getItem("empleadoId");

  const destinos = {
    departamentos: "index.html",
    empleados: "empleados.html",
    asistencias: "asistencias.html",
  };

  items.forEach((item) => {
    if (item.classList.contains("is-active")) return; // EL DE LA PAGINA ACTUAL NO HACE NADA

    const destino = item.dataset.nav;

    let disponible = true;
    if (destino === "empleados") disponible = hayDepto;
    if (destino === "asistencias") disponible = hayEmpleado;

    if (!disponible) {
      item.classList.add("is-disabled");
      item.setAttribute("aria-disabled", "true");
      return;
    }

    item.addEventListener("click", () => {
      window.location.href = destinos[destino];
    });
  });
}

document.addEventListener("DOMContentLoaded", activarNavegacion);
