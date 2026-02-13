const supabase = require('../config/supabaseClient');
const bcrypt = require('bcrypt');

const registrarUsuario = async (req, res) => {
    const { email, nombre, apellido, pass } = req.body;

    try {
        // 1. Crear el usuario en Supabase Auth (Sistema de Autenticación)
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: pass, // Supabase Auth encripta esto automáticamente
        });

        if (authError) throw authError;

        const auth_id = authData.user.id; // Este es el UUID que vincula todo

        // 2. Encriptar para tu tabla local (opcional, pero buena práctica si guardas 'pass')
        const saltRounds = 10;
        const hashedPass = await bcrypt.hash(pass, saltRounds);

        // 3. Insertar en tu tabla public.usuarios usando el auth_id obtenido
        const { data, error: dbError } = await supabase
            .from('usuarios')
            .insert([{ 
                email, 
                nombre, 
                apellido, 
                pass: hashedPass,
                auth_id: auth_id // <--- VINCULACIÓN CRÍTICA
            }])
            .select();

        if (dbError) throw dbError;

        res.status(201).json({ 
            mensaje: "¡Usuario creado en Auth y Database!", 
            usuario: data[0] 
        });

    } catch (error) {
        console.error("Error en registro:", error.message);
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    console.log("== Intentando Login para:", email);

    try {
        // 1. Iniciar sesión en Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // 2. Buscar el id_usuario interno usando el UUID (auth_id)
        const { data: usuarioInterno, error: errorPerfil } = await supabase
            .from('usuarios')
            .select('id_usuario')
            .eq('auth_id', data.user.id)
            .single();

        if (errorPerfil) {
            console.error("Perfil no encontrado en public.usuarios para el UUID:", data.user.id);
            throw new Error("El usuario existe en Auth pero no tiene perfil en la tabla de datos.");
        }

        // 3. DEVOLVER LA SESIÓN: Esto permite al frontend persistir el login
        res.status(200).json({ 
            mensaje: "Login exitoso", 
            id_usuario_interno: usuarioInterno.id_usuario,
            session: data.session // <--- Contiene el Access Token para el navegador
        });

    } catch (error) {
        console.log("Fallo total en login:", error.message);
        res.status(401).json({ error: error.message });
    }
};

module.exports = { registrarUsuario, login };