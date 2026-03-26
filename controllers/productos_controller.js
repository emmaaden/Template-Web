const { createClient } = require("@supabase/supabase-js");
const { error } = require("console");
require("dotenv").config();

const fs = require('fs')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Obtener productos
const getProductos = async (req, res) => {
    try {
        const { filtro, ascdesc } = req.query;
        const id_cliente = req.session.user.data[0].ID
        
        const { data, error } = await supabase
            .from("PRODUCTOS")
            .select(`
                *,
                CATEGORIAS (
                    NOMBRE
                )
            `)
            .eq("ID_CLIENTE", id_cliente)
            .order(filtro, { ascending: ascdesc });

        const productos = data.map(p => {

            let imagen = null;

            if (p.IMAGEN_URL) {

                const { data: img } = supabase
                    .storage
                    .from("productos")
                    .getPublicUrl(p.IMAGEN_URL);

                imagen = img.publicUrl;

            }

            return {
                ...p,
                imagen
            };

        });

        if (error) throw error;

        res.json(productos);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

};

// Obtener Categorias
const getCategorias = async (req, res) => {
    try {
        const { data, error } = await supabase.rpc("traer_categorias")

        if (error) {
            console.log("❌ error supabase:", error);
            return res.status(400).json({ error: error.message });
        }

        return res.json(data);

    } catch (error) {
        console.log("❌ error:", error);
        res.status(500).json({ error: error.message });
    }
}

// Obtener producto por id
const getProductoById = async (req, res) => {
    try {

        const { id } = req.params;

        const { data, error } = await supabase
            .from("PRODUCTOS")
            .select("*")
            .eq("ID", id)
            .single();

        if (error) throw error;

        let imagen = null;

        if (data.IMAGEN_URL) {

            const { data: img } = supabase
                .storage
                .from("productos")
                .getPublicUrl(data.IMAGEN_URL);

            imagen = img.publicUrl;

        }

        const producto = { ...data, imagen }

        res.json(producto);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

};

// Actualizar producto
const updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, descripcion, categoria, activo } = req.body;
        const imagen = req.file;

        let nombreImagen = null;

        // si viene imagen, la subimos
        if (imagen) {
            const file = imagen.buffer;
            nombreImagen = `producto_${id}.png`;

            const { error: error_img } = await supabase.storage
                .from("productos")
                .upload(nombreImagen, file, {
                    contentType: imagen.mimetype,
                    upsert: true
                });

            if (error_img) throw error_img;
        }

        // armamos update dinámico
        const updateData = {
            NOMBRE: nombre,
            PRECIO: precio,
            DESCRIPCION: descripcion,
            CATEGORIA: categoria,
            ACTIVO: activo
        };

        if (nombreImagen) {
            updateData.IMAGEN_URL = nombreImagen;
        }

        const { data, error } = await supabase
            .from("PRODUCTOS")
            .update(updateData)
            .eq("ID", id)
            .select();

        if (error) throw error;

        res.json({
            message: "Producto actualizado correctamente",
            producto: data[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: error.message
        });
    }
};

