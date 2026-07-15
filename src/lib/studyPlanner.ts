import { supabase } from './supabase';
import { getCompletedResourceIds, setResourceStatus } from './progress';

export interface TrilhaResource {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'pdf' | 'slides' | 'questoes' | 'cards';
  completed: boolean;
}

export interface TrilhaTask {
  id: string; // content-based unique task id
  contentId: string;
  contentName: string;
  moduleTitle: string; // Eixo Temático
  disciplineId: string;
  disciplineName: string;
  status: 'Pendente' | 'Concluida' | 'Atrasada';
  datePlanned?: string; // YYYY-MM-DD for Calendário mode
  cycleIndex?: number;  // Sequence index for Ciclo mode
  resources: TrilhaResource[];
}

export interface PlannerState {
  email: string;
  study_mode: 'calendario' | 'ciclo' | null;
  daily_blocks_available: number; // blocks/hours per day
  current_cycle_position: number;
  study_proficiency: Record<string, number>; // disciplineId -> proficiency (1-5)
  trilha_tasks: TrilhaTask[];
}

const plannerCache: PlannerState = {
  email: "",
  study_mode: null,
  daily_blocks_available: 2,
  current_cycle_position: 0,
  study_proficiency: {},
  trilha_tasks: []
};

// Initialize planner cache from student record
export function initializePlanner(student: any) {
  if (!student) return;
  plannerCache.email = student.email || "";
  plannerCache.study_mode = student.study_mode || null;
  plannerCache.daily_blocks_available = student.daily_blocks_available !== null && student.daily_blocks_available !== undefined
    ? (typeof student.daily_blocks_available === 'object' ? 2 : Number(student.daily_blocks_available))
    : 2;
  plannerCache.current_cycle_position = student.current_cycle_position || 0;
  plannerCache.study_proficiency = student.study_proficiency || {};
  plannerCache.trilha_tasks = student.trilha_tasks || [];

  // If in calendar mode, auto-check for late tasks on load
  if (plannerCache.study_mode === 'calendario') {
    checkAndUpdateLateTasks();
  }
}

// Sync current cache to Supabase
export async function savePlannerToSupabase() {
  try {
    const email = plannerCache.email;
    if (!email) return;

    await supabase
      .from('students')
      .update({
        study_mode: plannerCache.study_mode,
        daily_blocks_available: plannerCache.daily_blocks_available,
        current_cycle_position: plannerCache.current_cycle_position,
        study_proficiency: plannerCache.study_proficiency,
        trilha_tasks: plannerCache.trilha_tasks
      })
      .eq('email', email);
  } catch (err) {
    console.error("Erro ao salvar planejador no Supabase:", err);
  }
}

export function getPlannerState(): PlannerState {
  const completedIds = getCompletedResourceIds();
  
  // Dynamically update task resources and status based on completedIds
  const updatedTasks = plannerCache.trilha_tasks.map(task => {
    const updatedResources = task.resources.map(res => ({
      ...res,
      completed: completedIds.includes(res.id)
    }));
    
    const allCompleted = updatedResources.every(r => r.completed);
    const newStatus = allCompleted ? 'Concluida' as const : (task.status === 'Concluida' ? 'Pendente' as const : task.status);
    
    return {
      ...task,
      resources: updatedResources,
      status: newStatus
    };
  });

  return { 
    ...plannerCache, 
    study_proficiency: { ...plannerCache.study_proficiency }, 
    trilha_tasks: updatedTasks 
  };
}

// Perform daily late verification for Calendar Mode
export function checkAndUpdateLateTasks() {
  const todayStr = new Date().toISOString().split('T')[0];
  let changed = false;

  plannerCache.trilha_tasks = plannerCache.trilha_tasks.map(task => {
    if (task.status === 'Pendente' && task.datePlanned && task.datePlanned < todayStr) {
      changed = true;
      return { ...task, status: 'Atrasada' as const };
    }
    return task;
  });

  if (changed) {
    savePlannerToSupabase();
  }
}

