const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

const verificarAuth = async (req, res, next) => {

    try {
        /* const authHeader = req.session.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Token requerido"
            });
        } */

        const token = req.session.access_token;

        console.log('token')

        const { data, error } = await supabase.auth.getUser(token);

        if (error) {
            return res.status(401).json({
                success: false,
                message: "Token inválido"
            });
        }

        req.user = data.user;

        next();

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = verificarAuth;