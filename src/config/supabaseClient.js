const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Creamos el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
