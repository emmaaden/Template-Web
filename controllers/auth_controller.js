const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);


const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email y password requeridos"
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({
                success: false,
                message: "Usuario o contraseña incorrectos"
            });
        }

        const idAuth = data.user.id

        console.log(idAuth)

        const { data: dataClient, error: errorClient } = await supabase
            .from("CLIENTES")
            .select(`*`)
            .eq("ID_AUTH", idAuth);

        if (errorClient) {
            return res.status(401).json({
                success: false,
                message: "Cliente no registrado"
            });
        }

        console.log(dataClient)

        req.session.isAuthenticated = true;

        req.session.user = {
            id: data.user.id,
            email: data.user.email,
            data: dataClient
        };

        req.session.access_token = data.session.access_token;

        console.log(req.session.user)

        req.session.save(() => {
            res.json({
                success: true,
                user: req.session.user
            });
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    login
}; 