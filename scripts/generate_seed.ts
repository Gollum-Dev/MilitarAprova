import fs from 'fs';
import { COURSES, QUESTIONS, LEIS_ARTICLES, BADGES, MOCK_SIMULATORS } from '../src/data';

let sql = '';

// Helper to escape strings
const esc = (str) => {
    if (str === null || str === undefined) return 'NULL';
    return "'" + str.replace(/'/g, "''") + "'";
};

// 1. Courses and Modules
COURSES.forEach(course => {
    sql += `INSERT INTO public.courses (id, title, subtitle, hours, lessons, disciplines_count) VALUES (${esc(course.id)}, ${esc(course.title)}, ${esc(course.subtitle)}, ${course.hours}, ${course.lessons}, ${course.disciplinesCount}) ON CONFLICT (id) DO NOTHING;\n`;
    
    course.modules.forEach(mod => {
        sql += `INSERT INTO public.course_modules (id, course_id, title, description, lessons_count, pdfs_count, questions_count) VALUES (${esc(mod.id)}, ${esc(course.id)}, ${esc(mod.title)}, ${esc(mod.description)}, ${mod.lessonsCount}, ${mod.pdfsCount}, ${mod.questionsCount}) ON CONFLICT (id) DO NOTHING;\n`;
    });
});
sql += '\n';

// 2. Questions
QUESTIONS.forEach(q => {
    const altsJson = JSON.stringify(q.alternatives).replace(/'/g, "''");
    sql += `INSERT INTO public.questions (id, banca, year, discipline, subject, text, alternatives, correct, explanation) VALUES (${esc(q.id)}, ${esc(q.banca)}, ${q.year}, ${esc(q.discipline)}, ${esc(q.subject)}, ${esc(q.text)}, '${altsJson}'::jsonb, ${esc(q.correct)}, ${esc(q.explanation)}) ON CONFLICT (id) DO NOTHING;\n`;
});
sql += '\n';

// 3. Law Articles
LEIS_ARTICLES.forEach(l => {
    const relJson = JSON.stringify(l.relatedQuestions || []).replace(/'/g, "''");
    sql += `INSERT INTO public.law_articles (id, title, category, citation, content, related_questions) VALUES (${esc(l.id)}, ${esc(l.title)}, ${esc(l.category)}, ${esc(l.citation)}, ${esc(l.content)}, '${relJson}'::jsonb) ON CONFLICT (id) DO NOTHING;\n`;
});
sql += '\n';

// 4. Badges
BADGES.forEach(b => {
    sql += `INSERT INTO public.badges (id, title, description, icon) VALUES (${esc(b.id)}, ${esc(b.title)}, ${esc(b.description)}, ${esc(b.icon)}) ON CONFLICT (id) DO NOTHING;\n`;
});
sql += '\n';

// 5. Mock Simulators
MOCK_SIMULATORS.forEach(m => {
    sql += `INSERT INTO public.mock_simulators (id, title, description, questions_count, duration, status) VALUES (${esc(m.id)}, ${esc(m.title)}, ${esc(m.description)}, ${m.questionsCount}, ${esc(m.duration)}, ${esc(m.status)}) ON CONFLICT (id) DO NOTHING;\n`;
});

fs.writeFileSync('seed.sql', sql, 'utf8');
console.log('seed.sql generated successfully!');
