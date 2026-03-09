$(document).ready(function () {
    cargarMenu()
})

async function cargarMenu() {
    Swal.fire({
        title: 'Cargando productos...',
        text: 'Espere un momento',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    try {
        const res = await fetch("/api/productos")
        const data = await res.json()
        const container = $("#menuContainer")
        container.html("")
        data.forEach(item => {

            const card = `
                <div class="col-md-4 mb-4">
                    <div class="card menu-card">
                        <img src="${item.imagen}" class="card-img-top">
                        <div class="card-body">
                            <h5>${item.NOMBRE}</h5>
                            <p>${item.DESCRIPCION}</p>
                            <div class="price">$${item.PRECIO}</div>
                        </div>
                    </div>
                </div>
                `
            container.append(card)
        })
    } catch (error) {
        console.error(error);
    }
    Swal.close();
}