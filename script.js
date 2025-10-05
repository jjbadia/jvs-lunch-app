let alumnos = [], productos = [];

document.getElementById('excelInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data);
  const alumnosSheet = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  const productosSheet = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[1]]);
  alumnos = alumnosSheet.map(a => ({ nombre: a.nombre, curso: a.curso }));
  productos = productosSheet.map(p => ({ producto: p.producto, precio: p.precio }));
  cargarCursos();
  document.getElementById('formulario').style.display = 'block';
  document.getElementById('cargaExcel').style.display = 'none';
  document.getElementById('recargarExcel').style.display = 'inline-block';
});

document.getElementById('recargarExcel').addEventListener('click', () => {
  document.getElementById('cargaExcel').style.display = 'block';
  document.getElementById('formulario').style.display = 'none';
  document.getElementById('recargarExcel').style.display = 'none';
  document.querySelector("#tablaPedidos tbody").innerHTML = "";
});

function cargarCursos() {
  const cursos = [...new Set(alumnos.map(a => a.curso))];
  const select = document.getElementById('filtroCurso');
  select.innerHTML = '<option value="">Todos los cursos</option>';
  cursos.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

document.getElementById('busquedaAlumno').addEventListener('input', () => {
  const texto = document.getElementById('busquedaAlumno').value.toLowerCase();
  const curso = document.getElementById('filtroCurso').value;
  const sugerencias = alumnos.filter(a =>
    a.nombre.toLowerCase().includes(texto) &&
    (curso === "" || a.curso === curso)
  );
  const contenedor = document.getElementById('sugerencias');
  contenedor.innerHTML = "";
  sugerencias.forEach(a => {
    const div = document.createElement('div');
    div.class = "itemBusqueda";
    div.textContent = `${a.nombre} (${a.curso})`;
    div.style.cursor = "pointer";
    div.style.padding = "6px";
    div.style.fontSize = "20px";
    div.style.background = "#ecf0f1";
    div.style.marginBottom = "4px";
    div.onclick = () => seleccionarAlumno(a);
    div.onmouseenter = () => itemBusquedaHover(a);
    div.onmouseleave = () => itemBusquedaRelease(a);
    contenedor.appendChild(div);
  });
});

function itemBusquedaHover( event ) {   
  
};

function itemBusquedaRelease( event ) {   
  
};

function seleccionarAlumno(alumno) {
  document.getElementById('busquedaAlumno').value = alumno.nombre;
  document.getElementById('filtroCurso').value = alumno.curso;
  document.getElementById('sugerencias').innerHTML = "";
  mostrarProductos();
}

function mostrarProductos() {
  const contenedor = document.getElementById('productos');
  contenedor.innerHTML = "<h4>Selecciona productos y cantidad:</h4>";
  productos.forEach((p, i) => {
    const label = document.createElement('label');
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.margin = "12px 0";
    label.style.fontSize = "1.2em";

    const checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.value = i;
    checkbox.id = `check-${i}`;
    checkbox.style.transform = "scale(1.8)";
    checkbox.style.marginRight = "12px";

    const texto = document.createElement('span');
    texto.textContent = `  ${p.producto} - ${p.precio}€`;
    texto.style.fontSize = "1.1em";
    texto.style.marginLeft = "10px";

    const cantidad = document.createElement('input');
    cantidad.type = "number";
    cantidad.min = "1";
    cantidad.value = "1";
    cantidad.id = `cantidad-${i}`;
    cantidad.style.marginLeft = "12px";
    cantidad.style.padding = "12px";
    cantidad.style.fontSize = "1.1em";
    cantidad.style.borderRadius = "8px";
    cantidad.style.border = "1px solid #ccc";
    cantidad.style.width = "80px";

    // Activar checkbox automáticamente al cambiar cantidad
    cantidad.addEventListener('input', () => {
      checkbox.checked = true;
    });

    label.appendChild(checkbox);
    label.appendChild(cantidad);
    label.appendChild(texto);
    
    contenedor.appendChild(label);
  });
}

document.getElementById('guardar').addEventListener('click', () => {
  const nombre = document.getElementById('busquedaAlumno').value;
  const curso = document.getElementById('filtroCurso').value;
  const seleccionados = [...document.querySelectorAll('#productos input[type="checkbox"]:checked')];
  const fecha = new Date();

  seleccionados.forEach(s => {
    const p = productos[s.value];
    const cantidadInput = document.getElementById(`cantidad-${s.value}`);
    const cantidad = parseInt(cantidadInput.value) || 1;
    for (let i = 0; i < cantidad; i++) {
      añadirFila({
        fecha: fecha.toLocaleDateString(),
        hora: fecha.toLocaleTimeString(),
        nombre, curso,
        producto: p.producto,
        precio: p.precio
      });
    }
  });

  limpiarFormulario();
});

function añadirFila(pedido) {
  const tabla = document.querySelector("#tablaPedidos tbody");
  const fila = document.createElement("tr");
  fila.innerHTML = `
    <td>${pedido.fecha}</td>
    <td>${pedido.hora}</td>
    <td>${pedido.nombre}</td>
    <td>${pedido.curso}</td>
    <td>${pedido.producto}</td>
    <td>${pedido.precio}</td>
    <td><button class="btnEliminar">Eliminar</button></td>
  `;
  fila.querySelector(".btnEliminar").onclick = () => fila.remove();
  tabla.insertBefore(fila, tabla.firstChild);
}

document.getElementById('limpiar').addEventListener('click', limpiarFormulario);

function limpiarFormulario() {
  document.getElementById('busquedaAlumno').value = "";
  document.getElementById('filtroCurso').value = "";
  document.getElementById('sugerencias').innerHTML = "";
  document.getElementById('productos').innerHTML = "";
}

document.getElementById('exportar').addEventListener('click', () => {
  const filas = [...document.querySelectorAll("#tablaPedidos tbody tr")];
  const datos = filas.map(f => {
    const celdas = f.querySelectorAll("td");
    return {
      fecha: celdas[0].textContent,
      hora: celdas[1].textContent,
      nombre: celdas[2].textContent,
      curso: celdas[3].textContent,
      producto: celdas[4].textContent,
      precio: parseFloat(celdas[5].textContent)
    };
  });
  const hoja = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();

  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;

  const formattedToday = 'Pedidos - ' + yyyy + '-' + mm + '-' + dd;
  XLSX.utils.book_append_sheet(wb, hoja, formattedToday);
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), formattedToday + ".xlsx");
});