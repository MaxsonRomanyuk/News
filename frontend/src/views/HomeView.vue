<template>
  <div class="home">
    <header class="site-header">
      <div class="container">
        <h1 class="site-title">Новостной Портал</h1>
        <p class="site-subtitle">Самые свежие и интересные новости</p>
      </div>
    </header>


    <main class="main-content">
      <div class="container">
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
                  <span class="date">{{ formatDate(featuredArticles[0].publishDate) }}</span>
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
              <div class="filter-group">
                <select v-model="selectedCategory" @change="applyCategoryFilter" class="category-filter">
                  <option value="">Все категории</option>
                  <option v-for="category in categories" :key="category.id" :value="category.attributes?.slug || category.slug">
                    {{ category.attributes?.name || category.name }}
                  </option>
                </select>
              </div>

              <div class="filter-group">
                <input
                  v-model="tagFilter"
                  @input="applyTagFilter"
                  placeholder="Фильтр по тегам..."
                  class="tag-filter-input"
                  type="text"
                >
              </div>

              <div class="filter-group">
                <label class="checkbox-filter">
                  <input 
                    type="checkbox" 
                    v-model="showFeaturedOnly"
                    @change="applyFeaturedFilter"
                  >
                  <span class="checkmark"></span>
                  Только избранные
                </label>
              </div>

              <div class="filter-group">
                <button 
                  @click="clearAllFilters" 
                  class="clear-filters-btn"
                  :disabled="!newsStore.hasActiveFilters"
                >
                  ❌ Сбросить фильтры
                </button>
              </div>
            </div>
          </div>

          <div v-if="newsStore.hasActiveFilters" class="active-filters">
            <span class="filters-label">Активные фильтры:</span>
            <span v-if="newsStore.filters.category" class="filter-badge">
              Категория: {{ getCategoryName(newsStore.filters.category) }}
              <button @click="removeCategoryFilter" class="remove-filter">×</button>
            </span>
            <span v-if="newsStore.filters.isFeatured" class="filter-badge">
              Только избранные
              <button @click="removeFeaturedFilter" class="remove-filter">×</button>
            </span>
            <span v-if="newsStore.filters.tags.length > 0" class="filter-badge" v-for="tag in newsStore.filters.tags" :key="tag">
               Тег: {{ tag }}
              <button @click="removeTagFilter(tag)" class="remove-filter">×</button>
            </span>
          </div>

          <div v-if="newsStore.loading" class="loading-state">
            <div class="spinner"></div>
            <p>Загружаем новости...</p>
          </div>

          <div v-else-if="newsStore.error" class="error-state">
            <p>😞 {{ newsStore.error }}</p>
            <button @click="newsStore.fetchArticles(1)" class="retry-btn">Попробовать снова</button>
          </div>

          <div v-else-if="!newsStore.hasArticles" class="empty-state">
            <p>📰 {{ newsStore.hasActiveFilters ? 'Новостей по выбранным фильтрам не найдено' : 'Новостей пока нет' }}</p>
            <button v-if="newsStore.hasActiveFilters" @click="clearAllFilters" class="retry-btn">
              Показать все новости
            </button>
          </div>

          <div v-else class="articles-grid">
            <article 
              v-for="article in newsStore.articles" 
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
                  <span class="category">
                    {{ article.category?.name }}
                  </span>
                  <span class="reading-time" v-if="article.readingTime">
                    {{ article.readingTime }} мин
                  </span>
                </div>
                <h3 class="card-title">{{ article.title }}</h3>
                <p class="card-excerpt">{{ article.excerpt }}</p>
                <div class="article-tags" v-if="getArticleTags(article).length > 0">
                  <span v-for="tag in getArticleTags(article)" :key="tag" class="tag">
                    {{ tag }}
                  </span>
                </div>
                <div class="card-footer">
                  <div class="meta">
                    <span class="date">
                      {{ formatDate(article.attributes?.publishDate || article.attributes?.publishedAt || article.publishDate) }}
                    </span>
                    <span class="views">👁️ {{ article.views || 0 }}</span>
                  </div>
                  <button class="read-more">Читать →</button>
                </div>
              </div>
            </article>
          </div>

          <div v-if="newsStore.totalPages > 1" class="pagination">
            <button 
              @click="goToPage(newsStore.currentPage - 1)" 
              :disabled="newsStore.currentPage === 1"
              class="pagination-btn prev-btn"
            >
              ← Назад
            </button>
            
            <div class="page-numbers">
              <button 
                v-for="page in visiblePages" 
                :key="page"
                @click="goToPage(page)"
                :class="{
                  'page-btn': true,
                  'active': page === newsStore.currentPage
                }"
              >
                {{ page }}
              </button>
              
              <span v-if="hasMorePages" class="page-ellipsis">...</span>
            </div>
            
            <span class="page-info">
              Страница {{ newsStore.currentPage }} из {{ newsStore.totalPages }}
              <span v-if="newsStore.pagination.total">(всего: {{ newsStore.pagination.total }})</span>
            </span>
            
            <button 
              @click="goToPage(newsStore.currentPage + 1)" 
              :disabled="newsStore.currentPage === newsStore.totalPages"
              class="pagination-btn next-btn"
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
const showFeaturedOnly = ref(false);

