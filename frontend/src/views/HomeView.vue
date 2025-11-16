<template>
  <div class="home">
    <h1>Последние новости</h1>
    
    <!-- Отладочная информация -->
    <div v-if="debug" style="background: #f0f0f0; padding: 10px; margin-bottom: 20px; border-radius: 5px;">
      <strong>Отладка:</strong><br>
      Статей: {{ articles.length }}<br>
      Загрузка: {{ loading }}<br>
      Ошибка: {{ error || 'нет' }}
    </div>
    
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
        @click="goToArticle(article.slug)"
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
          </div>
          
          <button class="read-more">
            Читать далее
          </button>
        </div>
      </article>
    </div>

    <!-- Нет новостей -->
    <div v-if="!loading && !hasArticles && !error" class="no-articles">
      Новостей пока нет
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNewsStore } from '@/stores/news';

const router = useRouter();
const newsStore = useNewsStore();
const debug = ref(true);

const { articles, loading, error, hasArticles } = newsStore;

const getImageUrl = (coverImage: any): string => {
  if (coverImage?.url) {
    return `http://localhost:1337${coverImage.url}`;
  }
  return '';
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

const goToArticle = (slug: string) => {
  router.push(`/article/${slug}`);
};

onMounted(() => {
  console.log('HomeView mounted - fetching articles');
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
  cursor: pointer;
  transition: all 0.3s ease;
}

.news-card:hover {
  transform: translateY(-2px);
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
  line-height: 1.4;
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

.read-more {
  color: #007bff;
  background: none;
  border: 1px solid #007bff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.read-more:hover {
  background: #007bff;
  color: white;
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