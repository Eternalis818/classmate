-- 0004_set_founder_delta_theme.sql
-- 把发起人 id=50 切到 delta-force 主题（Open Design 新生成）
-- 执行：Cloudflare Dashboard → D1 → gradbook-db → Console → 粘贴此 SQL → Run

UPDATE students
SET template = 'delta-force',
    updated_at = datetime('now')
WHERE id = '50';

-- 验证
SELECT id, name, template, updated_at
FROM students
WHERE id = '50';
