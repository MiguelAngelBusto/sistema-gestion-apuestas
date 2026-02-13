    const supabase = require('../config/supabaseClient');

    const getOrCreateId = async (tabla, columnaNombre, valor, idColumna, datosExtra = {}) => {
        if (!isNaN(valor) && valor !== "" && valor !== null) return valor;

        // 1. Construimos la consulta base
        let query = supabase
            .from(tabla)
            .select(idColumna)
            .eq(columnaNombre, valor.trim());

        // 2. DINÁMICO: Si enviamos datosExtra (como id_deporte), los incluimos en la búsqueda
        // para evitar colisiones entre equipos de distintos deportes.
        Object.keys(datosExtra).forEach(key => {
            query = query.eq(key, datosExtra[key]);
        });

        const { data: existente, error: errorBusqueda } = await query.maybeSingle();

        if (existente) return existente[idColumna];

        // 3. Si no existe con esos filtros, lo creamos
        const { data: nuevo, error } = await supabase
            .from(tabla)
            .insert([{ [columnaNombre]: valor, ...datosExtra }])
            .select();

        if (error) throw new Error(`Error en ${tabla}: ${error.message}`);
        return nuevo[0][idColumna];
    };

    const crearApuesta = async (req, res) => {
    try {
        const { 
            deporte, campeonato, equipo_local, equipo_visitante, 
            tipo_apuesta, opcion_elegida, fecha, cuota, monto,
            auth_id // <--- Ahora recibimos el UUID de Supabase desde el front
        } = req.body;

        // 1. OBTENER EL ID_USUARIO REAL DESDE LA BASE DE DATOS
        // Buscamos en public.usuarios la fila que tenga el auth_id de la sesión
        const { data: usuarioPerfil, error: errorUser } = await supabase
            .from('usuarios')
            .select('id_usuario')
            .eq('auth_id', auth_id)
            .single();

        if (errorUser || !usuarioPerfil) {
            throw new Error("No se encontró el perfil de usuario asociado a esta sesión.");
        }

        const id_usuario_real = usuarioPerfil.id_usuario;

        // 2. Resolución de IDs (Equipos, Deportes, etc.)
        const idDeporte = await getOrCreateId('deportes', 'nombre_deporte', deporte, 'id_deporte');
        const idCamp = await getOrCreateId('campeonatos', 'nombre', campeonato, 'id_campeonato', { id_deporte: idDeporte });
        const idLocal = await getOrCreateId('equipos', 'nombre', equipo_local, 'id_equipo', { id_deporte: idDeporte });
        const idVis = await getOrCreateId('equipos', 'nombre', equipo_visitante, 'id_equipo', { id_deporte: idDeporte });
        const idTipo = await getOrCreateId('tipo_apuestas', 'tipo', tipo_apuesta, 'id_tipo', { id_deporte: idDeporte });
        const idOpcion = await getOrCreateId('opciones', 'opcion', opcion_elegida, 'id_opciones', { id_tipo: idTipo });

        // 3. Obtener correlativo nro_movimiento filtrado por usuario
        // Es importante filtrar por id_usuario para que cada uno tenga su propia secuencia M1, M2...
        const { data: ultimoMov } = await supabase
            .from('movimientos')
            .select('nro_movimiento')
            .eq('id_usuario', id_usuario_real)
            .order('nro_movimiento', { ascending: false })
            .limit(1);

        const siguienteMov = (ultimoMov && ultimoMov.length > 0) ? ultimoMov[0].nro_movimiento + 1 : 1;

        // 4. Inserción final en 'movimientos'
        const { error: errorInsert } = await supabase
            .from('movimientos')
            .insert([{
                id_usuario: id_usuario_real, // <--- Usamos el ID dinámico
                nro_movimiento: siguienteMov,
                fecha: fecha || new Date(),
                id_deporte: idDeporte,
                id_campeonato: idCamp,
                id_equipo_local: idLocal,
                id_equipo_visitante: idVis,
                id_tipo: idTipo,
                cuota: cuota,
                dinero: monto,
                id_opcion: idOpcion,
                id_resultado: 3 
            }]);

        if (errorInsert) throw errorInsert;

        res.status(201).json({ 
            success: true, 
            message: `Movimiento registrado con éxito` 
        });

    } catch (error) {
        console.error("Error en POST /api/apuestas:", error);
        res.status(500).json({ error: error.message });
    }
};

    module.exports = { crearApuesta };  