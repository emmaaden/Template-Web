$(document).ready(function () {
    cargar_estilos();
})


async function cargar_estilos() {
    const dominio = window.location.hostname;
    const res = await fetch(`/pagina/?dominio=${dominio}`);
    const data = await res.json();

    console.log(data)

    if (res.ok) {
        $('#estilos').append(`
            body {
                background: ${data[0].BACKGROUND_BODY};
                color: ${data[0].COLOR_BODY};
                font-family: Arial;
            }

            .hero {
                height: 70vh;
                display: flex;
                align-items: center;
                justify-content: center;    
                background: url('../img/placeholder.jpg') center/cover;
            }

            .hero h1 {
                font-size: 3rem;
                font-weight: bold;
            }

            .icon {
                color: ${data[0].COLOR_ICON};
                margin-bottom: 15px;
            }

            .card {
                background: ${data[0].BACKGROUND_CARD};
                border: none;
                color: white;
            }

            .menu-card img {
                height: 200px;
                object-fit: cover;
            }

            .price {
                font-size: 20px;
                font-weight: bold;
                color: ${data[0].COLOR_CARD};
            }

            .categorias-scroll {
                display: flex;
                gap: 10px;
                overflow-x: auto;
                padding-bottom: 10px;
                scrollbar-width: none;
            }

            .categorias-scroll::-webkit-scrollbar {
                display: none;
            }

            .categoria-pill {
                padding: 10px 18px;
                background: ${data[0].BACKGROUND_CATEGORIA};
                border-radius: 999px;
                white-space: nowrap;
                cursor: pointer;
                transition: 0.3s;
                border: 1px solid ${data[0].BORDER_CATEGORIA};
            }

            .categoria-pill:hover {
                background: ${data[0].BACKGROUND_HOVER_CATEGORIA};
            }

            .categoria-activa {
                background: ${data[0].BACKGROUND_CATEGORIA_ACTIVA};
                color: ${data[0].COLOR_CATEGORIA_ACTIVA};
                font-weight: bold;
                border: none;
            }
            `)
    }
}