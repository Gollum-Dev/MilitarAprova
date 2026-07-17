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
  const courses: Course[] = coursesData.map((course: any) => {
    let mappedModules: CourseModule[] = [];
    let disciplinesList: any[] = [];
    
    if (course.disciplines_json) {
      try {
        disciplinesList = typeof course.disciplines_json === 'string'
          ? JSON.parse(course.disciplines_json)
          : course.disciplines_json;
      } catch (e) {
        console.error("Erro ao fazer parse de disciplines_json:", e);
      }
    }

    if (Array.isArray(disciplinesList) && disciplinesList.length > 0) {
      mappedModules = disciplinesList.map((disc: any) => {
        let videos = 0;
        let pdfs = 0;
        let questions = 0;
        
        if (Array.isArray(disc.areas)) {
          disc.areas.forEach((area: any) => {
            if (Array.isArray(area.contents)) {
              area.contents.forEach((content: any) => {
                if (Array.isArray(content.resources)) {
                  content.resources.forEach((res: any) => {
                    if (res.type === 'video') videos++;
                    else if (res.type === 'pdf') pdfs++;
                    else if (res.type === 'questoes') questions++;
                  });
                }
              });
            }
          });
        }

        return {
          id: disc.id,
          title: disc.name,
          description: `Possui ${disc.areas?.length || 0} eixos temáticos vinculados.`,
          lessonsCount: videos,
          pdfsCount: pdfs,
          questionsCount: questions,
          progress: 0,
          rawDiscipline: disc
        };
      });
    } else {
      mappedModules = modulesData
        .filter((m: any) => m.course_id === course.id)
        .map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          lessonsCount: m.lessons_count,
          pdfsCount: m.pdfs_count,
          questionsCount: m.questions_count,
          progress: 0
        }));
    }

    return {
      id: course.id,
      title: course.title,
      subtitle: course.subtitle || '',
      hours: course.hours || 0,
      lessons: course.lessons || 0,
      disciplinesCount: Array.isArray(disciplinesList) ? disciplinesList.length : (course.disciplines_count || 0),
      cover_url: course.cover_url || '',
      description: course.description || '',
      end_date: course.end_date || undefined,
      modules: mappedModules
    };
  });

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
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('mock_simulators')
    .select('*');
    
  if (error) throw error;

  let resultsMap: Record<string, number> = {};
  if (user) {
    const { data: resultsData } = await supabase
      .from('user_simulator_results')
      .select('simulator_id, grade')
      .eq('user_id', user.id);
    if (resultsData) {
      resultsData.forEach(r => {
        resultsMap[r.simulator_id] = r.grade;
      });
    }
  }

  return data.map((d: any) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    questionsCount: d.questions_count || (d.questions ? d.questions.length : 0),
    duration: d.duration,
    status: resultsMap[d.id] !== undefined ? "finalizado" : d.status,
    grade: resultsMap[d.id],
    questions: d.questions || [],
    course_ids: d.course_ids || []
  }));
}

export async function saveSimulatorResult(simulatorId: string, grade: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  const { data: existing } = await supabase
    .from('user_simulator_results')
    .select('id')
    .eq('user_id', user.id)
    .eq('simulator_id', simulatorId)
    .maybeSingle();

  if (existing) {
    await supabase.from('user_simulator_results').update({ grade, completed_at: new Date().toISOString() }).eq('id', existing.id);
  } else {
    await supabase.from('user_simulator_results').insert({
      user_id: user.id,
      simulator_id: simulatorId,
      grade
    });
  }
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
    .select('id, title, institution, year, status, cover_url, description, end_date, disciplines_json');
    
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
