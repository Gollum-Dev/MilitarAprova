const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://xuzdeercknpviaicxwiq.supabase.co', 'sb_publishable_Ap0TNbePgNCiTetwAAyVdQ_bKiKgcYQ');

async function test() {
  console.log("Testing insert global_disciplines...");
  const discId = "disc-test-" + Date.now();
  let { error: err1 } = await supabase.from('global_disciplines').insert([{ id: discId, name: 'Test Discipline' }]);
  if (err1) console.error("Error global_disciplines:", err1);
  else console.log("global_disciplines OK!");

  console.log("Testing insert global_areas...");
  const areaId = "area-test-" + Date.now();
  let { error: err2 } = await supabase.from('global_areas').insert([{ id: areaId, name: 'Test Area', discipline_id: discId }]);
  if (err2) console.error("Error global_areas:", err2);
  else console.log("global_areas OK!");

  console.log("Testing insert materias...");
  let { error: err3 } = await supabase.from('materias').insert([{ id: "mat-test-" + Date.now(), name: 'Test Materia', discipline: 'Test Discipline', area: 'Test Area' }]);
  if (err3) console.error("Error materias:", err3);
  else console.log("materias OK!");
}

test();
