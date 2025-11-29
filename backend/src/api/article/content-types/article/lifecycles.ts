'use strict';

module.exports = {
  async afterFindOne(event) {
    const { result } = event;
    
    if (result && result.id) {
      try {
        const shouldIncrement = result.publishDate && 
                              !event.params?.filters?.id?.$in && 
                              !event.params?.pagination;
        
        if (shouldIncrement) {
          console.log(`🔍 Incrementing views for article: ${result.title}`);

          await strapi.service('api::article.article').incrementViews(result.id);
        }
      } catch (error) {
        console.error('❌ Error in afterFindOne lifecycle:', error);

      }
    }
  },
};