// ============================================================
//  UTILIDADES COMPARTIDAS
//  Funciones que usan las TRES páginas. Se carga ANTES que el
//  script de cada página, así todas pueden usar lo de acá.
//  (Antes este código estaba repetido en cada archivo.)
// ============================================================

// Dirección de la API fake (json-server). Un solo lugar para todas las páginas.
const API = "http://localhost:3000";

// ============================================================
//  1) IDENTIFICADORES DE TARJETA (iniciales + código corto)
// ============================================================

// Devuelve las iniciales de un nombre. Ej: "Laura Martínez" -> "LM"
// (se usa como código del empleado en la tarjeta)
function iniciales(nombre) {
  const partes = nombre.trim().split(" ");
  const primera = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primera + ultima).toUpperCase();
}

// ---------- Código corto del departamento (estilo editorial) ----------
// Override OPCIONAL: para pisar a mano casos puntuales. Si el nombre no
// está acá, el código se calcula solo con la regla de abajo.
// Ej: descomentar para forzar "Ventas" -> "VTA".
const CODIGOS_DEPARTAMENTO = {
  // "Ventas": "VTA",
};

// Devuelve un código corto en mayúsculas para mostrar en la tarjeta.
// Regla automática:
//   - varias palabras -> iniciales de cada palabra ("Recursos Humanos" -> "RH")
//   - una sola palabra -> primeras 3 letras ("Sistemas" -> "SIS", "Ventas" -> "VEN")
// El override de arriba siempre tiene prioridad.
function codigoDepartamento(nombre) {
  const limpio = nombre.trim();
  if (CODIGOS_DEPARTAMENTO[limpio]) return CODIGOS_DEPARTAMENTO[limpio];

  const palabras = limpio.split(/\s+/);
  if (palabras.length > 1) {
    return palabras.map((p) => p[0]).join("").toUpperCase();
  }
  return limpio.slice(0, 3).toUpperCase();
}

// ============================================================
//  2) FECHAS
// ============================================================

// Devuelve la fecha de HOY en formato ISO (AAAA-MM-DD), el mismo
// que usa el <input type="date"> y los datos de ejemplo de db.json.
function fechaHoyISO() {
  return new Date().toISOString().slice(0, 10);
}

// Devuelve una fecha relativa a hoy en formato ISO.
// Ej: fechaRelativaISO(-1) -> ayer. (Lo usamos para avisar si falta cargar ayer.)
function fechaRelativaISO(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

// ============================================================
//  3) MANEJO DE ERRORES
// ============================================================

// Si una llamada a la API falla (ej: json-server apagado, sin red),
// mostramos un aviso claro en vez de que la página falle "en silencio".
function manejarError(error, accion) {
  console.error(error); // queda el detalle técnico en la consola (F12)
  alert(`No se pudo ${accion}.\n\nRevisá que json-server esté corriendo en ${API}.`);
}

// ============================================================
//  4) MODAL REUTILIZABLE (reemplaza a prompt())
// ============================================================

// Abre un formulario dentro de una ventana modal y devuelve una PROMESA:
//  - se resuelve con un objeto { campo: valor, ... } si el usuario guarda
//  - se resuelve con null si cancela (botón Cancelar, fondo o tecla Escape)
//
// "campos" es un array de objetos que describe cada input, por ejemplo:
//  [{ name: "nombre", label: "Nombre", value: "Laura" },
//   { name: "deptoId", label: "Departamento", type: "select",
//     value: 2, options: [{ value: 1, label: "Sistemas" }, ...] }]
function abrirModal(titulo, campos) {
  return new Promise((resolve) => {
    // --- Fondo oscuro que cubre la pantalla ---
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    // --- Caja del modal ---
    const caja = document.createElement("div");
    caja.className = "modal-box";

    const h = document.createElement("h3");
    h.className = "modal-title";
    h.textContent = titulo;
    caja.appendChild(h);

    // --- Formulario con un campo por cada item de "campos" ---
    const form = document.createElement("form");
    const inputs = {}; // guardamos cada input por su "name" para leerlo después

    campos.forEach((campo) => {
      const label = document.createElement("label");
      label.className = "modal-label";
      label.textContent = campo.label;

      let input;
      if (campo.type === "select") {
        // Campo de selección (ej: elegir departamento)
        input = document.createElement("select");
        input.className = "field";
        campo.options.forEach((op) => {
          const opcion = document.createElement("option");
          opcion.value = op.value;
          opcion.textContent = op.label;
          // Dejamos elegida la opción que coincide con el valor actual
          if (String(op.value) === String(campo.value)) opcion.selected = true;
          input.appendChild(opcion);
        });
      } else {
        // Campo de texto / fecha normal
        input = document.createElement("input");
        input.className = "field";
        input.type = campo.type || "text";
        input.value = campo.value != null ? campo.value : "";
        // Límites opcionales (ej: max = hoy para no permitir fechas futuras)
        if (campo.max != null) input.max = campo.max;
        if (campo.min != null) input.min = campo.min;
      }

      inputs[campo.name] = input;
      label.appendChild(input);
      form.appendChild(label);
    });

    // --- Botones Cancelar / Guardar ---
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

    // Ponemos el foco en el primer campo para poder escribir de una
    const primero = campos[0] && inputs[campos[0].name];
    if (primero) primero.focus();

    // Cierra el modal (lo saca del DOM) y resuelve la promesa
    function cerrar(resultado) {
      document.removeEventListener("keydown", alPresionarTecla);
      overlay.remove();
      resolve(resultado);
    }

    // Al enviar el formulario: juntamos los valores y resolvemos con ellos
    form.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const valores = {};
      campos.forEach((campo) => {
        valores[campo.name] = inputs[campo.name].value;
      });
      cerrar(valores);
    });

    // Cancelar / clic en el fondo / tecla Escape -> resolvemos con null
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

// ============================================================
//  5) NAVEGACIÓN POR EL DOM (tabs del header + enlaces del footer)
// ============================================================

// Hace que las tabs del header Y los enlaces del footer naveguen, usando el
// MISMO mecanismo que los botones de cada tarjeta (localStorage + window.location).
// Engancha a CUALQUIER elemento con [data-nav].
//   - "Departamentos" siempre está disponible (index.html).
//   - "Empleados" necesita un departamento elegido; si no hay, queda deshabilitado.
//   - "Asistencias" necesita un empleado elegido; si no hay, queda deshabilitado.
// El elemento de la página actual (is-active) no navega.
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
    // El elemento de la página actual no hace nada
    if (item.classList.contains("is-active")) return;

    const destino = item.dataset.nav;

    // ¿Está disponible según lo que ya haya elegido el usuario?
    let disponible = true;
    if (destino === "empleados") disponible = hayDepto;
    if (destino === "asistencias") disponible = hayEmpleado;

    if (!disponible) {
      // Sin selección previa no hay nada para mostrar: lo deshabilitamos
      item.classList.add("is-disabled");
      item.setAttribute("aria-disabled", "true");
      return;
    }

    item.addEventListener("click", () => {
      window.location.href = destinos[destino];
    });
  });
}

// Se activa en las TRES páginas (utils.js se carga en todas)
document.addEventListener("DOMContentLoaded", activarNavegacion);
