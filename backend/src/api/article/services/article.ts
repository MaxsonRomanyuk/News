'use strict';

module.exports = ({ strapi }) => ({
  async incrementViews(articleId) {
    try {
      const article = await strapi.entityService.findOne('api::article.article', articleId);
      
      if (article) {

        const updatedArticle = await strapi.entityService.update('api::article.article', articleId, {
          data: {
            views: (article.views || 0) + 1
          }
        });
        
        console.log(`✅ Views incremented for article ${articleId}: ${article.views || 0} → ${updatedArticle.views}`);
        return updatedArticle;
      }
      
      throw new Error(`Article with id ${articleId} not found`);
      
    } catch (error) {
      console.error('❌ Error incrementing views:', error);
      throw error;
    }
  }
});