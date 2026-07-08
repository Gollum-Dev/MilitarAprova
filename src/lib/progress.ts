// Progress tracking helpers using localStorage

export interface StudentStats {
  studyHours: number;
  questionsAnswered: number;
  questionsCorrect: number;
  precision: number;
  progressPercent: number;
  patent: string;
}

export type StudyStatus = 'a-estudar' | 'estudando' | 'estudado';

export function getResourceStatuses(): Record<string, StudyStatus> {
  try {
    return JSON.parse(localStorage.getItem("militar_resource_statuses") || "{}");
  } catch {
    return {};
  }
}

export function setResourceStatus(resourceId: string, status: StudyStatus) {
  const statuses = getResourceStatuses();
  statuses[resourceId] = status;
  localStorage.setItem("militar_resource_statuses", JSON.stringify(statuses));
  
  // Sincronizar com completedResources para manter compatibilidade com as barras de progresso
  const completed = getCompletedResourceIds();
  if (status === 'estudado') {
    if (!completed.includes(resourceId)) {
      completed.push(resourceId);
      localStorage.setItem("militar_completed_resources", JSON.stringify(completed));
    }
  } else {
    const idx = completed.indexOf(resourceId);
    if (idx > -1) {
      completed.splice(idx, 1);
      localStorage.setItem("militar_completed_resources", JSON.stringify(completed));
    }
  }
}

export function getCompletedResourceIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem("militar_completed_resources") || "[]");
  } catch {
    return [];
  }
}

export function markResourceComplete(resourceId: string) {
  const completed = getCompletedResourceIds();
  if (!completed.includes(resourceId)) {
    completed.push(resourceId);
    localStorage.setItem("militar_completed_resources", JSON.stringify(completed));
  }
  
  // Também marca o status como estudado
  const statuses = getResourceStatuses();
  if (statuses[resourceId] !== 'estudado') {
    statuses[resourceId] = 'estudado';
    localStorage.setItem("militar_resource_statuses", JSON.stringify(statuses));
  }
}

export function recordQuestionAnswer(isCorrect: boolean) {
  const answered = parseInt(localStorage.getItem("militar_questions_answered") || "18");
  const correct = parseInt(localStorage.getItem("militar_questions_correct") || "14");
  
  localStorage.setItem("militar_questions_answered", (answered + 1).toString());
  if (isCorrect) {
    localStorage.setItem("militar_questions_correct", (correct + 1).toString());
  }
}

export function getStudentStats(totalResourcesCount: number): StudentStats {
  const studyHours = parseFloat(localStorage.getItem("militar_study_hours") || "12.5");
  const questionsAnswered = parseInt(localStorage.getItem("militar_questions_answered") || "18");
  const questionsCorrect = parseInt(localStorage.getItem("militar_questions_correct") || "14");
  
  const precision = questionsAnswered > 0 
    ? Math.round((questionsCorrect / questionsAnswered) * 100) 
    : 0;
     
  const completedCount = getCompletedResourceIds().length;
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
