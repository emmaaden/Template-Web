const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const fs = require('fs')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Obtener productos
const getProductos = async (req, res) => {

    try {

        const { data, error } = await supabase
            .from("PRODUCTOS")
            .select("*");

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

        res.json(data);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

};

// Crear producto
const crearProducto = async (req, res) => {
    try {
        const { nombre, precio, descripcion, categoria, activo } = req.body;
        const imagen = req.file;

        if (!imagen) {
            return res.status(400).json({
                error: "Debe subir una imagen"
            });
        }

        // 1️⃣ crear producto
        const { data, error } = await supabase
            .from("PRODUCTOS")
            .insert([{
                NOMBRE: nombre,
                PRECIO: precio,
                DESCRIPCION: descripcion,
                CATEGORIA: categoria,
                ACTIVO: activo
            }])
            .select();

        if (error) throw error;

        const producto = data[0];

        // 2️⃣ subir imagen
        const file = fs.readFileSync(imagen.path);
        const nombreImagen = `producto_${producto.ID}.png`;
        
        const { error: error_img } = await supabase.storage
            .from("productos")
            .upload(nombreImagen, file, {
                contentType: imagen.mimetype
            });

        if (error_img) throw error_img;

        // 3️⃣ guardar referencia
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
    crearProducto,
    eliminarProducto
};