const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function run() {
  console.log("Iniciando atualização da categoria da Constituição de 1988 no banco de dados...");
  
  const ids = ['lei-01', 'lei-02', 'lei-05'];
  
  const { data, error } = await supabase
    .from('law_articles')
    .update({ category: 'Constituição da República Federativa do Brasil de 1988' })
    .in('id', ids);

  if (error) {
    console.error("Erro ao atualizar os artigos constitucionais:", error);
    process.exit(1);
  }

  console.log("Artigos constitucionais atualizados com sucesso no Supabase!");
  process.exit(0);
}

run();