// Onboarding: configure and generate study trail
export async function setupPlanner(
  mode: 'calendario' | 'ciclo',
  dailyBlocks: number,
  proficiency: Record<string, number>,
  courses: any[],
  simuladoPerformances: Record<string, number> = {} // e.g. { "moduleTitle/DisciplineName": 50 } (percentage)
) {
  plannerCache.study_mode = mode;
  plannerCache.daily_blocks_available = dailyBlocks;
  plannerCache.study_proficiency = proficiency;
  plannerCache.current_cycle_position = 0;

  // Generate weighted queue of contents
  const tasks = generateStudyQueue(courses, proficiency, simuladoPerformances, mode, dailyBlocks);
  plannerCache.trilha_tasks = tasks;

  await savePlannerToSupabase();
  return getPlannerState();
}

// Generate queue based on course hierarchy
function generateStudyQueue(
  courses: any[],
  proficiency: Record<string, number>,
  simuladoPerformances: Record<string, number>,
  mode: 'calendario' | 'ciclo',
  dailyBlocks: number
): TrilhaTask[] {
  const allContentsList: {
    contentId: string;
    contentName: string;
    moduleTitle: string;
    disciplineId: string;
    disciplineName: string;
    resources: TrilhaResource[];
    weight: number;
  }[] = [];

  courses.forEach(course => {
    course.modules.forEach((module: any) => {
      const rawDisc = module.rawDiscipline;
      if (rawDisc && Array.isArray(rawDisc.areas)) {
        const disciplineId = rawDisc.id || module.id;
        const disciplineName = rawDisc.name || module.title;

        // Base weight from proficiency: 1 (easy/expert) to 5 (difficult/beginner)
        const prof = proficiency[disciplineId] || 3;
        let baseWeight = Math.max(1, 6 - prof);

        // Adaptive learning rule: if mock performance for this subject/axis is < 60%, increase weight
        const performance = simuladoPerformances[disciplineName] ?? simuladoPerformances[module.title] ?? 100;
        if (performance < 60) {
          baseWeight = Math.round(baseWeight * 1.8); // study this subject 80% more frequently
        }

        rawDisc.areas.forEach((area: any) => {
          if (Array.isArray(area.contents)) {
            area.contents.forEach((content: any) => {
              const resources: TrilhaResource[] = [];
              if (Array.isArray(content.resources)) {
                content.resources.forEach((res: any) => {
                  resources.push({
                    id: res.id?.toString() || `${content.id}-${res.type}`,
                    title: res.title || "Material",
                    type: res.type,
                    completed: false
                  });
                });
              }

              if (resources.length > 0) {
                allContentsList.push({
                  contentId: content.id?.toString() || `c-${content.name}`,
                  contentName: content.name,
                  moduleTitle: area.name || module.title,
                  disciplineId,
                  disciplineName,
                  resources,
                  weight: baseWeight
                });
              }
            });
          }
        });
      }
    });
  });

  // Duplicate items in the scheduling list according to their weights to achieve adaptive frequency
  let weightedQueue: typeof allContentsList = [];
  allContentsList.forEach(item => {
    for (let w = 0; w < item.weight; w++) {
      weightedQueue.push({ ...item });
    }
  });

  // Shuffle/interleave to distribute subjects evenly and avoid consecutive identical subjects
  weightedQueue = interleaveSubjects(weightedQueue);

  // Map to tasks
  let dayCounter = 0;
  let blockCounter = 0;
  const today = new Date();
  
  const tasks: TrilhaTask[] = [];
  weightedQueue.forEach((item, idx) => {
    const task: TrilhaTask = {
      id: `${item.contentId}-task-${idx}`,
      contentId: item.contentId,
      contentName: item.contentName,
      moduleTitle: item.moduleTitle,
      disciplineId: item.disciplineId,
      disciplineName: item.disciplineName,
      status: 'Pendente',
      resources: item.resources.map(r => ({ ...r }))
    };

    if (mode === 'calendario') {
      let plannedDate = new Date(today);
      plannedDate.setDate(today.getDate() + dayCounter);
      let plannedDateStr = plannedDate.toISOString().split('T')[0];

      // Shift to next day if this subject is already scheduled on plannedDateStr
      while (tasks.some(t => t.datePlanned === plannedDateStr && t.contentId === item.contentId)) {
        dayCounter++;
        plannedDate = new Date(today);
        plannedDate.setDate(today.getDate() + dayCounter);
        plannedDateStr = plannedDate.toISOString().split('T')[0];
        blockCounter = 0; // Reset blocks on new day
      }

      task.datePlanned = plannedDateStr;

      blockCounter++;
      if (blockCounter >= dailyBlocks) {
        blockCounter = 0;
        dayCounter++;
      }
    } else {
      task.cycleIndex = idx;
    }

    tasks.push(task);
  });

  return tasks;
}

