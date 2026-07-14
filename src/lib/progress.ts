import { supabase } from './supabase';

export interface StudentStats {
  studyHours: number;
  questionsAnswered: number;
  questionsCorrect: number;
  precision: number;
  progressPercent: number;
  patent: string;
}

export type StudyStatus = 'a-estudar' | 'estudando' | 'estudado';

// In-memory cache for the student's progress
const progressCache = {
  email: "",
  resource_statuses: {} as Record<string, StudyStatus>,
  completed_resources: [] as string[],
  completed_dates: {} as Record<string, string>,
  study_hours: 12.5,
  questions_answered: 18,
  questions_correct: 14
};

// Initialize progress from the database loaded student profile
export function initializeProgress(student: any) {
  if (!student) return;
  progressCache.email = student.email || "";
  progressCache.resource_statuses = student.resource_statuses || {};
  progressCache.completed_resources = student.completed_resources || [];
  progressCache.completed_dates = student.completed_dates || {};
  progressCache.study_hours = student.study_hours !== null && student.study_hours !== undefined ? Number(student.study_hours) : 12.5;
  progressCache.questions_answered = student.questions_answered !== null && student.questions_answered !== undefined ? Number(student.questions_answered) : 18;
  progressCache.questions_correct = student.questions_correct !== null && student.questions_correct !== undefined ? Number(student.questions_correct) : 14;
}

// Asynchronously save in-memory progress cache to Supabase
async function saveProgressToSupabase() {
  try {
    const email = progressCache.email;
    if (!email) return;

    await supabase
      .from('students')
      .update({
        resource_statuses: progressCache.resource_statuses,
        completed_resources: progressCache.completed_resources,
        completed_dates: progressCache.completed_dates,
        study_hours: progressCache.study_hours,
        questions_answered: progressCache.questions_answered,
        questions_correct: progressCache.questions_correct
      })
      .eq('email', email);
  } catch (err) {
    console.error("Erro ao salvar progresso no Supabase:", err);
  }
}

export function getResourceStatuses(): Record<string, StudyStatus> {
  return { ...progressCache.resource_statuses };
}

export function getResourceCompletionDates(): Record<string, string> {
  return { ...progressCache.completed_dates };
}

function setResourceCompletionDate(resourceId: string, dateStr: string | null) {
  if (dateStr) {
    progressCache.completed_dates = {
      ...progressCache.completed_dates,
      [resourceId]: dateStr
    };
  } else {
    const nextDates = { ...progressCache.completed_dates };
    delete nextDates[resourceId];
    progressCache.completed_dates = nextDates;
  }
}

export function setResourceStatus(resourceId: string, status: StudyStatus) {
  progressCache.resource_statuses = {
    ...progressCache.resource_statuses,
    [resourceId]: status
  };
  
  const completed = [...progressCache.completed_resources];
  if (status === 'estudado') {
    if (!completed.includes(resourceId)) {
      completed.push(resourceId);
      progressCache.completed_resources = completed;
      const today = new Date().toISOString().split('T')[0];
      setResourceCompletionDate(resourceId, today);
    }
  } else {
    const idx = completed.indexOf(resourceId);
    if (idx > -1) {
      completed.splice(idx, 1);
      progressCache.completed_resources = completed;
      setResourceCompletionDate(resourceId, null);
    }
  }
  
  saveProgressToSupabase();
}

export function getCompletedResourceIds(): string[] {
  return [...progressCache.completed_resources];
}

export function markResourceComplete(resourceId: string) {
  const completed = [...progressCache.completed_resources];
  if (!completed.includes(resourceId)) {
    completed.push(resourceId);
    progressCache.completed_resources = completed;
    const today = new Date().toISOString().split('T')[0];
    setResourceCompletionDate(resourceId, today);
  }
  
  if (progressCache.resource_statuses[resourceId] !== 'estudado') {
    progressCache.resource_statuses = {
      ...progressCache.resource_statuses,
      [resourceId]: 'estudado'
    };
  }

  saveProgressToSupabase();
}

export function recordQuestionAnswer(isCorrect: boolean) {
  progressCache.questions_answered += 1;
  if (isCorrect) {
    progressCache.questions_correct += 1;
  }
  saveProgressToSupabase();
}

export function incrementStudyHours(amount: number) {
  progressCache.study_hours = Number((progressCache.study_hours + amount).toFixed(4));
  saveProgressToSupabase();
}

export function getStudentStats(totalResourcesCount: number): StudentStats {
  const studyHours = progressCache.study_hours;
  const questionsAnswered = progressCache.questions_answered;
  const questionsCorrect = progressCache.questions_correct;
  
  const precision = questionsAnswered > 0 
    ? Math.round((questionsCorrect / questionsAnswered) * 100) 
    : 0;
     
  const completedCount = progressCache.completed_resources.length;
  const progressPercent = totalResourcesCount > 0 
    ? Math.min(100, Math.round((completedCount / totalResourcesCount) * 100)) 
    : 0;

  // Determine patent based on questions answered
  let patent = "SOLDADO";
  if (questionsAnswered >= 50) patent = "CABO";
  if (questionsAnswered >= 100) patent = "SARGENTO";
  if (questionsAnswered >= 200) patent = "SUBTENENTE";
  if (questionsAnswered >= 500) patent = "SEGUNDO TENENTE";
  if (questionsAnswered >= 1000) patent = "PRIMEIRO TENENTE";

  return {
    studyHours,
    questionsAnswered,
    questionsCorrect,
    precision,
    progressPercent,
    patent
  };
}
