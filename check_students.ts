import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function checkStudentsTable() {
  const { data, error } = await supabase.from('students').select('*').limit(1);
  if (error) {
    console.error("Error fetching students:", error.message);
  } else {
    console.log("Students data:", data);
  }
}

checkStudentsTable();
