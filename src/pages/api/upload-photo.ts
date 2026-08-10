export const prerender = false;
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    // Obtener todos los archivos en un Array de objetos File
    const files = formData.getAll('photos') as File[];
    const nombre = formData.get('nombre') as string;
    const comentario = formData.get('comentario') as string;

    if (!files || files.length === 0 || !nombre) {
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos' }), { status: 400 });
    }

    // 1. Subir todas las imágenes en paralelo a Supabase Storage
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      const { error: storageError } = await supabase.storage
        .from('fotos-boda')
        .upload(fileName, file, {
          contentType: file.type,
        });

      if (storageError) throw storageError;

      const { data: publicUrlData } = supabase.storage
        .from('fotos-boda')
        .getPublicUrl(fileName);

      return {
        url: publicUrlData.publicUrl,
        nombre_invitado: nombre,
        comentario: comentario || null,
      };
    });

    // Esperar a que se completen todas las cargas en el Storage
    const recordsToInsert = await Promise.all(uploadPromises);

    // 2. Insertar todos los registros juntos en la base de datos (Batch Insert)
    const { error: dbError } = await supabase
      .from('fotos_boda')
      .insert(recordsToInsert);

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ success: true, count: recordsToInsert.length }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};