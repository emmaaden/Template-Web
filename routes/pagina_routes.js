const express = require("express");
const router = express.Router();

const verificarAuth = require("../middlewares/auth_middleware.js");

const {
    getEstilos
} = require("../controllers/pagina_controller.js");

router.get("/", getEstilos);

module.exports = router;