export const prerender = false;
import { createClient } from '@supabase/supabase-js';

// Estas variables las configurarás en las variables de entorno de Vercel
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export const POST = async ({ request }) => {
  try {
    const data = await request.json();

    const { error } = await supabase.from('rsvp').insert([
      {
        nombre: data.nombre,
        asistira: data.asistira,
        pases: parseInt(data.pases),
        restricciones: data.restricciones || ''
      }
    ]);

    if (error) {
      return new Response(JSON.stringify({ message: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: "¡Confirmación guardada con éxito!" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Error interno en el servidor" }), { status: 500 });
  }
};