// src/pages/api/photos.ts
export const prerender = false;
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';


// Configura las variables de entorno en tu .env
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const GET: APIRoute = async () => {
    try {
        // Consultar la tabla de fotos ordenada por fecha
        const { data: photos, error } = await supabase
            .from('fotos_boda')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify(photos || []), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};