const supabase = require('../config/supabaseClient'); // Asegúrate de que la ruta a tu cliente sea correcta

const registrarMovimiento = async (req, res) => {
    // 1. Extraemos los NUEVOS campos del cuerpo de la petición
    const { 
        id_usuario, 
        id_deporte, 
        id_campeonato, 
        id_equipo_local, 
        id_equipo_visitante, 
        id_tipo,        // ID de 'Handicap de Mapas'
        id_opcion,      // ID de 'Local +1.5'
        cuota, 
        dinero, 
        id_resultado,   // Ahora lo enviamos desde el curl (ej: 1 para Ganador)
        fecha 
    } = req.body;

    try {
        // 2. Obtener el último número de movimiento para ESTE usuario
        const { data: ultimoMov, error: errorConteo } = await supabase
            .from('movimientos')
            .select('nro_movimiento')
            .eq('id_usuario', id_usuario)
            .order('nro_movimiento', { ascending: false })
            .limit(1);

        if (errorConteo) throw errorConteo;

        // 3. Calcular el siguiente número (M1, M2, etc.)
        const siguienteMov = ultimoMov.length > 0 ? ultimoMov[0].nro_movimiento + 1 : 1;

        // 4. Insertar el movimiento con la estructura COMPLETA
        const { data, error } = await supabase
            .from('movimientos')
            .insert([{
                id_usuario,
                nro_movimiento: siguienteMov,
                id_deporte,
                id_campeonato,
                id_equipo_local,
                id_equipo_visitante,
                id_tipo,        // Agregado
                id_opcion,      // Agregado
                cuota,
                dinero,
                id_resultado: id_resultado || 3, // Si no viene, por defecto es 3 (Pendiente)
                fecha: fecha || new Date().toISOString().split('T')[0] // Fecha del M1 o hoy
            }])
            .select();

        if (error) throw error;

        res.status(201).json({ 
            mensaje: `Movimiento M${siguienteMov} registrado!`, 
            movimiento: data[0] 
        });

    } catch (error) {
        console.error("Error en registrarMovimiento:", error.message);
        res.status(400).json({ error: error.message });
    }
};

const obtenerMovimientos = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const { data, error } = await supabase
            .from('movimientos')
            .select(`
                nro_movimiento,
                fecha,
                cuota,
                dinero,
                deportes (nombre_deporte),
                campeonatos (nombre),
                local:equipos!id_equipo_local (nombre),
                visitante:equipos!id_equipo_visitante (nombre),
                tipo_apuestas (tipo),
                opciones (opcion),
                resultados (resultado)
            `)
            .eq('id_usuario', id_usuario)
            .order('nro_movimiento', { ascending: false });

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
module.exports = { 
    registrarMovimiento, 
    obtenerMovimientos // <-- Asegúrate de que esta línea esté aquí
};