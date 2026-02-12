const supabase = require('../config/supabaseClient');

const getHistorialPorUsuario = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 0; // Página actual (empieza en 0)
        const size = parseInt(req.query.size) || 10; // Cuántos registros por página

        const desde = page * size;
        const hasta = desde + size - 1;

        const { data, error, count } = await supabase
            .from('movimientos')
            .select(`
                fecha, nro_movimiento, cuota, dinero, id_resultado,
                deportes(nombre_deporte),
                local:id_equipo_local(nombre),
                visitante:id_equipo_visitante(nombre),
                tipo_apuestas(tipo),
                opciones(opcion),
                resultados(resultado)
            `, { count: 'exact' }) // Esto nos da el total de filas en la DB
            .eq('id_usuario', userId)
            .order('nro_movimiento', { ascending: false })
            .range(desde, hasta);

        if (error) throw error;

        res.status(200).json({ data, total: count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const actualizarEstados = async (req, res) => {
    try {
        const { ids, nuevoEstadoId } = req.body; // ids es un array [1, 2, 4...]

        const { data, error } = await supabase
            .from('movimientos')
            .update({ id_resultado: nuevoEstadoId })
            .in('nro_movimiento', ids); // Filtra todos los que estén en la lista

        if (error) throw error;

        res.status(200).json({ message: "Actualizado correctamente", data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const eliminarApuestas = async (req, res) => {
    try {
        const { ids } = req.body;

        const { data, error } = await supabase
            .from('movimientos')
            .delete()
            .in('nro_movimiento', ids);

        if (error) throw error;

        res.status(200).json({ message: "Eliminado con éxito", data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ACUÉRDATE de agregarla al module.exports al final del archivo
module.exports = { getHistorialPorUsuario, actualizarEstados, eliminarApuestas };