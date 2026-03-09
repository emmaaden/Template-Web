$(document).ready(function () {
    const token = localStorage.getItem("token")

    if (!token) {
        window.location = "/login.html"
    }

    console.log(token)
    cargarProductos()

    $("#formProducto").submit(function (e) {

        e.preventDefault()

        guardarProducto()

    })

})

async function cargarProductos() {

    const res = await fetch("/api/productos")
    const data = await res.json()
    const tabla = $("#tablaProductos")
    tabla.html("")
    data.forEach(p => {
        tabla.append(`
            <tr>

                <td>${p.ID}</td>
                <td>${p.NOMBRE}</td>
                <td>${p.PRECIO}</td>
                <td>${p.CATEGORIA}</td>

                <td>

                    <button onclick="eliminar(${p.ID})" class="btn btn-danger btn-sm">
                        Eliminar
                    </button>

                </td>

            </tr>
            `)
    })

}

async function guardarProducto() {
    const formData = new FormData();

    formData.append("nombre", $("#nombre").val());
    formData.append("descripcion", $("#descripcion").val());
    formData.append("precio", $("#precio").val());
    formData.append("categoria", $("#categoria").val());

    const archivo = $("#imagen")[0].files[0];
    formData.append("imagen", archivo);

    const response = await fetch("/api/productos", {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    console.log(data);

    cargarProductos();
}

async function eliminar(id) {
    try {
        const response = await fetch(`api/productos/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Producto eliminado", data);
        } else {
            console.error("Error:", data);
        }
        cargarProductos()

    } catch (error) {
        console.error("Error en la petición:", error);
    }
}