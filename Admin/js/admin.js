async function cargarDatos(filtro, ascdesc) {
    Swal.fire({
        title: 'Cargando productos...',
        text: 'Espere un momento',
        background: '#1e1e2f',
        color: '#fff',
        confirmButtonColor: '#4CAF50',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    try {
        const res = await fetch(`/api/productos?filtro=${filtro}&ascdesc=${ascdesc}`);
        const data = await res.json()
        const tabla = $("#tablaProductos")
        let activo = 'No';
        let totalProductos = 0;
        let totalCategorias = 0;
        let productosActivos = 0;
        let categorias = [];

        if (res.ok) {

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
                    <td>${p.CATEGORIAS.NOMBRE}</td>
                    <td>${activo}</td>
                    <td class="text-center">

                        <button onclick="datosModalEditar(${p.ID});" class="m-2 btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#modalEditarProducto">
                            Editar
                        </button>
                        <button onclick="eliminar(${p.ID})" class="m-2 btn btn-danger btn-sm">
                            Eliminar
                        </button>

                    </td>
            </tr>
            `)
            })

            $('#totalProductos').text(totalProductos);
            $('#totalCategorias').text(totalCategorias);
            $('#productosActivos').text(productosActivos);

            switch (filtro) {
                case 'ID':
                    $('#filtroId').addClass('activo');
                    $('#filtroNombre').removeClass('activo');
                    $('#filtroCategoria').removeClass('activo');
                    $('#filtroActivo').removeClass('activo');
                    break;
                case 'NOMBRE':
                    $('#filtroId').removeClass('activo');
                    $('#filtroNombre').addClass('activo');
                    $('#filtroCategoria').removeClass('activo');
                    $('#filtroActivo').removeClass('activo');
                    break;
                case 'CATEGORIA':
                    $('#filtroId').removeClass('activo');
                    $('#filtroNombre').removeClass('activo');
                    $('#filtroCategoria').addClass('activo');
                    $('#filtroActivo').removeClass('activo');
                    break;
                case 'ACTIVO':
                    $('#filtroId').removeClass('activo');
                    $('#filtroNombre').removeClass('activo');
                    $('#filtroCategoria').removeClass('activo');
                    $('#filtroActivo').addClass('activo');
                    break;
                default:
                    $('#filtroId').removeClass('activo');
                    $('#filtroNombre').removeClass('activo');
                    $('#filtroCategoria').removeClass('activo');
                    $('#filtroActivo').removeClass('activo');
                    break;
            }
        }

    } catch (error) {
        swal.fire({
            icon: 'error',
            title: 'Usuario inexistente',
            text: error
        });
    }
    Swal.close();
}

async function cargarCategorias(id, opcion) {
    try {
        const response = await fetch(`/api/productos/categorias`);
        const data = await response.json();
        $(`#${id}`).empty()
        data.forEach(element => {
            $(`#${id}`).append(`
                <option value="${element.id}">${element.nombre}</option>
            `);
        });
        if (opcion) {
            $(`#${id}`).append(`
                <option value="otro">Crear una categoria nueva</option>
            `);
        }

    } catch (error) {
        console.error("Error en la petición:", error);
    }
}

async function guardarProducto() {
    const formData = new FormData();

    formData.append("nombre", $("#nombre").val());
    formData.append("descripcion", $("#descripcion").val());
    formData.append("precio", $("#precio").val());
    formData.append("categoriaNew", $("#categoriaNew").val());
    formData.append("categoria", $("#categoria").val());
    formData.append("activo", $("#activo").val());

    const archivo = $("#imagen")[0].files[0];
    formData.append("imagen", archivo);

    const response = await fetch("/api/productos", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        $('#modalProducto').modal("hide");
        cargarDatos('ID', true);
    }
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
        cargarDatos('ID', true);

    } catch (error) {
        console.error("Error en la petición:", error);
    }
}

async function datosModalEditar(id) {
    try {
        const response = await fetch(`/api/productos/${id}`)

        await cargarCategorias('categoriaEditar');

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
            $('#modalEditarProducto').modal("hide");
            cargarDatos('ID', true);
        }
    } catch (error) {
        console.error("Error en la petición:", error);
    }
}

function confirmarAumento() {
    try {
        const tipoAumento = $('#tipoAumento');
        const id = $('#idProductoAumento');
        const categoria = $('#categoriaProductoAumento');
        const porcentaje = $('#aumentoProducto');

        if (tipoAumento.val() == '0') {
            tipoAumento.addClass('is-invalid').removeClass('is-valid')
            return
        }

        switch (tipoAumento.val()) {
            // Aumento por id
            case '1':
                id.addClass('is-valid').removeClass('is-invalid')
                porcentaje.addClass('is-valid').removeClass('is-invalid')

                if (
                    (id.val().trim() != '' && !isNaN(id.val().trim()))
                    &&
                    (porcentaje.val().trim() != '' && !isNaN(porcentaje.val().trim()))
                ) {

                    $('#modalAumentarProducto').modal("show");
                    $('#modalAumentarProductoBody').empty();
                    $('#modalAumentarProductoBody').append(`
                        Es por aumentar el producto ${id.val()}
                        Si esta seguro haga click en continuar.

                        <button class="btn btn-warning w-100" onclick="aumentarId('${id.val()}', '${porcentaje.val()}', 'aumento')">
                            <i class="fa-solid fa-floppy-disk"></i>
                            Continuar
                        </button>
                        `)

                    console.log('todo ok')
                } else {
                    if (id.val().trim() == '' || isNaN(id.val().trim())) {
                        id.addClass('is-invalid')
                    }

                    if (porcentaje.val().trim() == '' || isNaN(porcentaje.val().trim())) {
                        porcentaje.addClass('is-invalid')
                    }
                }
                break;

            case '2':
                categoria.addClass('is-valid').removeClass('is-invalid')
                porcentaje.addClass('is-valid').removeClass('is-invalid')

                if (
                    (categoria.val().trim() != '')
                    ||
                    (porcentaje.val().trim() != '' && !isNaN(porcentaje.val().trim()))) {

                    $('#modalAumentarProducto').modal("show");
                    $('#modalAumentarProductoBody').empty();
                    $('#modalAumentarProductoBody').append(`
                        Esta por aumentar todos los productos de la categoria ${categoria.val()} un ${porcentaje.val()}%
                        Si esta seguro haga click en continuar.
                        <hr class="m-2">
                        <button class="btn btn-warning w-100" onclick="aumentoCategoria('${categoria.val()}' ,'${porcentaje.val()}', 'aumento')">
                            <i class="fa-solid fa-floppy-disk"></i>
                            Continuar
                        </button>
                        `)

                    console.log('todo ok')
                } else {
                    if (categoria.val().trim() == '') {
                        categoria.addClass('is-invalid')
                    }

                    if (porcentaje.val().trim() == '' || isNaN(porcentaje.val().trim())) {
                        porcentaje.addClass('is-invalid')
                    }
                }
                break;

            case '3':
                porcentaje.addClass('is-valid').removeClass('is-invalid')

                if (porcentaje.val().trim() != '' && !isNaN(porcentaje.val().trim())) {

                    $('#modalAumentarProducto').modal("show");
                    $('#modalAumentarProductoBody').empty();
                    $('#modalAumentarProductoBody').append(`
                        Esta por aumentar todos los productos un ${porcentaje.val()}%
                        Si esta seguro haga click en continuar.
                        <hr class="m-2">
                        <button class="btn btn-warning w-100" onclick="aumentoMassivo('${porcentaje.val()}', 'aumento')">
                            <i class="fa-solid fa-floppy-disk"></i>
                            Continuar
                        </button>
                        `)

                    console.log('todo ok')
                } else {
                    if (porcentaje.val().trim() == '' || isNaN(porcentaje.val().trim())) {
                        porcentaje.addClass('is-invalid')
                    }
                }
                break;

            default:
                console.log('xd')
                break;
        }

    } catch (error) {
        swal.fire({
            icon: 'error',
            title: 'Error',
            text: error
        });
    }
}

function confirmarDescuento() {
    try {
        const tipoDescuento = $('#tipoDescuento');
        const id = $('#idProductoDescuento');
        const categoria = $('#categoriaProductoDescuento');
        const porcentaje = $('#descuentoProducto');

        if (tipoDescuento.val() == '0') {
            tipoDescuento.addClass('is-invalid').removeClass('is-valid')
            return
        }

        switch (tipoDescuento.val()) {
            case '1':
                id.addClass('is-valid').removeClass('is-invalid')
                porcentaje.addClass('is-valid').removeClass('is-invalid')

                if (
                    (id.val().trim() != '' && !isNaN(id.val().trim()))
                    &&
                    (porcentaje.val().trim() != '' && !isNaN(porcentaje.val().trim()))
                ) {

                    $('#modalAumentarProducto').modal("show");
                    $('#modalAumentarProductoBody').empty();
                    $('#modalAumentarProductoBody').append(`
                        Esta por hacer un descuento en el producto ${id.val()}
                        Si esta seguro haga click en continuar.

                        <button class="btn btn-warning w-100" onclick="aumentarId('${id.val()}', '${porcentaje.val()}', 'descuento')">
                            <i class="fa-solid fa-floppy-disk"></i>
                            Continuar
                        </button>
                        `)

                    console.log('todo ok')
                } else {
                    if (id.val().trim() == '' || isNaN(id.val().trim())) {
                        id.addClass('is-invalid')
                    }

                    if (porcentaje.val().trim() == '' || isNaN(porcentaje.val().trim())) {
                        porcentaje.addClass('is-invalid')
                    }
                }
                break;

            case '2':
                categoria.addClass('is-valid').removeClass('is-invalid')
                porcentaje.addClass('is-valid').removeClass('is-invalid')

                if (
                    (categoria.val().trim() != '')
                    ||
                    (porcentaje.val().trim() != '' && !isNaN(porcentaje.val().trim()))) {

                    $('#modalAumentarProducto').modal("show");
                    $('#modalAumentarProductoBody').empty();
                    $('#modalAumentarProductoBody').append(`
                        Esta por hacer un descuento a todos los productos de la categoria ${categoria.val()} un ${porcentaje.val()}%
                        Si esta seguro haga click en continuar.
                        <hr class="m-2">
                        <button class="btn btn-warning w-100" onclick="aumentoCategoria('${categoria.val()}' ,'${porcentaje.val()}', 'descuento')">
                            <i class="fa-solid fa-floppy-disk"></i>
                            Continuar
                        </button>
                        `)

                    console.log('todo ok')
                } else {
                    if (categoria.val().trim() == '') {
                        categoria.addClass('is-invalid')
                    }

                    if (porcentaje.val().trim() == '' || isNaN(porcentaje.val().trim())) {
                        porcentaje.addClass('is-invalid')
                    }
                }
                break;

            case '3':
                porcentaje.addClass('is-valid').removeClass('is-invalid')

                if (porcentaje.val().trim() != '' && !isNaN(porcentaje.val().trim())) {

                    $('#modalAumentarProducto').modal("show");
                    $('#modalAumentarProductoBody').empty();
                    $('#modalAumentarProductoBody').append(`
                        Esta por hacer un descuento a todos los productos un ${porcentaje.val()}%
                        Si esta seguro haga click en continuar.
                        <hr class="m-2">
                        <button class="btn btn-warning w-100" onclick="aumentoMassivo('${porcentaje.val()}', 'descuento')">
                            <i class="fa-solid fa-floppy-disk"></i>
                            Continuar
                        </button>
                        `)

                    console.log('todo ok')
                } else {
                    if (porcentaje.val().trim() == '' || isNaN(porcentaje.val().trim())) {
                        porcentaje.addClass('is-invalid')
                    }
                }
                break;

            default:
                break;
        }

    } catch (error) {
        swal.fire({
            icon: 'error',
            title: 'Error',
            text: error
        });
    }
}

async function aumentarId(id, porcentaje, accion) {
    try {
        if (id != '' && !isNaN(id) && porcentaje != '' && !isNaN(porcentaje)) {
            const response = await fetch(`/api/productos/${accion}/id`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id,
                    porcentaje
                })
            });

            if (response.ok) {
                $('#modalAumentarProducto').modal("hide");
                await cargarDatos('ID', true)
                swal.fire({
                    icon: 'success',
                    title: 'Aumento Exitoso',
                    background: '#1e1e2f',
                    color: '#fff',
                    confirmButtonColor: '#4CAF50',
                    allowOutsideClick: false,
                });
            }
        }
    } catch (error) {
        swal.fire({
            icon: 'error',
            title: 'Error',
            text: error
        });
    }

}

