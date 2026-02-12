const supabase = require('../config/supabaseClient');

const getFormResources = async (req, res) => {
    try {
        // 1. Probar Deportes
        const { data: deportes, error: errDep } = await supabase.from('deportes').select('*');
        if (errDep) return res.status(500).json({ error: "Tabla deportes: " + errDep.message });

        // 2. Probar Campeonatos
        const { data: campeonatos, error: errCamp } = await supabase.from('campeonatos').select('*');
        if (errCamp) return res.status(500).json({ error: "Tabla campeonatos: " + errCamp.message });

        // 3. Probar Equipos
        const { data: equipos, error: errEq } = await supabase.from('equipos').select('*');
        if (errEq) return res.status(500).json({ error: "Tabla equipos: " + errEq.message });

        // 4. NUEVO: Probar Tipos de Apuestas
        const { data: tipo_apuestas, error: errTipo } = await supabase.from('tipo_apuestas').select('*');
        if (errTipo) return res.status(500).json({ error: "Tabla tipo_apuestas: " + errTipo.message });

        // 5. NUEVO: Probar Opciones
        const { data: opciones, error: errOpc } = await supabase.from('opciones').select('*');
        if (errOpc) return res.status(500).json({ error: "Tabla opciones: " + errOpc.message });

        // Devolvemos todo el "árbol" de datos
        res.status(200).json({ 
            deportes, 
            campeonatos, 
            equipos, 
            tipo_apuestas, 
            opciones 
        });

    } catch (error) {
        console.error("Error inesperado:", error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getFormResources };