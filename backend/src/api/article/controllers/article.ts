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
});