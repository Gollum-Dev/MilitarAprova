import { supabase } from './supabase';

export interface Student {
  id?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  cpf?: string;
  status?: string;
  allowed_courses?: string[];
  created_at?: string;
  last_login?: string;
  study_hours?: number;
  resource_statuses?: any;
  completed_resources?: string[];
}

export async function fetchStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Erro ao buscar alunos:", error);
    return [];
  }
  return (data || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    password: s.password,
    phone: s.phone || '',
    cpf: s.cpf || '',
    status: s.status || 'Ativo',
    allowed_courses: Array.isArray(s.allowed_courses) ? s.allowed_courses : [],
    created_at: s.created_at,
    last_login: s.last_login,
    study_hours: s.study_hours,
    resource_statuses: s.resource_statuses,
    completed_resources: s.completed_resources
  }));
}

export async function createStudent(student: Student): Promise<Student | null> {
  const payload = {
    name: student.name,
    email: student.email,
    password: student.password || '123456',
    phone: student.phone || '',
    cpf: student.cpf || '',
    status: student.status || 'Ativo',
    allowed_courses: student.allowed_courses || []
  };

  const { data, error } = await supabase
    .from('students')
    .insert([payload])
    .select();

  if (error) {
    console.error("Erro ao cadastrar aluno:", error);
    throw error;
  }
  return data?.[0] || null;
}

export async function updateStudent(id: string, student: Student): Promise<Student | null> {
  const payload: any = {
    name: student.name,
    email: student.email,
    phone: student.phone || '',
    cpf: student.cpf || '',
    status: student.status || 'Ativo',
    allowed_courses: student.allowed_courses || []
  };

  if (student.password) {
    payload.password = student.password;
  }

  const { data, error } = await supabase
    .from('students')
    .update(payload)
    .eq('id', id)
    .select();

  if (error) {
    console.error("Erro ao atualizar aluno:", error);
    throw error;
  }
  return data?.[0] || null;
}

export async function deleteStudent(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Erro ao excluir aluno:", error);
    throw error;
  }
  return true;
}

export async function validateStudentLogin(email: string, password: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .eq('password', password)
    .eq('status', 'Ativo')
    .single();

  if (error) {
    console.warn("Credenciais inválidas ou erro ao validar login de aluno:", error.message);
    return null;
  }
  if (data?.id) {
    // Record last login in background
    supabase
      .from('students')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.id)
      .then()
      .catch(e => console.error('Erro ao atualizar last_login:', e));
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    cpf: data.cpf || '',
    status: data.status || 'Ativo',
    allowed_courses: Array.isArray(data.allowed_courses) ? data.allowed_courses : [],
    created_at: data.created_at,
    last_login: data.last_login,
    study_hours: data.study_hours,
    resource_statuses: data.resource_statuses,
    completed_resources: data.completed_resources
  };
}
