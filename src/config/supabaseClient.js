const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log("🔗 Conectando a:", supabaseUrl ? "URL cargada ✅" : "URL FALTANTE ❌");
console.log("🔑 Key:", supabaseKey ? "Key cargada ✅" : "Key FALTANTE ❌");

if (!supabaseUrl || !supabaseKey) {
    console.error("💥 ERROR: No se encontraron las credenciales en el archivo .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);
module.exports = supabase;
