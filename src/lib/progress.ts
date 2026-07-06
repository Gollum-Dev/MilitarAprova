// Progress tracking helpers using localStorage

export interface StudentStats {
  studyHours: number;
  questionsAnswered: number;
  questionsCorrect: number;
  precision: number;
  progressPercent: number;
  patent: string;
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
    studyHours: parseFloat(studyHours.toFixed(1)),
    questionsAnswered,
    questionsCorrect,
    precision,
    progressPercent: Math.max(5, progressPercent), // Start with at least 5% visual baseline
    patent
  };
}
