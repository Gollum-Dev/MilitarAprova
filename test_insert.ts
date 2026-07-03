import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const { data, error } = await supabase
    .from('courses')
    .insert([{
      id: 'test-course-id',
      title: 'Teste',
      subtitle: 'Descrição',
      hours: 0,
      lessons: 0,
      disciplines_count: 0,
      institution: 'Teste',
      year: '2026',
      status: 'Rascunho',
      disciplines_json: []
    }]);

  if (error) {
    console.error("ERRO SUPABASE:", error);
  } else {
    console.log("SUCESSO:", data);
    // Cleanup
    await supabase.from('courses').delete().eq('id', 'test-course-id');
  }
}

testInsert();
