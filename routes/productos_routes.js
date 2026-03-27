const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

const verificarAuth = require("../middlewares/auth_middleware.js");

const {
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
    eliminarProducto,
    getProductosPublic,
} = require("../controllers/productos_controller");

router.get("/publico", getProductosPublic);

router.get("/categorias", getCategorias);

router.get("/:id", getProductoById);


// Privadas
router.get("/", getProductos);

router.post("/update/:id", verificarAuth, upload.single("imagen"), updateProducto);

router.post("/aumento", verificarAuth, aumentoMassivo);

router.post("/aumento/categoria", verificarAuth, aumentoCategoria);

router.post("/aumento/id", verificarAuth, aumentoProducto);

router.post("/descuento", verificarAuth, descuentoMassivo);

router.post("/descuento/categoria", verificarAuth, descuentoCategoria);

router.post("/descuento/id", verificarAuth, descuentoProducto);

router.post("/", verificarAuth, upload.single("imagen"), crearProducto);

router.delete("/:id", verificarAuth, eliminarProducto);

module.exports = router;