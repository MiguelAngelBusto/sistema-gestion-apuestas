const supabase = require('../config/supabaseClient');
const bcrypt = require('bcrypt'); // Importamos la librería
const jwt = require('jsonwebtoken');
const registrarUsuario = async (req, res) => {
    const { email, nombre, apellido, pass } = req.body;

    try {
        // Encriptar la contraseña (salteo de 10 vueltas)
        const saltRounds = 10;
        const hashedPass = await bcrypt.hash(pass, saltRounds);

        const { data, error } = await supabase
            .from('usuarios')
            .insert([{ 
                email, 
                nombre, 
                apellido, 
                pass: hashedPass // Guardamos la versión encriptada
            }])
            .select();

        if (error) throw error;
        console.log("ID de Auth obtenido:", data.user.id);
        res.status(201).json({ 
            mensaje: "Usuario creado de forma segura!", 
            usuario: { id: data[0].id_usuario, email: data[0].email } 
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
const login = async (req, res) => {
    const { email, password } = req.body;
    
    // LOG 1: Ver si la petición llega al servidor
    console.log("== Intentando Login para:", email);

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.log("Error de Supabase Auth:", error.message);
            throw error;
        }

        // LOG 2: Ver el UUID que nos da Supabase
        console.log("UUID obtenido de Auth:", data.user.id);

        const { data: usuarioInterno, error: errorPerfil } = await supabase
            .from('usuarios')
            .select('id_usuario')
            .eq('auth_id', data.user.id)
            .single();

        if (errorPerfil) {
            console.log("Error buscando en tabla usuarios:", errorPerfil.message);
            throw errorPerfil;
        }

        res.status(200).json({ 
            mensaje: "Login exitoso", 
            id_usuario_interno: usuarioInterno.id_usuario 
        });

    } catch (error) {
        console.log("Fallo total en login:", error.message);
        res.status(401).json({ error: error.message });
    }
};
module.exports = { registrarUsuario, login  };    
