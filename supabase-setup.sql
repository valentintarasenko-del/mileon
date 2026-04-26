-- ============================================
-- MiLeOn — SQL для настройки базы Supabase
-- Запусти это в SQL Editor на supabase.com
-- ============================================

-- Таблица пользователей
create table if not exists users (
  id text primary key,
  name text not null,
  emoji text not null,
  coins integer not null default 500,
  created_at timestamptz default now()
);

-- Таблица объявлений
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id),
  title text not null,
  price integer not null check (price > 0),
  image_url text not null,
  sold boolean not null default false,
  buyer_id text references users(id),
  created_at timestamptz default now()
);

-- Функция для безопасного начисления монет продавцу
create or replace function add_coins(user_id text, amount integer)
returns void
language sql
security definer
as $$
  update users set coins = coins + amount where id = user_id;
$$;

-- Отключаем RLS (для простоты — всё идёт через наш сервер с service_role ключом)
alter table users disable row level security;
alter table listings disable row level security;

-- ============================================
-- Storage: создай bucket вручную
-- ============================================
-- 1. Перейди в Storage на supabase.com
-- 2. Нажми "New bucket"
-- 3. Название: toys
-- 4. Поставь галочку "Public bucket"
-- 5. Сохрани
