const supabase = require('./src/config/supabaseClient');

async function probarProyecto() {
    console.log("🚀 Iniciando prueba de conexión...");

    // 1. Insertar un deporte
    const { data: insertData, error: insertError } = await supabase
        .from('deportes')
        .insert([{ nombre_deporte: 'Fútbol' }])
        .select();

    if (insertError) {
        console.error("❌ Error al insertar:", insertError.message);
        return;
    }
    console.log("✅ Deporte insertado con éxito:", insertData);

    // 2. Leer los deportes
    const { data: readData, error: readError } = await supabase
        .from('deportes')
        .select('*');

    if (readError) {
        console.error("❌ Error al leer:", readError.message);
        return;
    }
    console.log("📊 Datos actuales en la tabla 'deportes':", readData);
    
    console.log("\n🎉 ¡Conexión exitosa! Tu estructura modular funciona.");
}

probarProyecto();
