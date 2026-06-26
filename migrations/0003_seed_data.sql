-- ─────────────────────────────────────────────────────
-- 时光纪念册 · 0003 初始数据导入（学生 + 老师）
-- 执行: wrangler d1 execute gradbook-db --file=./migrations/0003_seed_data.sql --remote
-- 或通过 D1 Console 逐条执行
-- ─────────────────────────────────────────────────────

-- ─── 学生数据 ────────────────────────────────────────
-- id=01 空模板
INSERT OR IGNORE INTO students (id, name, nickname, student_number, class, school, tags, motto, highlights, abilities_swim, abilities_tech, abilities_resp, pet_json, future_letter, template, stickers, is_founder, is_public, password_hash)
VALUES ('01', '', '', '01', '六年级4班', '松柏第二小学', '[]', '', '[]', 0, 0, 0, null, '', 'starlight-admission', '[]', 0, 1, null);

-- id=50 张迤恩（发起人）
INSERT OR IGNORE INTO students (id, name, nickname, student_number, class, school, tags, motto, highlights, abilities_swim, abilities_tech, abilities_resp, pet_json, future_letter, template, stickers, is_founder, is_public, password_hash)
VALUES ('50', '张迤恩', '迤恩', '50', '六年级4班', '松柏第二小学', '["靠谱小队长","暖心闺蜜","科技小达人"]', '', '[{"year":"2024","title":"校级游泳比赛获奖","desc":"在校级游泳比赛中获得佳绩"},{"year":"2026","title":"AI编程作品展示","desc":"独立完成AI编程作品并展示"},{"year":"2026","title":"担任班级小队长","desc":"认真负责，是老师的好帮手"}]', 95, 88, 92, '{"name":"年糕","type":"橘猫","photo":"photos/50/pet.jpg","desc":"一只超萌的橘猫，最爱晒太阳和吃小鱼干"}', '亲爱的初中自己：愿你依然阳光开朗，依然热爱游泳和AI，依然对世界充满好奇...', 'starlight-admission', '["star","cat","swim"]', 1, 1, null);

-- id=50 的个人留言
INSERT OR IGNORE INTO messages (id, from_student_id, from_name, to_student_id, avatar_url, text, handwritten_url, type, is_approved)
VALUES ('msg-50-from-12', '12', '李小明', '50', 'photos/12/avatar.jpg', '迤恩，六年同窗，谢谢你总是那么靠谱！', 'photos/messages/50-from-12.jpg', 'personal', 1);

-- id=50 的照片元数据
INSERT OR IGNORE INTO photos (id, owner_type, owner_id, category, url) VALUES ('ph-50-avatar', 'student', '50', 'avatar', 'photos/50/avatar.jpg');
INSERT OR IGNORE INTO photos (id, owner_type, owner_id, category, url) VALUES ('ph-50-life-1', 'student', '50', 'life', 'photos/50/life-1.jpg');
INSERT OR IGNORE INTO photos (id, owner_type, owner_id, category, url) VALUES ('ph-50-school-1', 'student', '50', 'school', 'photos/50/school-1.jpg');
INSERT OR IGNORE INTO photos (id, owner_type, owner_id, category, url) VALUES ('ph-50-future-1', 'student', '50', 'future', 'photos/50/future-1.jpg');
INSERT OR IGNORE INTO photos (id, owner_type, owner_id, category, url) VALUES ('ph-50-pet', 'student', '50', 'pet', 'photos/50/pet.jpg');
INSERT OR IGNORE INTO photos (id, owner_type, owner_id, category, url) VALUES ('ph-msg-50-from-12', 'message', 'msg-50-from-12', 'handwritten', 'photos/messages/50-from-12.jpg');

-- ─── 老师数据 ────────────────────────────────────────
INSERT OR IGNORE INTO teachers (id, name, subject, subject_en, role, is_head_teacher, photo_url, quote, message)
VALUES ('T01', '周 黎', '语文', 'CHINESE', '班主任 · 语文老师', 1, 'photos/teachers/t01.jpg', '六年的时光，看着你们从稚童长成少年。愿你们带着善良与勇气，走向更广阔的星辰大海。', '');

INSERT OR IGNORE INTO teachers (id, name, subject, subject_en, role, is_head_teacher, photo_url, quote, message)
VALUES ('T02', '', '数学', 'MATH', '数学老师', 0, '', '', '');

INSERT OR IGNORE INTO teachers (id, name, subject, subject_en, role, is_head_teacher, photo_url, quote, message)
VALUES ('T03', '', '英语', 'ENGLISH', '英语老师', 0, '', '', '');

INSERT OR IGNORE INTO teachers (id, name, subject, subject_en, role, is_head_teacher, photo_url, quote, message)
VALUES ('T04', '', '美术', 'ART', '美术老师', 0, '', '', '');

INSERT OR IGNORE INTO teachers (id, name, subject, subject_en, role, is_head_teacher, photo_url, quote, message)
VALUES ('T05', '', '科学', 'SCIENCE', '科学老师', 0, '', '', '');

INSERT OR IGNORE INTO teachers (id, name, subject, subject_en, role, is_head_teacher, photo_url, quote, message)
VALUES ('T06', '', '体育', 'SPORTS', '体育老师', 0, '', '', '');

INSERT OR IGNORE INTO teachers (id, name, subject, subject_en, role, is_head_teacher, photo_url, quote, message)
VALUES ('T07', '', '品德', 'MORAL', '品德老师', 0, '', '', '');

INSERT OR IGNORE INTO teachers (id, name, subject, subject_en, role, is_head_teacher, photo_url, quote, message)
VALUES ('T08', '', '其他', 'OTHER', '其他老师（预留）', 0, '', '', '');

-- ─── 公开留言墙 ──────────────────────────────────────
INSERT OR IGNORE INTO messages (id, from_student_id, from_name, to_student_id, avatar_url, text, photo_url, caption, type, is_approved)
VALUES ('M001', '12', '李小明', null, null, '致我们最美好的六年', 'photos/messages/wall-001.jpg', '致我们最美好的六年', 'wall', 1);

INSERT OR IGNORE INTO photos (id, owner_type, owner_id, category, url) VALUES ('ph-wall-001', 'message', 'M001', 'wall', 'photos/messages/wall-001.jpg');
