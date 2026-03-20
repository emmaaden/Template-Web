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
        const res = await fetch("/api/productos?filtro=CATEGORIA&ascdesc=ture");
        const data = await res.json();
        const container = $("#menuContainer");
        container.html("");
        let categorias = [];
        data.forEach(item => {
            if (item.ACTIVO == true) {
                if (!categorias.includes(item.CATEGORIA)) {
                    categorias.push(item.CATEGORIA);
                    console.log(categorias, item.CATEGORIA);
                    container.append(`
                        <div class="col-12 mb-3">
                            <h3>${item.CATEGORIA}</h3>
                            <hr>
                        </div>
                        `)
                };
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
            }

        })
    } catch (error) {
        console.error(error);
    }
    Swal.close();
}