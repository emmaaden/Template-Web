let productosGlobal = []
$(document).ready(function () {
    cargarMenu()

})

async function cargarMenu() {
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
        const res = await fetch("/api/productos?filtro=CATEGORIA&ascdesc=ture");
        const data = await res.json();

        productosGlobal = data
        renderCategorias(data)

        const container = $("#menuContainer");
        container.html("");
        let categorias = [];
        data.forEach(item => {
            if (item.ACTIVO == true) {
                if (!categorias.includes(item.CATEGORIAS.NOMBRE)) {
                    categorias.push(item.CATEGORIAS.NOMBRE);
                    console.log(categorias, item.CATEGORIAS.NOMBRE);
                    container.append(`
                        <div class="col-12 mb-3">
                            <h3>${item.CATEGORIAS.NOMBRE}</h3>
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

function renderProductos(data) {

    const container = $("#menuContainer")

    container.html("")

    data.forEach(item => {

        container.append(`

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

            `)

    })

}

function filtrarCategoria(categoria, el) {

    $(".categoria-pill").removeClass("categoria-activa")

    $(el).addClass("categoria-activa")

    if (categoria === "todos") {
        cargarMenu()
        return
    }

    const filtrados = productosGlobal.filter(p => p.CATEGORIAS.NOMBRE === categoria)

    renderProductos(filtrados)

}

function renderCategorias(data) {

    const categorias = [...new Set(data.map(p => p.CATEGORIAS.NOMBRE))]

    const container = $("#categoriasContainer")

    container.html("")

    // botón "todos"
    container.append(`
        <div class="categoria-pill categoria-activa" onclick="filtrarCategoria('todos', this)">
            Todos
        </div>
        `)

    categorias.forEach(cat => {

        container.append(`
            <div class="categoria-pill" onclick="filtrarCategoria('${cat}', this)">
                ${getEmoji(cat)} ${cat}
            </div>
        `)
    })

}

function getEmoji(cat) {
    cat = cat.toLowerCase()

    if (cat.includes("hamburguesa")) return "🍔"
    if (cat.includes("pizza")) return "🍕"
    if (cat.includes("bebida")) return "🥤"
    if (cat.includes("lomo")) return "🥪"

    return "🍽"
}