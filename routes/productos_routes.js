const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

const verificarAuth = require("../middlewares/auth_middleware.js");

const {
    getProductos,
    getProductoById,
    crearProducto,
    eliminarProducto
} = require("../controllers/productos_controller");

router.get("/", getProductos);

router.get("/:id", getProductoById);

router.post("/", verificarAuth, upload.single("imagen"), crearProducto);

router.delete("/:id", verificarAuth, eliminarProducto);

module.exports = router;