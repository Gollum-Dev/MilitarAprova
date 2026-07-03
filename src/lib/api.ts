import { supabase } from './supabase';
import { Course, CourseModule, Question, LawArticle, Badge, MockSimulator } from '../data'; // Keep types from data.ts, or move them here. We will just import types.

export async function fetchCourses(): Promise<Course[]> {
  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select('*');

  if (coursesError) throw coursesError;

  const { data: modulesData, error: modulesError } = await supabase
    .from('course_modules')
    .select('*');

  if (modulesError) throw modulesError;

  // Reconstruct the nested structure
  const courses: Course[] = coursesData.map((course: any) => ({
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    hours: course.hours,
    lessons: course.lessons,
    disciplinesCount: course.disciplines_count,
    modules: modulesData
      .filter((m: any) => m.course_id === course.id)
      .map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        lessonsCount: m.lessons_count,
        pdfsCount: m.pdfs_count,
        questionsCount: m.questions_count,
        progress: 0 // Will need to fetch from user_course_progress eventually
      }))
  }));

  return courses;
}

export async function fetchQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*');
    
  if (error) throw error;
  return data as Question[];
}

export async function fetchLawArticles(): Promise<LawArticle[]> {
  const { data, error } = await supabase
    .from('law_articles')
    .select('*');
    
  if (error) throw error;
  return data.map((d: any) => ({
    id: d.id,
    title: d.title,
    category: d.category,
    citation: d.citation,
    content: d.content,
    relatedQuestions: d.related_questions
  }));
}

export async function fetchBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*');
    
  if (error) throw error;
  return data.map((d: any) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    icon: d.icon,
    unlocked: false // Will need to fetch from user_badges
  }));
}

export async function fetchSimulators(): Promise<MockSimulator[]> {
  const { data, error } = await supabase
    .from('mock_simulators')
    .select('*');
    
  if (error) throw error;
  return data.map((d: any) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    questionsCount: d.questions_count,
    duration: d.duration,
    status: d.status
  }));
}

export async function generateNewCourseId(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${baseSlug}-${new Date().getFullYear()}`;
}

export async function fetchAdminCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, institution, year, status, disciplines_json');
    
  if (error) {
    console.error("Erro ao buscar cursos:", error);
    return [];
  }
  return data;
}

export async function createAdminCourse(course: any) {
  const { data, error } = await supabase
    .from('courses')
    .insert([course]);
    
  if (error) throw error;
  return data;
}

export async function updateAdminCourse(id: string, course: any) {
  const { data, error } = await supabase
    .from('courses')
    .update(course)
    .eq('id', id);
    
  if (error) throw error;
  return data;
}

export async function deleteAdminCourse(id: string) {
  const { data, error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return data;
}
