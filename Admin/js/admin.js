$(document).ready(function () {
    const token = localStorage.getItem("token")

    if (!token) {
        window.location = "/login.html"
    }

    console.log(token)
    cargarDatos()

    $("#formProducto").submit(function (e) {

        e.preventDefault()

        guardarProducto()

    })

})

async function cargarDatos() {

    const res = await fetch("/api/productos")
    const data = await res.json()
    const tabla = $("#tablaProductos")
    let activo = 'No';
    let totalProductos = 0;
    let totalCategorias = 0;
    let productosActivos = 0;
    let categorias = [];

    tabla.html("")
    data.forEach(p => {
        if (p.ACTIVO == true) {
            activo = 'Si';
            productosActivos += 1;
        } else {
            activo = 'No';
        };



        if (!categorias.includes(p.CATEGORIA)) {
            categorias.push(p.CATEGORIA);
            console.log(categorias, p.CATEGORIA);
            totalCategorias += 1;
        };

        totalProductos += 1;

        tabla.append(`
            <tr>

                <td>${p.ID}</td>
                <td><img src="${p.imagen}" style="width: 100px;"></td>
                <td>${p.NOMBRE}</td>
                <td>$${p.PRECIO}</td>
                <td>${p.CATEGORIA}</td>
                <td>${activo}</td>
                <td class="text-center">

                    <button onclick="datosModalEditar(${p.ID});" class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#modalEditarProducto">
                        Editar
                    </button>
                    <button onclick="eliminar(${p.ID})" class="btn btn-danger btn-sm">
                        Eliminar
                    </button>

                </td>

            </tr>
            `)
    })


    $('#totalProductos').text(totalProductos);
    $('#totalCategorias').text(totalCategorias);
    $('#productosActivos').text(productosActivos);
}

async function guardarProducto() {
    const formData = new FormData();

    formData.append("nombre", $("#nombre").val());
    formData.append("descripcion", $("#descripcion").val());
    formData.append("precio", $("#precio").val());
    formData.append("categoria", $("#categoria").val());
    formData.append("activo", $("#activo").val());

    const archivo = $("#imagen")[0].files[0];
    formData.append("imagen", archivo);

    const response = await fetch("/api/productos", {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    console.log(data);

    cargarDatos();
}

async function eliminar(id) {
    try {
        const response = await fetch(`/api/productos/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Producto eliminado", data);
        } else {
            console.error("Error:", data);
        }
        cargarDatos()

    } catch (error) {
        console.error("Error en la petición:", error);
    }
}

async function datosModalEditar(id) {
    try {
        const response = await fetch(`/api/productos/${id}`)

        if (response.ok) {

            const data = await response.json();
            console.log(data.imagen)
            $('#previewImagenEditar').attr('src', data.imagen);
            $('#nombreEditar').val(data.NOMBRE);
            $('#descripcionEditar').val(data.DESCRIPCION);
            $('#precioEditar').val(data.PRECIO);
            $('#categoriaEditar').val(data.CATEGORIA);
            $('#activoEditar').prop("checked", data.ACTIVO);
            $('#btnGuardarEditar')
                .off('click')
                .on('click', function () {
                    editar(id);
                });
        } else {
            console.error("Error:", data);
        }
    } catch (error) {
        console.error("Error en la petición:", error);
    }
}

async function editar(id) {
    try {
        const formData = new FormData();
        formData.append("nombre", $("#nombreEditar").val());
        formData.append("descripcion", $("#descripcionEditar").val());
        formData.append("precio", $("#precioEditar").val());
        formData.append("categoria", $("#categoriaEditar").val());
        formData.append("activo", $("#activoEditar").prop("checked"));

        const archivo = $("#imagenEditar")[0].files[0];

        if (archivo) {
            formData.append("imagen", archivo);
        }

        const response = await fetch(`/api/productos/update/${id}`, {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            cargarDatos();
        }
    } catch (error) {
        console.error("Error en la petición:", error);
    }
}