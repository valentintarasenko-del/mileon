# Как запустить MiLeOn — пошаговая инструкция

## Шаг 1: Настройка Supabase (база данных и хранилище фото)

1. Зайди на **supabase.com** и создай аккаунт (бесплатно)
2. Нажми **New project**, придумай название (например `mileon`)
3. Подожди пока проект создастся (~1 минута)
4. Перейди в **SQL Editor** (левое меню) → вставь содержимое файла `supabase-setup.sql` → нажми **Run**
5. Перейди в **Storage** → нажми **New bucket** → название `toys` → поставь галочку **Public** → сохрани
6. Перейди в **Settings → API** и скопируй:
   - `Project URL` → это `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` ключ → это `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` ключ → это `SUPABASE_SERVICE_ROLE_KEY` (⚠️ держи в секрете!)

## Шаг 2: Загрузка кода на GitHub

1. Зайди на **github.com** и создай аккаунт (если нет)
2. Нажми **+** → **New repository** → название `mileon` → **Create repository**
3. Открой терминал в папке `mileon` и выполни:
   ```
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/ВАШ_НИК/mileon.git
   git push -u origin main
   ```

## Шаг 3: Деплой на Vercel (хостинг, бесплатно)

1. Зайди на **vercel.com** → войди через GitHub
2. Нажми **Add New → Project** → выбери репозиторий `mileon`
3. Перед деплоем нажми **Environment Variables** и добавь три переменные:
   - `NEXT_PUBLIC_SUPABASE_URL` = вставь URL из Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = вставь anon ключ
   - `SUPABASE_SERVICE_ROLE_KEY` = вставь service_role ключ
4. Нажми **Deploy** — через ~2 минуты сайт готов!
5. Vercel даст тебе ссылку вида `mileon.vercel.app` — отправляй детям!

## Для обновлений

Любые изменения в коде — делаешь `git push` и Vercel автоматически обновит сайт.

## Локальный запуск (для разработки)

1. Скопируй `.env.local.example` → `.env.local` и вставь ключи Supabase
2. В терминале в папке `mileon`:
   ```
   npm install
   npm run dev
   ```
3. Открой браузер: `http://localhost:3000`
