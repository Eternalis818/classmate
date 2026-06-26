-- ─────────────────────────────────────────────────────
-- 时光纪念册 · 数据库初始化 (Cloudflare D1 / SQLite)
-- 执行: wrangler d1 execute gradbook-db --file=./migrations/0001_init.sql --remote
-- ─────────────────────────────────────────────────────

-- ─── 学生表 ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id              TEXT PRIMARY KEY,           -- "01"-"55"
  name            TEXT,
  nickname        TEXT,
  student_number  TEXT,
  class           TEXT,
  school          TEXT,
  tags            TEXT,                       -- JSON 数组
  motto           TEXT,
  highlights      TEXT,                       -- JSON 数组
  abilities_swim  INTEGER DEFAULT 0,
  abilities_tech  INTEGER DEFAULT 0,
  abilities_resp  INTEGER DEFAULT 0,
  pet_json        TEXT,                       -- 整体 JSON: {name,type,photo,desc} 或 null
  future_letter   TEXT,
  template        TEXT NOT NULL,              -- 主题 ID
  stickers        TEXT,                       -- JSON 数组
  is_founder      INTEGER DEFAULT 0,
  is_public       INTEGER DEFAULT 1,
  password_hash   TEXT,                       -- SHA-256 + 盐哈希（见 functions/_shared/auth.ts）
  created_at      INTEGER DEFAULT (unixepoch()),
  updated_at      INTEGER DEFAULT (unixepoch())
);

-- ─── 老师表 ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
  id              TEXT PRIMARY KEY,           -- "T01"-"T08"
  name            TEXT,
  subject         TEXT,
  subject_en      TEXT,
  role            TEXT,
  is_head_teacher INTEGER DEFAULT 0,
  photo_url       TEXT,
  quote           TEXT,
  message         TEXT,
  created_at      INTEGER DEFAULT (unixepoch()),
  updated_at      INTEGER DEFAULT (unixepoch())
);

-- ─── 留言表（统一存个人 + 公开墙）──────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY,           -- uuid
  from_student_id TEXT,
  from_name       TEXT NOT NULL,
  to_student_id   TEXT,                       -- NULL = 公开墙
  avatar_url      TEXT,
  text            TEXT NOT NULL,
  handwritten_url TEXT,
  photo_url       TEXT,                       -- 公开墙照片
  caption         TEXT,
  type            TEXT NOT NULL CHECK(type IN ('personal','wall')),
  is_approved     INTEGER DEFAULT 0,          -- 审核（防霸凌/不当内容）
  created_at      INTEGER DEFAULT (unixepoch())
);

-- ─── 照片元数据 ────────────────────────────────────
CREATE TABLE IF NOT EXISTS photos (
  id              TEXT PRIMARY KEY,
  owner_type      TEXT NOT NULL,              -- 'student' / 'teacher' / 'message' / 'theme'
  owner_id        TEXT,
  category        TEXT,                       -- 'avatar' / 'life' / 'pet' / 'handwritten' / 'wall'
  url             TEXT NOT NULL,
  width           INTEGER,
  height          INTEGER,
  file_size       INTEGER,
  created_at      INTEGER DEFAULT (unixepoch())
);

-- ─── 索引 ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_messages_to_student ON messages(to_student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_approved ON messages(is_approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_owner ON photos(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_students_template ON students(template);
CREATE INDEX IF NOT EXISTS idx_students_public ON students(is_public, id);
