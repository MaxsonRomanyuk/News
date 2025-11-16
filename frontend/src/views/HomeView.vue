<template>
  <!-- Тот же template что и раньше -->
  <div class="home">
    <h1>Последние новости</h1>
    
    <div v-if="loading" class="loading">
      Загрузка новостей...
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div v-if="hasArticles" class="news-list">
      <article 
        v-for="article in articles" 
        :key="article.id" 
        class="news-card"
      >
        <div class="news-image" v-if="article.attributes.coverImage">
          <img 
            :src="getImageUrl(article.attributes.coverImage)" 
            :alt="article.attributes.title"
          >
        </div>
        
        <div class="news-content">
          <h2>{{ article.attributes.title }}</h2>
          <p class="excerpt">{{ article.attributes.excerpt }}</p>
          
          <div class="news-meta">
            <span class="date">
              {{ formatDate(article.attributes.publishedAt) }}
            </span>
            <span class="category" v-if="article.attributes.category">
              {{ article.attributes.category.data.attributes.name }}
            </span>
          </div>
          
          <router-link 
            :to="`/article/${article.attributes.slug}`" 
            class="read-more"
          >
            Читать далее
          </router-link>
        </div>
      </article>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="goToPage(currentPage - 1)" 
        :disabled="currentPage === 1"
      >
        Назад
      </button>
      
      <span>Страница {{ currentPage }} из {{ totalPages }}</span>
      
      <button 
        @click="goToPage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
      >
        Вперед
      </button>
    </div>

    <div v-if="!loading && !hasArticles" class="no-articles">
      Новостей пока нет
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useNewsStore } from '@/stores/news';
import type { StrapiImage } from '@/types/strapi';

const newsStore = useNewsStore();

// Computed
const articles = newsStore.articles;
const loading = newsStore.loading;
const error = newsStore.error;
const hasArticles = newsStore.hasArticles;
const currentPage = newsStore.currentPage;
const totalPages = newsStore.totalPages;

// Methods
const getImageUrl = (coverImage: StrapiImage): string => {
  if (coverImage?.data?.attributes?.url) {
    return `http://localhost:1337${coverImage.data.attributes.url}`;
  }
  return '';
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

const goToPage = (page: number): void => {
  newsStore.goToPage(page);
};

// Lifecycle
onMounted(() => {
  newsStore.fetchArticles(1);
});
</script>

<style scoped>
/* Тот же CSS что и раньше */
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.news-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  gap: 20px;
}

.news-image {
  flex-shrink: 0;
  width: 200px;
}

.news-image img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.news-content {
  flex-grow: 1;
}

.news-content h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.excerpt {
  color: #666;
  margin-bottom: 15px;
}

.news-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 0.9em;
  color: #888;
}

.category {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.read-more {
  color: #007bff;
  text-decoration: none;
}

.read-more:hover {
  text-decoration: underline;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading, .error, .no-articles {
  text-align: center;
  padding: 40px;
  font-size: 1.1em;
}

.error {
  color: #d9534f;
}
</style>