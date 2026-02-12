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
            tipo_apuesta, opcion_elegida, fecha, cuota, monto 
        } = req.body;
        const id_usuario = 2;

        // 1. Resolución de IDs respetando tus nombres de columna de las capturas
        const idDeporte = await getOrCreateId('deportes', 'nombre_deporte', deporte, 'id_deporte');
        
        // Tabla campeonatos usa columna 'nombre' según tu imagen
        const idCamp = await getOrCreateId('campeonatos', 'nombre', campeonato, 'id_campeonato', { id_deporte: idDeporte });
        
        const idLocal = await getOrCreateId('equipos', 'nombre', equipo_local, 'id_equipo', { id_deporte: idDeporte });
        const idVis = await getOrCreateId('equipos', 'nombre', equipo_visitante, 'id_equipo', { id_deporte: idDeporte });

        // Tabla tipo_apuestas usa columna 'tipo'
        const idTipo = await getOrCreateId('tipo_apuestas', 'tipo', tipo_apuesta, 'id_tipo', { id_deporte: idDeporte });
        
        // Tabla opciones usa columna 'opcion'
        const idOpcion = await getOrCreateId('opciones', 'opcion', opcion_elegida, 'id_opciones', { id_tipo: idTipo });

        // 2. Obtener correlativo nro_movimiento
        const { data: ultimoMov } = await supabase
            .from('movimientos')
            .select('nro_movimiento')
            .order('nro_movimiento', { ascending: false })
            .limit(1);

        const siguienteMov = (ultimoMov && ultimoMov.length > 0) ? ultimoMov[0].nro_movimiento + 1 : 1;

        // 3. Inserción final en 'movimientos' respetando tu esquema SQL
        const { error: errorInsert } = await supabase
            .from('movimientos')
            .insert([{
                id_usuario: id_usuario,
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
                id_resultado: 3 // Cambiado de id_opciones a id_opcion para coincidir con tu SQL
            }]);

        if (errorInsert) throw errorInsert;

        res.status(201).json({ success: true, message: `Movimiento M${siguienteMov} registrado con éxito.` });

    } catch (error) {
        console.error("Error en POST /api/apuestas:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { crearApuesta };  