const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const fs = require('fs')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);


// Obtener productos
const getEstilos = async (req, res) => {
    try {
        const { dominio } = req.query;

        const { data, error } = await supabase
            .from("CLIENTES")
            .select('*')
            .eq("DOMINIO", dominio)

        if (error) throw error;

        res.json(data);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

};

module.exports = {
    getEstilos
};