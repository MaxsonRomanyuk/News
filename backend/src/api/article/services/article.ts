'use strict';

const slugify = require('slugify');

module.exports = ({ strapi }) => ({
  async create(params) {
    // Генерация slug из title, если не указан
    if (params.data.title && !params.data.slug) {
      params.data.slug = slugify(params.data.title, { 
        lower: true, 
        strict: true,
        locale: 'ru' // для русских букв
      });
    }
    return await super.create(params);
  },

  async update(params) {
    // Обновление slug при изменении title
    if (params.data.title) {
      params.data.slug = slugify(params.data.title, { 
        lower: true, 
        strict: true,
        locale: 'ru'
      });
    }
    return await super.update(params);
  }
});

function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]*>/g, ''); // Удаляем HTML теги
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

module.exports = ({ strapi }) => ({
  async create(params) {
    if (params.data.content) {
      params.data.readingTime = calculateReadingTime(params.data.content);
    }
    return await super.create(params);
  },

  async update(params) {
    if (params.data.content) {
      params.data.readingTime = calculateReadingTime(params.data.content);
    }
    return await super.update(params);
  }
});