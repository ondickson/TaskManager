import { createClient } from '@supabase/supabase-js';
import { SUPABASE_KEY } from '@env'; // Correct way to import the environment variable

console.log('Supabase Key:', SUPABASE_KEY); // Log the Supabase key

const supabaseUrl = 'https://aqfnbaegbqgojmwusvmf.supabase.co';
const supabase = createClient(supabaseUrl, SUPABASE_KEY); // Use the imported variable

export default supabase;