// Distributes elements of the same subjects apart
function interleaveSubjects(queue: any[]): any[] {
  const result: any[] = [];
  const buckets: Record<string, any[]> = {};

  // Group by discipline
  queue.forEach(item => {
    if (!buckets[item.disciplineId]) {
      buckets[item.disciplineId] = [];
    }
    buckets[item.disciplineId].push(item);
  });

  const keys = Object.keys(buckets);
  let hasMore = true;

  while (hasMore) {
    hasMore = false;
    keys.forEach(key => {
      if (buckets[key].length > 0) {
        result.push(buckets[key].shift());
        hasMore = true;
      }
    });
  }

  return result;
}

// Mark resource inside a task as completed
export async function completeTaskResource(taskId: string, resourceId: string, completed: boolean) {
  // Sync with global progress
  setResourceStatus(resourceId, completed ? 'estudado' : 'a-estudar');

  let taskChanged = false;
  plannerCache.trilha_tasks = plannerCache.trilha_tasks.map(task => {
    if (task.id === taskId) {
      const updatedResources = task.resources.map(res => {
        if (res.id === resourceId) {
          return { ...res, completed };
        }
        return res;
      });

      // If all resources in the task are completed, mark task as Concluida
      const allCompleted = updatedResources.every(r => r.completed);
      const newStatus = allCompleted ? 'Concluida' as const : (task.status === 'Concluida' ? 'Pendente' as const : task.status);

      taskChanged = true;
      return {
        ...task,
        resources: updatedResources,
        status: newStatus
      };
    }
    return task;
  });

  if (taskChanged) {
    // In Ciclo Mode: if the current active task is completed, advance cycle index
    if (plannerCache.study_mode === 'ciclo') {
      const activeTask = plannerCache.trilha_tasks[plannerCache.current_cycle_position];
      if (activeTask && activeTask.status === 'Concluida') {
        plannerCache.current_cycle_position += 1;
      }
    }
    await savePlannerToSupabase();
  }
}

// Recalculate Calendar Route: distributes remaining Pending/Atrasada tasks from today forward
export async function recalculateCalendarRoute() {
  if (plannerCache.study_mode !== 'calendario') return;

  const todayStr = new Date().toISOString().split('T')[0];
  const completedTasks = plannerCache.trilha_tasks.filter(t => t.status === 'Concluida');
  const pendingTasks = plannerCache.trilha_tasks.filter(t => t.status !== 'Concluida');

  let dayCounter = 0;
  let blockCounter = 0;
  const today = new Date();

  const reallocatedPending: TrilhaTask[] = [];
  pendingTasks.forEach((task) => {
    let plannedDate = new Date(today);
    plannedDate.setDate(today.getDate() + dayCounter);
    let plannedDateStr = plannedDate.toISOString().split('T')[0];

    // Shift to next day if this subject is already reallocated for this day
    while (
      reallocatedPending.some(t => t.datePlanned === plannedDateStr && t.contentId === task.contentId) ||
      completedTasks.some(t => t.datePlanned === plannedDateStr && t.contentId === task.contentId)
    ) {
      dayCounter++;
      plannedDate = new Date(today);
      plannedDate.setDate(today.getDate() + dayCounter);
      plannedDateStr = plannedDate.toISOString().split('T')[0];
      blockCounter = 0;
    }

    reallocatedPending.push({
      ...task,
      status: 'Pendente',
      datePlanned: plannedDateStr
    });

    blockCounter++;
    if (blockCounter >= plannerCache.daily_blocks_available) {
      blockCounter = 0;
      dayCounter++;
    }
  });

  // Re-assemble task list
  plannerCache.trilha_tasks = [...completedTasks, ...reallocatedPending];
  await savePlannerToSupabase();
  return getPlannerState();
}

// Reset/clear settings
export async function resetPlanner() {
  plannerCache.study_mode = null;
  plannerCache.daily_blocks_available = 2;
  plannerCache.current_cycle_position = 0;
  plannerCache.study_proficiency = {};
  plannerCache.trilha_tasks = [];

  await savePlannerToSupabase();
  return getPlannerState();
}