async function aumentoCategoria(categoria, porcentaje, accion) {
    try {
        if (porcentaje != '' && !isNaN(porcentaje)) {
            const response = await fetch(`/api/productos/${accion}/categoria`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    categoria,
                    porcentaje
                })
            });

            if (response.ok) {
                $('#modalAumentarProducto').modal("hide");
                await cargarDatos('ID', true);

                swal.fire({
                    icon: 'success',
                    title: 'Aumento Exitoso',
                    background: '#1e1e2f',
                    color: '#fff',
                    confirmButtonColor: '#4CAF50',
                    allowOutsideClick: false,
                });
            }
        }
    } catch (error) {
        swal.fire({
            icon: 'error',
            title: 'Error',
            text: error
        });
    }

}

async function aumentoMassivo(porcentaje, accion) {
    try {
        if (porcentaje != '' && !isNaN(porcentaje)) {
            const response = await fetch(`/api/productos/${accion}/`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    porcentaje
                })
            });

            if (response.ok) {
                $('#modalAumentarProducto').modal("hide");
                await cargarDatos('ID', true)
                swal.fire({
                    icon: 'success',
                    title: 'Aumento Exitoso',
                    background: '#1e1e2f',
                    color: '#fff',
                    confirmButtonColor: '#4CAF50',
                    allowOutsideClick: false,
                });
            }
        }
    } catch (error) {
        swal.fire({
            icon: 'error',
            title: 'Error',
            text: error
        });
    }

}