// Aumento ID
const aumentoProducto = async (req, res) => {
    try {
        const { id, porcentaje } = req.body;

        if (!id && !porcentaje) {
            return res.status(400).json({ error: 'faltan datos' });
        }

        // 1. Traer precio actual
        const { data: producto, error: errorGet } = await supabase
            .from("PRODUCTOS")
            .select("PRECIO")
            .eq("ID", id)
            .single();

        if (errorGet) {
            return res.status(400).json({ error: errorGet.message });
        }

        const precioActual = parseFloat(producto.PRECIO);
        const porc = parseFloat(porcentaje);

        // 2. Calcular nuevo precio
        const nuevoPrecio = precioActual + (precioActual * porc / 100);

        // 3. Actualizar
        const { data, error } = await supabase
            .from("PRODUCTOS")
            .update({ PRECIO: nuevoPrecio })
            .eq("ID", id)
            .select();

        if (error) {
            return res.status(400).json({ error: 'faltan datos' });
        }

        return res.json({
            message: "Aumentado exitoso",
            producto: data[0]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
};

// Aumento Categoria
const aumentoCategoria = async (req, res) => {
    try {
        const { categoria, porcentaje } = req.body;

        if (!categoria || !porcentaje) {
            return res.error(400).json({ error: error.message });
        }

        const { error } = await supabase.rpc("aumentar_categoria", {
            porcentaje_input: porcentaje,
            categoria_input: categoria
        });

        if (error) {
            console.log("❌ error supabase:", error);
            return res.status(400).json({ error: error.message });
        }

        return res.json({
            message: "Aumento exitoso"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
};

// Aumento Massivo
const aumentoMassivo = async (req, res) => {
    try {
        const { porcentaje } = req.body;

        if (!porcentaje) {
            return res.status(400).json({ error: 'faltan datos' });
        }

        if (porcentaje === undefined) {
            console.log("❌ porcentaje undefined");
            return res.status(400).json({ error: 'faltan datos' });
        }

        const { error } = await supabase.rpc("aumentar_todos", {
            porcentaje_input: porcentaje
        });


        if (error) {
            console.log("❌ error supabase:", error);
            return res.status(400).json({ error: error.message });
        }

        return res.json({
            message: "Aumento exitoso"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
};

// Descuento ID
const descuentoProducto = async (req, res) => {
    try {
        const { id, porcentaje } = req.body;

        if (!id && !porcentaje) {
            return res.status(400).json({ error: 'faltan datos' });
        }

        // 1. Traer precio actual
        const { data: producto, error: errorGet } = await supabase
            .from("PRODUCTOS")
            .select("PRECIO")
            .eq("ID", id)
            .single();

        if (errorGet) {
            return res.status(400).json({ error: errorGet.message });
        }

        const precioActual = parseFloat(producto.PRECIO);
        const porc = parseFloat(porcentaje);

        // 2. Calcular nuevo precio
        const nuevoPrecio = precioActual - (precioActual * porc / 100);

        // 3. Actualizar
        const { data, error } = await supabase
            .from("PRODUCTOS")
            .update({ PRECIO: nuevoPrecio })
            .eq("ID", id)
            .select();

        if (error) {
            return res.status(400).json({ error: 'faltan datos' });
        }

        return res.json({
            message: "Descuento exitoso",
            producto: data[0]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
};

// Descuento Categoria
const descuentoCategoria = async (req, res) => {
    try {
        const { categoria, porcentaje } = req.body;

        if (!categoria || !porcentaje) {
            return res.error(400).json({ error: error.message });
        }

        const { error } = await supabase.rpc("descuento_categoria", {
            porcentaje_input: porcentaje,
            categoria_input: categoria
        });

        if (error) {
            console.log("❌ error supabase:", error);
            return res.status(400).json({ error: error.message });
        }

        return res.json({
            message: "Descuento exitoso"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
};

// Descuento Massivo
const descuentoMassivo = async (req, res) => {
    try {
        const { porcentaje } = req.body;

        if (!porcentaje) {
            return res.status(400).json({ error: 'faltan datos' });
        }

        if (porcentaje === undefined) {
            console.log("❌ porcentaje undefined");
            return res.status(400).json({ error: 'faltan datos' });
        }

        const { error } = await supabase.rpc("descuento_todos", {
            porcentaje_input: porcentaje
        });


        if (error) {
            console.log("❌ error supabase:", error);
            return res.status(400).json({ error: error.message });
        }

        return res.json({
            message: "Descuento exitoso"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
};

// Crear producto
const crearProducto = async (req, res) => {
    try {
        let { nombre, precio, descripcion, categoria, categoriaNew, activo } = req.body;
        const imagen = req.file;

        if (!imagen) {
            return res.status(400).json({
                error: "Debe subir una imagen"
            });
        }

        if (categoria == 'otro') {

            if (categoriaNew != undefined && categoriaNew != '') {

                const { data, error } = await supabase.rpc("crear_categoria", {
                    categoria_input: categoriaNew
                });

                if (error) {
                    return res.status(400).json({
                        error: "Error al crear la categoria"
                    });
                }

                if (!data || data.length === 0) {
                    return res.status(400).json({
                        error: "No se pudo crear la categoria"
                    });
                }

                categoria = data[0].id;
            } else {

                return res.status(400).json({
                    error: "Debe seleccionar una categoria"
                });
            }
        }

        // crear producto
        const { data, error } = await supabase.rpc("crear_producto", {
            nombre_input: nombre,
            descripcion_input: descripcion,
            precio_input: precio,
            categoria_input: categoria,
            activo_input: activo,
            orden_input: 1,
            imagen_url_input: ''
        });

        if (error) throw error;

        if (!data || data.length === 0) {
            throw new Error("No se pudo crear el producto");
        }

        const producto = data[0];

        // subir imagen
        const file = fs.readFileSync(imagen.path);
        const nombreImagen = `producto_${producto.ID}.png`;

        const { error: error_img } = await supabase.storage
            .from("productos")
            .upload(nombreImagen, file, {
                contentType: imagen.mimetype
            });

        if (error_img) throw error_img;

        // guardar referencia
        const { error: error_update } = await supabase
            .from("PRODUCTOS")
            .update({ IMAGEN_URL: nombreImagen })
            .eq("ID", producto.ID);

        if (error_update) throw error_update;

        res.json({
            message: "Producto creado correctamente",
            producto
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    }
};

// Eliminar producto
const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from("PRODUCTOS")
            .delete()
            .eq("ID", id);

        if (error) throw error;

        res.json({ message: "Producto eliminado" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }

};


module.exports = {
    getProductos,
    getProductoById,
    getCategorias,
    updateProducto,
    aumentoProducto,
    aumentoCategoria,
    aumentoMassivo,
    descuentoMassivo,
    descuentoCategoria,
    descuentoProducto,
    crearProducto,
    eliminarProducto
};