# 🎮 Game Picker — UMB & АГС

Приложение для выбора игр для совместной игры. Полностью статическое — работает без сервера, данные хранятся в localStorage браузера.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Возможности

- 📚 **Библиотека игр** с обложками из Steam
- 👥 **Отдельные профили** для каждого игрока
- ⭐ **Списки желаний** — персональные
- ✨ **50+ рекомендаций** на основе пересечения интересов
- 🎲 **Рулетка** — случайный выбор
- 💾 **Сохранение** — всё хранится в браузере

## 🚀 Деплой на Vercel (бесплатно)

### Шаг 1. Залейте на GitHub

```bash
git init
git add .
git commit -m "Game Picker"
git remote add origin https://github.com/ВАШ_ЛОГИН/game-picker.git
git push -u origin main
```

### Шаг 2. Деплой

1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите **"Add New Project"**
3. Выберите ваш репозиторий
4. Нажмите **Deploy**

Всё! Никаких переменных окружения не нужно.

## 🛠 Локальная разработка

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 📁 Структура

```
src/
├── app/
│   ├── page.tsx        # Главная страница (всё приложение)
│   ├── layout.tsx      # Layout
│   ├── globals.css     # Стили
│   └── api/health/     # Health check (для Vercel)
└── lib/
    ├── storage.ts      # Работа с localStorage
    └── seed-data.ts    # Начальные данные (игры, рекомендации)
```

## 💾 Данные

Все изменения сохраняются в localStorage браузера:
- Изменения статусов игр
- Добавленные игры
- Отклонённые рекомендации

Кнопка **↺** в хедере сбрасывает данные к начальным.

## 🔧 Технологии

- **Next.js 16** — React фреймворк
- **Tailwind CSS 4** — стилизация
- **TypeScript** — типизация
- **localStorage** — хранение данных

## 📝 Лицензия

MIT