const { articles, loading, error, pagination, hasArticles, currentPage, totalPages } = newsStore;

const tagFilter = ref('');
let tagFilterTimeout: NodeJS.Timeout | null = null;

const featuredArticles = computed(() => {
  return newsStore.articles.filter(article => {
    const isFeatured = article.attributes?.isFeatured || article.isFeatured;
    return isFeatured;
  }).slice(0, 1);
});

const visiblePages = computed(() => {
  const current = newsStore.currentPage;
  const total = newsStore.totalPages;
  const pages = [];
  
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    pages.push(i);
  }
  
  return pages;
});

const hasMorePages = computed(() => {
  return newsStore.totalPages > visiblePages.value.length;
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

const applyTagFilter = () => {
  if (tagFilterTimeout) {
    clearTimeout(tagFilterTimeout);
  }
  
  tagFilterTimeout = setTimeout(() => {
    console.log('🏷️ Applying tag filter:', tagFilter.value);
    
    if (tagFilter.value.trim()) {
      const tags = tagFilter.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      newsStore.setTagFilter(tags);
    } else {
      newsStore.setTagFilter([]);
    }
  }, 600); 
};


const removeTagFilter = (tagToRemove: string) => {
  console.log('❌ Removing tag filter:', tagToRemove);
  const updatedTags = newsStore.filters.tags.filter(tag => tag !== tagToRemove);
  newsStore.setTagFilter(updatedTags);
  
  if (updatedTags.length === 0) {
    tagFilter.value = '';
  }
};

const getArticleTags = (article: any): string[] => {
  const tags = article.attributes?.tags || article.tags;
  
  if (Array.isArray(tags)) {
    return tags;
  }
  
  if (typeof tags === 'string') {
    try {
      const parsedTags = JSON.parse(tags);
      if (Array.isArray(parsedTags)) {
        return parsedTags;
      }
    } catch (e) {
      return tags ? [tags] : [];
    }
  }
  
  return [];
};

const applyCategoryFilter = () => {
  newsStore.setCategoryFilter(selectedCategory.value);
};

const applyFeaturedFilter = () => {
  newsStore.setFeaturedFilter(showFeaturedOnly.value);
};

const clearAllFilters = () => {
  selectedCategory.value = '';
  showFeaturedOnly.value = false;
  newsStore.clearFilters();
};

const removeCategoryFilter = () => {
  selectedCategory.value = '';
  newsStore.setCategoryFilter('');
};

const removeFeaturedFilter = () => {
  showFeaturedOnly.value = false;
  newsStore.setFeaturedFilter(false);
};

const getCategoryName = (categorySlug: string): string => {
  const category = categories.value.find(
    cat => (cat.attributes?.slug || cat.slug) === categorySlug
  );
  return category?.attributes?.name || category?.name || categorySlug;
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
  await newsStore.fetchArticles(1);
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

.filters {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
}
.tag-filter-input {
  padding: 10px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  min-width: 200px;
}

.tag-filter-input:focus {
  outline: none;
  border-color: #667eea;
}
.article-tags {
  margin: 10px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.tag {
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #666;
}
.category-filter {
  padding: 10px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.checkbox-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-filter input {
  margin: 0;
}

.clear-filters-btn {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.clear-filters-btn:hover:not(:disabled) {
  background: #5a6268;
}

.clear-filters-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.active-filters {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filters-label {
  font-weight: 600;
  color: #666;
}

.filter-badge {
  background: #667eea;
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-filter {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
  flex-wrap: wrap;
}

.page-numbers {
  display: flex;
  gap: 8px;
  align-items: center;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  min-width: 40px;
}

.page-btn:hover {
  background: #f8f9fa;
}

.page-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.page-ellipsis {
  padding: 8px 4px;
  color: #666;
}

.page-info {
  color: #666;
  font-size: 0.9rem;
}

.pagination-btn {
  padding: 10px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.pagination-btn:hover:not(:disabled) {
  background: #5a6fd8;
}

.pagination-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}



@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .pagination {
    flex-direction: column;
    gap: 15px;
  }
  
  .page-numbers {
    order: 2;
  }
  
  .page-info {
    order: 3;
  }
  
  .active-filters {
    flex-direction: column;
    align-items: flex-start;
  }
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