export default {
  routes: [
    // GET маршруты (уже есть)
    {
      method: 'GET',
      path: '/articles',
      handler: 'article.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/articles/:id',
      handler: 'article.findOne', 
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/articles/slug/:slug',
      handler: 'article.findBySlug',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    
    // ДОБАВЬТЕ ЭТИ МАРШРУТЫ:
    // POST маршрут - создание
    {
      method: 'POST',
      path: '/articles',
      handler: 'article.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // PUT маршрут - обновление
    {
      method: 'PUT',
      path: '/articles/:id',
      handler: 'article.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // DELETE маршрут - удаление
    {
      method: 'DELETE',
      path: '/articles/:id',
      handler: 'article.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Publish маршрут - публикация (для Draft & Publish)
    {
      method: 'POST',
      path: '/articles/:id/publish',
      handler: 'article.publish',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Unpublish маршрут - снятие с публикации
    {
      method: 'POST',
      path: '/articles/:id/unpublish',
      handler: 'article.unpublish',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};