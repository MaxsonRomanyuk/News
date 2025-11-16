<template>
  <div class="home">
    <h1>Последние новости</h1>
    
    <div v-if="loading" class="loading">
      Загрузка новостей...
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div v-if="!loading && hasArticles" class="news-list">
      <article 
        v-for="article in articles" 
        :key="article.id" 
        class="news-card"
      >
        <div class="news-image" v-if="article.coverImage">
          <img 
            :src="getImageUrl(article.coverImage)" 
            :alt="article.title"
          >
        </div>
        
        <div class="news-content">
          <h2>{{ article.title }}</h2>
          <p class="excerpt">{{ article.excerpt }}</p>
          
          <div class="news-meta">
            <span class="date">
              {{ formatDate(article.publishedDate || article.createdAt) }}
            </span>
            <span 
              class="category" 
              v-if="article.category"
            >
              {{ article.category.name }}
            </span>
            <span 
              class="featured" 
              v-if="article.isFeatured"
              style="color: #ff6b00;"
            >
              ★ Избранное
            </span>
            <span class="reading-time" v-if="article.readingTime">
              {{ article.readingTime }} мин. чтения
            </span>
          </div>
          
          <div class="news-content-preview" v-if="article.content">
            {{ getContentPreview(article.content) }}
          </div>
          
          <router-link 
            :to="`/article/${article.slug}`" 
            class="read-more"
          >
            Читать далее
          </router-link>
        </div>
      </article>
    </div>

    <div v-if="!loading && totalPages > 1" class="pagination">
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

    <!-- Нет новостей -->
    <div v-if="!loading && !hasArticles && !error" class="no-articles">
      Новостей пока нет
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useNewsStore } from '@/stores/news';

const newsStore = useNewsStore();
const debug = ref(true); // Временно включим отладку

const { articles, loading, error, pagination, hasArticles, currentPage, totalPages } = newsStore;


const getImageUrl = (coverImage: any): string => {
  if (coverImage?.url) {
    return `http://localhost:1337${coverImage.url}`;
  }
  return '';
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getContentPreview = (content: any[]): string => {
  if (Array.isArray(content)) {
    const text = content
      .map(item => {
        if (item.children && Array.isArray(item.children)) {
          return item.children.map((child: any) => child.text || '').join('');
        }
        return '';
      })
      .join(' ')
      .substring(0, 150);
    
    return text + (text.length === 150 ? '...' : '');
  }
  return '';
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
  transition: box-shadow 0.3s ease;
}

.news-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
  font-weight: 500;
}

.news-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 0.9em;
  color: #888;
  flex-wrap: wrap;
}

.category {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.reading-time {
  color: #666;
  font-style: italic;
}

.news-content-preview {
  color: #555;
  margin-bottom: 15px;
  line-height: 1.5;
}

.read-more {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
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
  transition: background-color 0.2s ease;
}

.pagination button:hover:not(:disabled) {
  background: #f5f5f5;
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

.loading {
  color: #666;
}
</style>