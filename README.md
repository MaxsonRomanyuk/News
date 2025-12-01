# News Website API

## Оглавление
- [Базовый URL](#базовый-url)
- [Аутентификация](#аутентификация)
- [Статьи (Articles)](#статьи-articles)
- [Категории (Categories)](#категории-categories)
- [Пользователи (Users)](#пользователи-users)
- [Аудит-логи (Audit Logs)](#аудит-логи-audit-logs)
- [Коды ответов](#коды-ответов)

## Базовый URL
http://localhost:1337/api

## Аутентификация

### Регистрация пользователя
POST /auth/local/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword"
}

### Авторизация пользователя
POST /auth/local
Content-Type: application/json

{
  "identifier": "john@example.com",
  "password": "securepassword"
}

## Статьи(Articles)
### Получить список статей
GET /articles?populate=coverImage,category,author&sort=publishedAt:desc&pagination[page]=1&pagination[pageSize]=10
### Получить статью по ID
GET /articles/1?populate=coverImage,category,author
### Получить статью по slug
GET /articles/slug/article-slug-here?populate=coverImage,category,author
### Получить избранные статьи
GET /articles/featured?populate=coverImage,category,author
### Создать статью
POST /articles
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "data": {
    "title": "Заголовок статьи",
    "slug": "article-slug",
    "content": "Текст статьи...",
    "excerpt": "Краткое описание",
    "category": 1,
    "isFeatured": false,
    "readingTime": 5,
    "tags": ["технологии", "новости"]
  }
}
### Обновить статью
PUT /articles/1
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "data": {
    "title": "Обновленный заголовок",
    "content": "Обновленный текст..."
  }
}
### Удалить статью
DELETE /articles/1
Authorization: Bearer {jwt_token}
### Опубликовать статью(только Editor)
POST /articles/1/publish
Authorization: Bearer {jwt_token}

## Категории (Categories)
### Получить список категорий
GET /categories
### Получить категорию по ID
GET /categories/1

## Пользователи (Users)
### Получить текущего пользователя
GET /users/me
Authorization: Bearer {jwt_token}

## Аудит-логи
### Получить логи
GET /audit-logs?sort=createdAt:desc
Authorization: Bearer {jwt_token}

## Коды ответов
Код - описание  
=======
\# News Website API



\## Оглавление

\- \[Базовый URL](#базовый-url)

\- \[Аутентификация](#аутентификация)

\- \[Статьи (Articles)](#статьи-articles)

\- \[Категории (Categories)](#категории-categories)

\- \[Пользователи (Users)](#пользователи-users)

\- \[Аудит-логи (Audit Logs)](#аудит-логи-audit-logs)

\- \[Коды ответов](#коды-ответов)



\## Базовый URL

http://localhost:1337/api



\## Аутентификация



\### Регистрация пользователя

POST /auth/local/register

Content-Type: application/json



{

&nbsp; "username": "john\_doe",

&nbsp; "email": "john@example.com",

&nbsp; "password": "securepassword"

}



\### Авторизация пользователя

POST /auth/local

Content-Type: application/json



{

&nbsp; "identifier": "john@example.com",

&nbsp; "password": "securepassword"

}



\## Статьи(Articles)

\### Получить список статей

GET /articles?populate=coverImage,category,author\&sort=publishedAt:desc\&pagination\[page]=1\&pagination\[pageSize]=10

\### Получить статью по ID

GET /articles/1?populate=coverImage,category,author

\### Получить статью по slug

GET /articles/slug/article-slug-here?populate=coverImage,category,author

\### Получить избранные статьи

GET /articles/featured?populate=coverImage,category,author

\### Создать статью

POST /articles

Authorization: Bearer {jwt\_token}

Content-Type: application/json



{

&nbsp; "data": {

&nbsp;   "title": "Заголовок статьи",

&nbsp;   "slug": "article-slug",

&nbsp;   "content": "Текст статьи...",

&nbsp;   "excerpt": "Краткое описание",

&nbsp;   "category": 1,

&nbsp;   "isFeatured": false,

&nbsp;   "readingTime": 5,

&nbsp;   "tags": \["технологии", "новости"]

&nbsp; }

}

\### Обновить статью

PUT /articles/1

Authorization: Bearer {jwt\_token}

Content-Type: application/json



{

&nbsp; "data": {

&nbsp;   "title": "Обновленный заголовок",

&nbsp;   "content": "Обновленный текст..."

&nbsp; }

}

\### Удалить статью

DELETE /articles/1

Authorization: Bearer {jwt\_token}

\### Опубликовать статью(только Editor)

POST /articles/1/publish

Authorization: Bearer {jwt\_token}



\## Категории (Categories)

\### Получить список категорий

GET /categories

\### Получить категорию по ID

GET /categories/1



\## Пользователи (Users)

\### Получить текущего пользователя

GET /users/me

Authorization: Bearer {jwt\_token}



\## Аудит-логи

\### Получить логи

GET /audit-logs?sort=createdAt:desc

Authorization: Bearer {jwt\_token}



\## Коды ответов

Код - описание

200	- Успешный запрос

201 -	Успешное создание

400 -	Неверный запрос (валидация)

401 -	Не авторизован

403 -	Доступ запрещен

404 -	Ресурс не найден

500 -	Внутренняя ошибка сервера

