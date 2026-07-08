# 🎮 Game Picker — UMB & АГС

Приложение для выбора игр для совместной игры. Управление коллекцией, списки желаний, рекомендации на основе пересечения интересов.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Возможности

- 📚 **Библиотека игр** с обложками из Steam
- 👥 **Отдельные профили** для каждого игрока (UMB и АГС)
- ⭐ **Списки желаний** — персональные для каждого
- ✨ **Рекомендации** — алгоритм на основе пересечения интересов
- 🎲 **Рулетка** — случайный выбор из подходящих игр
- 🔍 **Поиск в Steam** — добавление игр с автозаполнением

## 🚀 Деплой на Vercel + Neon

### 1. Создайте бесплатную БД на Neon

1. Зайдите на [neon.tech](https://neon.tech) и создайте аккаунт
2. Создайте новый проект (Free tier)
3. Скопируйте **Connection string** (выглядит как `postgresql://user:pass@host/db?sslmode=require`)

### 2. Залейте на GitHub

```bash
# Инициализируйте репозиторий
git init
git add .
git commit -m "Initial commit"

# Создайте репозиторий на GitHub и подключите
git remote add origin https://github.com/YOUR_USERNAME/game-picker.git
git branch -M main
git push -u origin main
```

### 3. Задеплойте на Vercel

1. Зайдите на [vercel.com](https://vercel.com) и авторизуйтесь через GitHub
2. Нажмите **"Add New Project"** → выберите ваш репозиторий
3. В разделе **Environment Variables** добавьте:
   - `DATABASE_URL` = ваша строка подключения Neon
4. Нажмите **Deploy**

### 4. Инициализируйте БД

После первого деплоя выполните:

```bash
# Установите Vercel CLI
npm i -g vercel

# Подключитесь к проекту
vercel link

# Запустите миграцию через Vercel
vercel env pull .env.local
npx drizzle-kit push
```

Или добавьте схему вручную через Neon SQL Editor.

## 🛠 Локальная разработка

```bash
# Установите зависимости
npm install

# Создайте .env файл
echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/game_picker" > .env

# Запустите PostgreSQL (Docker)
docker run -d --name game-picker-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=game_picker \
  -p 5432:5432 postgres:16

# Примените схему
npx drizzle-kit push

# Запустите dev сервер
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 📁 Структура проекта

```
src/
├── app/
│   ├── page.tsx          # Главная страница
│   ├── layout.tsx        # Layout с метаданными
│   ├── globals.css       # Стили Tailwind
│   └── api/
│       ├── games/        # CRUD для игр
│       ├── recommendations/  # Рекомендации
│       ├── seed/         # Начальные данные
│       └── steam-search/ # Поиск в Steam
├── db/
│   ├── index.ts          # Подключение к БД
│   └── schema.ts         # Схема Drizzle ORM
└── lib/
    ├── types.ts          # TypeScript типы
    └── seed-data.ts      # Начальные данные
```

## 🔧 Технологии

- **Next.js 16** — React фреймворк
- **Drizzle ORM** — типизированная работа с БД
- **PostgreSQL** — база данных
- **Tailwind CSS 4** — стилизация
- **TypeScript** — типизация

## 📝 Лицензия

MIT
