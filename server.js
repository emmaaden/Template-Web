const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const productosRoutes = require("./routes/productos_routes.js");
const authRoutes = require("./routes/auth_routes.js");

const verificarAuth = require("./middlewares/auth_middleware.js");

dotenv.config();

const app = express();
const PORT = 3000;

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

app.get("/admin", verificarAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "admin"))
})

// API
app.use("/api/productos", productosRoutes);
app.use("/api", authRoutes);

// ruta principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});