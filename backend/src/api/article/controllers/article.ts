import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: any) {
    try {
      const entities = await strapi.entityService.findMany('api::article.article', {
        ...ctx.query,
        populate: ['coverImage', 'category', 'author'],
      });
      return entities;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async findOne(ctx: any) {
    try {
      const { id } = ctx.params;
      const entity = await strapi.entityService.findOne('api::article.article', id, {
        ...ctx.query,
        populate: ['coverImage', 'category', 'author'],
      });
      return entity;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async findBySlug(ctx: any) {
    try {
      const { slug } = ctx.params;
      const entity = await strapi.entityService.findMany('api::article.article', {
        filters: { slug },
        populate: ['coverImage', 'category', 'author'],
      });
      
      if (entity.length === 0) {
        return ctx.notFound('Article not found');
      }
      
      return entity[0];
    } catch (err) {
      ctx.throw(500, err);
    }
  },
  async findFeatured(ctx: any) {
    try {
      console.log('🎯 Featured endpoint called!', new Date().toISOString());
      const entities = await strapi.entityService.findMany('api::article.article', {
        filters: { isFeatured: true},
        populate: ['coverImage', 'category', 'author'],
        sort: { publishedAt: 'desc' },
        ...ctx.query
      });
    console.log(`✅ Found ${entities.length} featured articles`);
    return entities;
  } catch (err) {
    ctx.throw(500, err);
  }
  },
  async create(ctx: any) {
    try {
      const entity = await strapi.entityService.create('api::article.article', {
        ...ctx.request.body,
        populate: ['coverImage', 'category', 'author'],
      });
      return entity;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async update(ctx: any) {
    try {
      const { id } = ctx.params;
      const entity = await strapi.entityService.update('api::article.article', id, {
        ...ctx.request.body,
        populate: ['coverImage', 'category', 'author'],
      });
      return entity;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async delete(ctx: any) {
    try {
      const { id } = ctx.params;
      const entity = await strapi.entityService.delete('api::article.article', id);
      return entity;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async publish(ctx: any) {
    try {
      const { id } = ctx.params;
      const entity = await strapi.entityService.update('api::article.article', id, {
        data: { publishDate: new Date() },
        populate: ['coverImage', 'category', 'author'],
      });
      return entity;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async unpublish(ctx: any) {
    try {
      const { id } = ctx.params;
      const entity = await strapi.entityService.update('api::article.article', id, {
        data: { publishDate: null },
        populate: ['coverImage', 'category', 'author'],
      });
      return entity;
    } catch (err) {
      ctx.throw(500, err);
    }
  },
});