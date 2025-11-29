import type { Core } from '@strapi/strapi';

const validateArticleData = (data: any) => {
  const errors: string[] = [];

  if (!data?.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (!data?.content) {
    errors.push('Content is required');
  }

  if (!data?.category) {
    errors.push('Category is required');
  }

  if (data.excerpt && data.excerpt.length > 500) {
    errors.push('Excerpt must be less than 500 characters');
  }

  if (data.slug) {
    if (data.slug.length > 100) {
      errors.push('Slug must be less than 100 characters');
    }
    if (!/^[a-z0-9-]+$/.test(data.slug)) {
      errors.push('Slug can only contain lowercase letters, numbers and hyphens');
    }
  }

  if (data.readingTime && (data.readingTime < 0 || data.readingTime > 1000)) {
    errors.push('Reading time must be between 0 and 1000 minutes');
  }

  return errors;
};

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\u0400-\u04FF ]+/g, '')
    .replace(/ +/g, '-')
    .substring(0, 100);
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: any) {
    try {
      const entities = await strapi.entityService.findMany('api::article.article', {
        ...ctx.query,
        populate: ['coverImage', 'category', 'author'],
      });
      return entities;
    } catch (err) {
      console.error('Find articles error:', err);
      return ctx.internalServerError('Error fetching articles');
    }
  },

  async findOne(ctx: any) {
    try {
      const { id } = ctx.params;

      if (!id || isNaN(parseInt(id))) {
        return ctx.badRequest('Invalid article ID');
      }

      const entity = await strapi.entityService.findOne('api::article.article', id, {
        ...ctx.query,
        populate: ['coverImage', 'category', 'author'],
      });

      if (!entity) {
        return ctx.notFound('Article not found');
      }

      return entity;
    } catch (err) {
      console.error('FindOne article error:', err);
      return ctx.internalServerError('Error fetching article');
    }
  },

  async findBySlug(ctx: any) {
    try {
      const { slug } = ctx.params;

      if (!slug || slug.trim().length === 0) {
        return ctx.badRequest('Slug is required');
      }

      const entities = await strapi.entityService.findMany('api::article.article', {
        filters: { slug },
        populate: ['coverImage', 'category', 'author'],
      });
      
      if (entities.length === 0) {
        return ctx.notFound('Article not found');
      }
      
      return entities[0];
    } catch (err) {
      console.error('FindBySlug article error:', err);
      return ctx.internalServerError('Error fetching article by slug');
    }
  },

  async findFeatured(ctx: any) {
    try {
      const entities = await strapi.entityService.findMany('api::article.article', {
        filters: { isFeatured: true },
        populate: ['coverImage', 'category', 'author'],
        sort: { publishDate: 'desc' },
        ...ctx.query
      });
      return entities;
    } catch (err) {
      console.error('FindFeatured articles error:', err);
      return ctx.internalServerError('Error fetching featured articles');
    }
  },

  async create(ctx: any) {
    try {
      const { data } = ctx.request.body;
      const user = ctx.state.user;

      // Валидация авторизации - 401
      if (!user) {
        return ctx.unauthorized('Authentication required');
      }

      // Валидация входных данных - 400
      const validationErrors = validateArticleData(data);
      if (validationErrors.length > 0) {
        return ctx.badRequest('Validation failed', { errors: validationErrors });
      }

      if (!data.slug && data.title) {
        data.slug = generateSlug(data.title);
      }

      data.author = user.id;

      const entity = await strapi.entityService.create('api::article.article', {
        data,
        populate: ['coverImage', 'category', 'author'],
      });

      return entity;
    } catch (err: any) {
      console.error('Create article error:', err);

      // Обработка уникальных constraint ошибок - 400
      if (err.message.includes('unique') || err.message.includes('duplicate')) {
        return ctx.badRequest('Article with this slug already exists');
      }

      // Обработка validation ошибок - 400
      if (err.name === 'ValidationError') {
        return ctx.badRequest('Data validation failed', { details: err.details });
      }

      // Общая ошибка сервера - 500
      return ctx.internalServerError('Error creating article');
    }
  },

  async update(ctx: any) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      const user = ctx.state.user;

      // Валидация авторизации - 401
      if (!user) {
        return ctx.unauthorized('Authentication required');
      }

      // Валидация ID - 400
      if (!id || isNaN(parseInt(id))) {
        return ctx.badRequest('Invalid article ID');
      }

      // Проверка существования статьи - 404
      const existingArticle: any = await strapi.entityService.findOne('api::article.article', parseInt(id), {
        populate: ['author']
      });

      if (!existingArticle) {
        return ctx.notFound('Article not found');
      }

      // Проверка прав доступа - 403
      const isAuthor = existingArticle.author?.id === user.id;
      const isEditor = user.role?.name === 'editor';

      if (!isAuthor && !isEditor) {
        return ctx.forbidden('You can only update your own articles');
      }

      // Валидация данных - 400
      const validationErrors = validateArticleData(data);
      if (validationErrors.length > 0) {
        return ctx.badRequest('Validation failed', { errors: validationErrors });
      }

      const entity = await strapi.entityService.update('api::article.article', parseInt(id), {
        data,
        populate: ['coverImage', 'category', 'author'],
      });

      return entity;
    } catch (err: any) {
      console.error('Update article error:', err);

      if (err.message.includes('unique') || err.message.includes('duplicate')) {
        return ctx.badRequest('Article with this slug already exists');
      }

      if (err.name === 'ValidationError') {
        return ctx.badRequest('Data validation failed', { details: err.details });
      }

      return ctx.internalServerError('Error updating article');
    }
  },

  async delete(ctx: any) {
    try {
      const { id } = ctx.params;
      const user = ctx.state.user;

      // Валидация авторизации - 401
      if (!user) {
        return ctx.unauthorized('Authentication required');
      }

      // Валидация ID - 400
      if (!id || isNaN(parseInt(id))) {
        return ctx.badRequest('Invalid article ID');
      }

      // Проверка существования статьи - 404
      const existingArticle: any = await strapi.entityService.findOne('api::article.article', parseInt(id), {
        populate: ['author']
      });

      if (!existingArticle) {
        return ctx.notFound('Article not found');
      }

      // Проверка прав доступа - 403
      const isAuthor = existingArticle.author?.id === user.id;
      const isEditor = user.role?.name === 'editor';

      if (!isAuthor && !isEditor) {
        return ctx.forbidden('You can only delete your own articles');
      }

      const entity = await strapi.entityService.delete('api::article.article', parseInt(id));
      
      console.log(`🗑 Article "${existingArticle.title}" deleted by user ${user.id}`);
      return entity;
    } catch (err) {
      console.error('Delete article error:', err);
      return ctx.internalServerError('Error deleting article');
    }
  },

  async publish(ctx: any) {
    try {
      const { id } = ctx.params;
      const user = ctx.state.user;

      // Валидация авторизации - 401
      if (!user) {
        return ctx.unauthorized('Authentication required');
      }

      // Проверка прав (только editor) - 403
      if (user.role?.name !== 'editor') {
        return ctx.forbidden('Only editors can publish articles');
      }

      // Валидация ID - 400
      if (!id || isNaN(parseInt(id))) {
        return ctx.badRequest('Invalid article ID');
      }

      const entity = await strapi.entityService.update('api::article.article', parseInt(id), {
        data: { publishedAt: new Date() },
        populate: ['coverImage', 'category', 'author'],
      });

      return entity;
    } catch (err) {
      console.error('Publish article error:', err);
      return ctx.internalServerError('Error publishing article');
    }
  },

  async unpublish(ctx: any) {
    try {
      const { id } = ctx.params;
      const user = ctx.state.user;

      // Валидация авторизации - 401
      if (!user) {
        return ctx.unauthorized('Authentication required');
      }

      // Проверка прав (только editor) - 403
      if (user.role?.name !== 'editor') {
        return ctx.forbidden('Only editors can unpublish articles');
      }

      // Валидация ID - 400
      if (!id || isNaN(parseInt(id))) {
        return ctx.badRequest('Invalid article ID');
      }

      const entity = await strapi.entityService.update('api::article.article', parseInt(id), {
        data: { publishedAt: null },
        populate: ['coverImage', 'category', 'author'],
      });

      return entity;
    } catch (err) {
      console.error('Unpublish article error:', err);
      return ctx.internalServerError('Error unpublishing article');
    }
  },
});