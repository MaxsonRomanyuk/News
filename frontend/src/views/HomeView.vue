<template>
  <div class="home">
    <!-- Хедер -->
    <header class="site-header">
      <div class="container">
        <h1 class="site-title">Новостной Портал</h1>
        <p class="site-subtitle">Самые свежие и интересные новости</p>
      </div>
    </header>

    
    <main class="main-content">
      <div class="container">
        <!-- Баннер -->
        <section class="featured-banner" v-if="featuredArticles.length > 0">
          <div class="banner-content">
            <h2>Главная новость</h2>
            <div class="featured-article" @click="goToArticle(featuredArticles[0].slug)">
              <div class="featured-image" v-if="featuredArticles[0].coverImage">
                <img :src="getImageUrl(featuredArticles[0].coverImage)" :alt="featuredArticles[0].title">
              </div>
              <div class="featured-text">
                <span class="category-tag">{{ featuredArticles[0].category?.name }}</span>
                <h3>{{ featuredArticles[0].title }}</h3>
                <p class="excerpt">{{ featuredArticles[0].excerpt }}</p>
                <div class="meta">
                  <span class="date">{{ formatDate(featuredArticles[0].publishedDate) }}</span>
                  <span class="views">👁️ {{ featuredArticles[0].views }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        
        <section class="news-grid">
          <div class="section-header">
            <h2>Последние новости</h2>
            <div class="filters">
              <select v-model="selectedCategory" @change="applyFilters" class="category-filter">
                <option value="">Все категории</option>
                <option v-for="category in categories" :key="category.id" :value="category.slug">
                  {{ category.name }}
                </option>
              </select>
            </div>
          </div>

          
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Загружаем новости...</p>
          </div>

          <div v-else-if="error" class="error-state">
            <p>😞 {{ error }}</p>
            <button @click="fetchArticles(1)" class="retry-btn">Попробовать снова</button>
          </div>

          <div v-else-if="!hasArticles" class="empty-state">
            <p>📰 Новостей пока нет</p>
          </div>

          
          <div v-else class="articles-grid">
            <article 
              v-for="article in articles" 
              :key="article.id" 
              class="article-card"
              @click="goToArticle(article.slug)"
            >
              <div class="card-image" v-if="article.coverImage">
                <img :src="getImageUrl(article.coverImage)" :alt="article.title">
                <span v-if="article.isFeatured" class="featured-badge">Избранное</span>
              </div>
              <div class="card-content">
                <div class="card-header">
                  <span class="category">{{ article.category?.name }}</span>
                  <span class="reading-time" v-if="article.readingTime">
                    {{ article.readingTime }} мин
                  </span>
                </div>
                <h3 class="card-title">{{ article.title }}</h3>
                <p class="card-excerpt">{{ article.excerpt }}</p>
                <div class="card-footer">
                  <div class="meta">
                    <span class="date">{{ formatDate(article.publishedDate) }}</span>
                    <span class="views">👁️ {{ article.views }}</span>
                  </div>
                  <button class="read-more">Читать →</button>
                </div>
              </div>
            </article>
          </div>

          
          <div v-if="totalPages > 1" class="pagination">
            <button 
              @click="goToPage(currentPage - 1)" 
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              ← Назад
            </button>
            
            <span class="page-info">
              Страница {{ currentPage }} из {{ totalPages }}
            </span>
            
            <button 
              @click="goToPage(currentPage + 1)" 
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              Вперед →
            </button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNewsStore } from '@/stores/news';
import api from '@/services/api';

const router = useRouter();
const newsStore = useNewsStore();

const categories = ref<any[]>([]);
const selectedCategory = ref('');

const { articles, loading, error, pagination, hasArticles, currentPage, totalPages } = newsStore;

const featuredArticles = computed(() => {
  return articles.filter(article => article.isFeatured).slice(0, 1);
});

const fetchCategories = async () => {
  try {
    console.log('Fetching categories...');
    const response = await api.get('/categories');
    console.log('Categories response:', response.data);
    
    categories.value = response.data.data || response.data;
    
    console.log('Processed categories:', categories.value);
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    console.error('Error details:', err.response?.data);
  }
};

const applyFilters = () => {
  newsStore.fetchArticles(1);
};

const getImageUrl = (coverImage: any): string => {
  if (coverImage?.url) {
    return `http://localhost:1337${coverImage.url}`;
  }
  return '/placeholder-news.jpg';
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const goToArticle = (slug: string) => {
  router.push(`/article/${slug}`);
};

const goToPage = (page: number) => {
  newsStore.fetchArticles(page);
};

onMounted(async () => {
  await fetchCategories();
  newsStore.fetchArticles(1);
});
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.site-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 60px 0;
  text-align: center;
  color: white;
}

.site-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.site-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  font-weight: 300;
}

.main-content {
  background: white;
  border-radius: 30px 30px 0 0;
  margin-top: -30px;
  position: relative;
  min-height: 80vh;
}

/* Баннер главной новости */
.featured-banner {
  padding: 60px 0 40px;
}

.banner-content h2 {
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 20px;
  text-align: center;
}

.featured-article {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  color: white;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.featured-article:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.3);
}

.featured-image {
  flex: 1;
  min-height: 300px;
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-text {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.category-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  align-self: flex-start;
  margin-bottom: 20px;
}

.featured-text h3 {
  font-size: 2rem;
  margin-bottom: 15px;
  line-height: 1.3;
}

.excerpt {
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
  margin-bottom: 20px;
}

.meta {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  opacity: 0.8;
}

.news-grid {
  padding: 40px 0 80px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: 2rem;
  color: #333;
}

.category-filter {
  padding: 10px 15px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.category-filter:focus {
  outline: none;
  border-color: #667eea;
}

/* Состояния */
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
}

.retry-btn:hover {
  background: #5a6fd8;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.article-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f8f9fa;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-card:hover .card-image img {
  transform: scale(1.05);
}

.featured-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #ff6b6b;
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.card-content {
  padding: 25px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.category {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.reading-time {
  color: #666;
  font-size: 0.8rem;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  line-height: 1.4;
  color: #333;
}

.card-excerpt {
  color: #666;
  line-height: 1.5;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta {
  display: flex;
  gap: 15px;
  font-size: 0.8rem;
  color: #999;
}

.read-more {
  background: transparent;
  color: #667eea;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s ease;
}

.read-more:hover {
  color: #5a6fd8;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
}

.pagination-btn {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #5a6fd8;
}

.pagination-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-weight: 500;
}

@media (max-width: 768px) {
  .site-title {
    font-size: 2rem;
  }
  
  .featured-article {
    flex-direction: column;
  }
  
  .featured-text {
    padding: 25px;
  }
  
  .featured-text h3 {
    font-size: 1.5rem;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
}
</style>