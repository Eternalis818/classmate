// ─────────────────────────────────────────────
// functions/_shared/teachers.ts
// 老师数据规范化
// ─────────────────────────────────────────────

export function normalizeTeacherRow(row: any) {
  return {
    id: row.id,
    name: row.name || '',
    subject: row.subject || '',
    subjectEn: row.subject_en || '',
    role: row.role || '',
    isHeadTeacher: !!row.is_head_teacher,
    photo: row.photo_url || '',
    quote: row.quote || '',
    message: row.message || '',
    updatedAt: row.updated_at,
  };
}
